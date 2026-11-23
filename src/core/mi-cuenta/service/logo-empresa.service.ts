import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import * as path from 'path'
import { Cliente } from '../../cliente/entity/cliente.entity'
import { Status, Transacccion } from '../../../common/constants'

export const MAX_TAMANO_LOGO = 2 * 1024 * 1024

// Solo imágenes rasterizadas: un SVG puede llevar scripts y el logo se sirve sin autenticación
const FIRMAS: { mime: string; ext: string; match: (b: Buffer) => boolean }[] = [
  { mime: 'image/png', ext: 'png', match: b => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: 'image/jpeg', ext: 'jpg', match: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/webp', ext: 'webp', match: b => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' },
]
const MIME_POR_EXT: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' }

// Ruta relativa al API que se guarda en cliente.logo_url; el frontend le antepone la URL del backend
const PREFIJO_URL = 'empresa-logo'

@Injectable()
export class LogoEmpresaService {
  private readonly baseDir = path.resolve(process.env.UPLOADS_DIR || 'uploads')

  constructor(@InjectRepository(Cliente) private readonly clienteRepo: Repository<Cliente>) {}

  async subir(clienteId: string, file: Express.Multer.File, usuarioId: string): Promise<{ logoUrl: string }> {
    if (!file?.buffer?.length) throw new BadRequestException('Archivo requerido')
    if (file.size > MAX_TAMANO_LOGO) throw new BadRequestException('El logo supera el tamaño máximo de 2 MB')
    const firma = FIRMAS.find(f => f.match(file.buffer))
    if (!firma) throw new BadRequestException('Formato no permitido. Usa PNG, JPG o WEBP')

    const cliente = await this.obtenerCliente(clienteId)
    const archivo = `logo-${randomUUID()}.${firma.ext}`
    const dir = path.join(this.baseDir, 'empresas', String(clienteId))
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, archivo), file.buffer)

    const anterior = cliente.logoUrl
    const logoUrl = `${PREFIJO_URL}/${clienteId}/${archivo}`
    await this.clienteRepo.update({ id: cliente.id }, { logoUrl, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion: usuarioId })
    await this.borrarArchivoPropio(clienteId, anterior)
    return { logoUrl }
  }

  async quitar(clienteId: string, usuarioId: string): Promise<void> {
    const cliente = await this.obtenerCliente(clienteId)
    await this.clienteRepo.update({ id: cliente.id }, { logoUrl: null as any, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion: usuarioId })
    await this.borrarArchivoPropio(clienteId, cliente.logoUrl)
  }

  /** Para el endpoint público: valida los parámetros para que no se pueda salir de la carpeta de logos. */
  async rutaPublica(clienteId: string, archivo: string): Promise<{ ruta: string; mime: string }> {
    if (!/^\d+$/.test(clienteId) || !/^logo-[0-9a-f-]{36}\.(png|jpg|webp)$/.test(archivo)) throw new NotFoundException()
    const ruta = path.join(this.baseDir, 'empresas', clienteId, archivo)
    try {
      await fs.access(ruta)
    } catch {
      throw new NotFoundException()
    }
    return { ruta, mime: MIME_POR_EXT[archivo.split('.').pop() as string] }
  }

  private async obtenerCliente(clienteId: string): Promise<Cliente> {
    const cliente = await this.clienteRepo.findOne({ where: { id: clienteId, estado: Status.ACTIVE } })
    if (!cliente) throw new NotFoundException('Empresa no encontrada')
    return cliente
  }

  // Solo se borran logos subidos aquí (no URLs externas que se hubieran puesto antes)
  private async borrarArchivoPropio(clienteId: string, logoUrl?: string | null) {
    const prefijo = `${PREFIJO_URL}/${clienteId}/`
    if (!logoUrl || !logoUrl.startsWith(prefijo)) return
    const archivo = logoUrl.slice(prefijo.length)
    if (!/^logo-[0-9a-f-]{36}\.(png|jpg|webp)$/.test(archivo)) return
    await fs.unlink(path.join(this.baseDir, 'empresas', String(clienteId), archivo)).catch(() => undefined)
  }
}
