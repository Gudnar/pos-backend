import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import * as path from 'path'
import { Venta, EstadoVenta } from '../entity/venta.entity'
import { VentaDocumento, TIPOS_DOCUMENTO_VENTA } from '../entity/venta-documento.entity'
import { Status, Transacccion } from '../../../common/constants'

export const MAX_TAMANO_DOCUMENTO = 5 * 1024 * 1024

// Tipos aceptados, detectados por la firma del archivo (no por lo que declara el navegador)
const FIRMAS: { mime: string; ext: string; match: (b: Buffer) => boolean }[] = [
  { mime: 'application/pdf', ext: 'pdf', match: b => b.subarray(0, 4).toString('latin1') === '%PDF' },
  { mime: 'image/png', ext: 'png', match: b => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: 'image/jpeg', ext: 'jpg', match: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/webp', ext: 'webp', match: b => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' },
]

@Injectable()
export class VentaDocumentosService {
  private readonly baseDir = path.resolve(process.env.UPLOADS_DIR || 'uploads')

  constructor(
    @InjectRepository(Venta) private readonly ventaRepo: Repository<Venta>,
    @InjectRepository(VentaDocumento) private readonly docRepo: Repository<VentaDocumento>,
  ) {}

  async listar(clienteId: string, ventaId: string): Promise<VentaDocumento[]> {
    await this.obtenerVenta(clienteId, ventaId)
    return this.docRepo.find({
      where: { clienteId, ventaId, estado: Status.ACTIVE },
      order: { fechaCreacion: 'ASC' },
    })
  }

  /** Mapa ventaId → tipos de documento cargados, para el listado (una sola consulta). */
  async tiposPorVenta(clienteId: string, ventaIds: string[]): Promise<Map<string, string[]>> {
    const mapa = new Map<string, string[]>()
    if (!ventaIds.length) return mapa
    const docs = await this.docRepo.find({
      select: ['ventaId', 'tipo'],
      where: { clienteId, ventaId: In(ventaIds), estado: Status.ACTIVE },
    })
    for (const d of docs) mapa.set(d.ventaId, [...(mapa.get(d.ventaId) || []), d.tipo])
    return mapa
  }

  async subir(clienteId: string, ventaId: string, tipo: string, file: Express.Multer.File, usuarioId: string): Promise<VentaDocumento> {
    this.validarTipo(tipo)
    if (!file?.buffer?.length) throw new BadRequestException('Archivo requerido')
    if (file.size > MAX_TAMANO_DOCUMENTO) throw new BadRequestException('El archivo supera el tamaño máximo de 5 MB')

    const firma = FIRMAS.find(f => f.match(file.buffer))
    if (!firma) throw new BadRequestException('Formato no permitido. Solo se aceptan PDF, JPG, PNG o WEBP')

    const venta = await this.obtenerVenta(clienteId, ventaId)
    if (venta.estadoVenta === EstadoVenta.ANULADA) throw new BadRequestException('No se pueden subir documentos a una venta anulada')

    const rutaRelativa = path.join('ventas', String(clienteId), ventaId, `${tipo.toLowerCase()}-${randomUUID()}.${firma.ext}`)
    const rutaAbsoluta = path.join(this.baseDir, rutaRelativa)
    await fs.mkdir(path.dirname(rutaAbsoluta), { recursive: true })
    await fs.writeFile(rutaAbsoluta, file.buffer)

    // Reemplazo: se da de baja el documento anterior del mismo tipo
    const anterior = await this.buscarActivo(clienteId, ventaId, tipo)
    if (anterior) await this.darDeBaja(anterior, usuarioId)

    const doc = this.docRepo.create({
      clienteId,
      ventaId,
      tipo,
      nombreOriginal: this.limpiarNombre(file.originalname),
      mimeType: firma.mime,
      tamano: file.size,
      rutaArchivo: rutaRelativa,
      estado: Status.ACTIVE,
      usuarioCreacion: usuarioId,
    })
    const { rutaArchivo, ...guardado } = await this.docRepo.save(doc)
    return guardado as VentaDocumento
  }

  async obtenerArchivo(clienteId: string, ventaId: string, tipo: string): Promise<{ doc: VentaDocumento; rutaAbsoluta: string }> {
    this.validarTipo(tipo)
    await this.obtenerVenta(clienteId, ventaId)
    const doc = await this.buscarActivo(clienteId, ventaId, tipo)
    if (!doc) throw new NotFoundException('Documento no encontrado')
    const rutaAbsoluta = path.join(this.baseDir, doc.rutaArchivo)
    try {
      await fs.access(rutaAbsoluta)
    } catch {
      throw new NotFoundException('El archivo no está disponible en el servidor')
    }
    return { doc, rutaAbsoluta }
  }

  async eliminar(clienteId: string, ventaId: string, tipo: string, usuarioId: string): Promise<void> {
    this.validarTipo(tipo)
    await this.obtenerVenta(clienteId, ventaId)
    const doc = await this.buscarActivo(clienteId, ventaId, tipo)
    if (!doc) throw new NotFoundException('Documento no encontrado')
    await this.darDeBaja(doc, usuarioId)
  }

  private async darDeBaja(doc: VentaDocumento, usuarioId: string) {
    doc.estado = Status.INACTIVE
    doc.transaccion = Transacccion.ELIMINAR
    doc.usuarioModificacion = usuarioId
    await this.docRepo.save(doc)
    await fs.unlink(path.join(this.baseDir, doc.rutaArchivo)).catch(() => undefined)
  }

  private buscarActivo(clienteId: string, ventaId: string, tipo: string) {
    return this.docRepo.createQueryBuilder('d')
      .addSelect('d.rutaArchivo')
      .where('d.clienteId = :clienteId', { clienteId })
      .andWhere('d.ventaId = :ventaId', { ventaId })
      .andWhere('d.tipo = :tipo', { tipo })
      .andWhere('d.estado = :est', { est: Status.ACTIVE })
      .getOne()
  }

  private async obtenerVenta(clienteId: string, ventaId: string): Promise<Venta> {
    const venta = await this.ventaRepo.findOne({ where: { id: ventaId, clienteId, estado: Status.ACTIVE } })
    if (!venta) throw new NotFoundException('Venta no encontrada')
    return venta
  }

  private validarTipo(tipo: string) {
    if (!TIPOS_DOCUMENTO_VENTA.includes(tipo)) throw new BadRequestException('Tipo de documento no válido')
  }

  private limpiarNombre(nombre: string): string {
    // multer entrega el nombre en latin1; se reinterpreta como UTF-8
    const decodificado = Buffer.from(nombre || 'archivo', 'latin1').toString('utf8')
    return decodificado.replace(/[\\/\r\n"]/g, '_').slice(0, 255)
  }
}
