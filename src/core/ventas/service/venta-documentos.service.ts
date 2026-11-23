import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import * as path from 'path'
import { Venta, EstadoVenta } from '../entity/venta.entity'
import { VentaDocumento, TIPOS_DOCUMENTO_VENTA, TIPOS_DOCUMENTO_MULTIPLES } from '../entity/venta-documento.entity'
import { Status, Transacccion } from '../../../common/constants'

export const MAX_TAMANO_DOCUMENTO = 5 * 1024 * 1024

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Tipos aceptados, detectados por la firma del archivo (no por lo que declara el navegador)
const FIRMAS: { mime: string; ext: string; match: (b: Buffer) => boolean }[] = [
  { mime: 'application/pdf', ext: 'pdf', match: b => b.subarray(0, 4).toString('latin1') === '%PDF' },
  { mime: 'image/png', ext: 'png', match: b => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: 'image/jpeg', ext: 'jpg', match: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/webp', ext: 'webp', match: b => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' },
]

export type ArchivoGuardado = { rutaRelativa: string; mimeType: string; nombreOriginal: string; tamano: number }

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

  /** Mapa ventaId → tipos de documento cargados (un elemento por archivo), para el listado. */
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
    const venta = await this.obtenerVenta(clienteId, ventaId)
    if (venta.estadoVenta === EstadoVenta.ANULADA) throw new BadRequestException('No se pueden subir documentos a una venta anulada')

    const archivo = await this.guardarArchivo(clienteId, ventaId, tipo.toLowerCase(), file)

    // Los tipos de un solo archivo se reemplazan; las tablillas de pesaje se acumulan
    if (!TIPOS_DOCUMENTO_MULTIPLES.includes(tipo)) {
      const anterior = await this.buscar(clienteId, ventaId, tipo)
      if (anterior) await this.darDeBaja(anterior, usuarioId)
    }

    const doc = this.docRepo.create({
      clienteId,
      ventaId,
      tipo,
      nombreOriginal: archivo.nombreOriginal,
      mimeType: archivo.mimeType,
      tamano: archivo.tamano,
      rutaArchivo: archivo.rutaRelativa,
      estado: Status.ACTIVE,
      usuarioCreacion: usuarioId,
    })
    const { rutaArchivo, ...guardado } = await this.docRepo.save(doc)
    return guardado as VentaDocumento
  }

  /** `ref` es el id del documento o, por compatibilidad, su tipo (toma el primero de ese tipo). */
  async obtenerArchivo(clienteId: string, ventaId: string, ref: string): Promise<{ doc: VentaDocumento; rutaAbsoluta: string }> {
    await this.obtenerVenta(clienteId, ventaId)
    const doc = await this.buscar(clienteId, ventaId, ref)
    if (!doc) throw new NotFoundException('Documento no encontrado')
    return { doc, rutaAbsoluta: await this.rutaExistente(doc.rutaArchivo) }
  }

  async eliminar(clienteId: string, ventaId: string, ref: string, usuarioId: string): Promise<void> {
    await this.obtenerVenta(clienteId, ventaId)
    const doc = await this.buscar(clienteId, ventaId, ref)
    if (!doc) throw new NotFoundException('Documento no encontrado')
    await this.darDeBaja(doc, usuarioId)
  }

  // ── Archivos (también los usa el comprobante de cada pago) ────────────────
  async guardarArchivo(clienteId: string, ventaId: string, prefijo: string, file: Express.Multer.File): Promise<ArchivoGuardado> {
    if (!file?.buffer?.length) throw new BadRequestException('Archivo requerido')
    if (file.size > MAX_TAMANO_DOCUMENTO) throw new BadRequestException('El archivo supera el tamaño máximo de 5 MB')
    const firma = FIRMAS.find(f => f.match(file.buffer))
    if (!firma) throw new BadRequestException('Formato no permitido. Solo se aceptan PDF, JPG, PNG o WEBP')

    const rutaRelativa = path.join('ventas', String(clienteId), ventaId, `${prefijo}-${randomUUID()}.${firma.ext}`)
    const rutaAbsoluta = path.join(this.baseDir, rutaRelativa)
    await fs.mkdir(path.dirname(rutaAbsoluta), { recursive: true })
    await fs.writeFile(rutaAbsoluta, file.buffer)
    return { rutaRelativa, mimeType: firma.mime, nombreOriginal: this.limpiarNombre(file.originalname), tamano: file.size }
  }

  async rutaExistente(rutaRelativa: string): Promise<string> {
    const rutaAbsoluta = path.join(this.baseDir, rutaRelativa)
    try {
      await fs.access(rutaAbsoluta)
    } catch {
      throw new NotFoundException('El archivo no está disponible en el servidor')
    }
    return rutaAbsoluta
  }

  async borrarArchivo(rutaRelativa?: string | null): Promise<void> {
    if (rutaRelativa) await fs.unlink(path.join(this.baseDir, rutaRelativa)).catch(() => undefined)
  }

  private async darDeBaja(doc: VentaDocumento, usuarioId: string) {
    doc.estado = Status.INACTIVE
    doc.transaccion = Transacccion.ELIMINAR
    doc.usuarioModificacion = usuarioId
    await this.docRepo.save(doc)
    await this.borrarArchivo(doc.rutaArchivo)
  }

  private buscar(clienteId: string, ventaId: string, ref: string) {
    const porId = UUID_RE.test(ref)
    if (!porId) this.validarTipo(ref)
    return this.docRepo.createQueryBuilder('d')
      .addSelect('d.rutaArchivo')
      .where('d.clienteId = :clienteId', { clienteId })
      .andWhere('d.ventaId = :ventaId', { ventaId })
      .andWhere(porId ? 'd.id = :ref' : 'd.tipo = :ref', { ref })
      .andWhere('d.estado = :est', { est: Status.ACTIVE })
      .orderBy('d.fechaCreacion', 'ASC')
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
