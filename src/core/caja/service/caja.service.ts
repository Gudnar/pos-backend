import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, In, Repository } from 'typeorm'
import { Caja } from '../entity/caja.entity'
import { CajaSesion, EstadoSesion } from '../entity/caja-sesion.entity'
import { Usuario } from '../../usuario/entity/usuario.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateCajaDto, UpdateCajaDto, AbrirSesionDto, CerrarSesionDto } from '../dto/caja.dto'

@Injectable()
export class CajaService {
  constructor(
    @InjectRepository(Caja) private readonly cajaRepo: Repository<Caja>,
    @InjectRepository(CajaSesion) private readonly sesionRepo: Repository<CajaSesion>,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  // ── Cajas ─────────────────────────────────────────────────────────────────

  async listar(clienteId: string, sucursalId?: string): Promise<Caja[]> {
    const where: any = { clienteId, estado: Status.ACTIVE }
    if (sucursalId) where.sucursalId = sucursalId
    return this.cajaRepo.find({ where, order: { nombre: 'ASC' } })
  }

  async crear(clienteId: string, dto: CreateCajaDto, usuarioCreacion: string): Promise<Caja> {
    return this.cajaRepo.save(
      this.cajaRepo.create({
        clienteId, sucursalId: dto.sucursalId, nombre: dto.nombre,
        descripcion: dto.descripcion, activo: dto.activo ?? true,
        estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion,
      }),
    )
  }

  async actualizar(clienteId: string, id: string, dto: UpdateCajaDto, usuarioModificacion: string): Promise<Caja> {
    const caja = await this.cajaRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!caja) throw new NotFoundException(Messages.NOT_FOUND)
    Object.assign(caja, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.cajaRepo.save(caja)
  }

  async eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const caja = await this.cajaRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!caja) throw new NotFoundException(Messages.NOT_FOUND)
    Object.assign(caja, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.cajaRepo.save(caja)
  }

  // ── Sesiones ───────────────────────────────────────────────────────────────

  async sesionActiva(clienteId: string, usuarioId: string): Promise<CajaSesion | null> {
    return this.sesionRepo.findOne({
      where: { clienteId, usuarioId, estadoSesion: EstadoSesion.ABIERTA, estado: Status.ACTIVE },
    })
  }

  async ultimasSesiones(clienteId: string, cajaId?: string, limit = 20): Promise<CajaSesion[]> {
    const where: any = { clienteId, estado: Status.ACTIVE }
    if (cajaId) where.cajaId = cajaId
    return this.sesionRepo.find({ where, order: { fechaApertura: 'DESC' }, take: limit })
  }

  async sesionesDia(clienteId: string, fecha?: string, sucursalId?: string): Promise<any[]> {
    const dia = fecha ? new Date(fecha + 'T00:00:00') : new Date()
    const inicio = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 0, 0, 0)
    const fin = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 23, 59, 59, 999)

    const where: any = {
      clienteId,
      estado: Status.ACTIVE,
      fechaApertura: Between(inicio, fin),
    }
    if (sucursalId) where.sucursalId = sucursalId

    const sesiones = await this.sesionRepo.find({ where, order: { fechaApertura: 'ASC' } })
    if (!sesiones.length) return []

    const cajaIds = [...new Set(sesiones.map(s => s.cajaId))]
    const cajas = await this.cajaRepo.find({ where: { id: In(cajaIds) } })
    const cajaMap = Object.fromEntries(cajas.map(c => [c.id, c]))

    return sesiones.map(s => ({
      ...s,
      nombreCaja: cajaMap[s.cajaId]?.nombre ?? '—',
    }))
  }

  async abrirSesion(clienteId: string, dto: AbrirSesionDto, usuarioId: string): Promise<CajaSesion> {
    const caja = await this.cajaRepo.findOne({ where: { id: dto.cajaId, clienteId, estado: Status.ACTIVE } })
    if (!caja) throw new NotFoundException('Caja no encontrada')
    if (!caja.activo) throw new BadRequestException('La caja está inactiva')

    const sesionAbierta = await this.sesionRepo.findOne({
      where: { clienteId, cajaId: dto.cajaId, estadoSesion: EstadoSesion.ABIERTA, estado: Status.ACTIVE },
    })
    if (sesionAbierta) throw new BadRequestException('Esta caja ya tiene una sesión abierta')

    const usuario = await this.usuarioRepo.findOne({ where: { id: Number(usuarioId) as any, estado: Status.ACTIVE } })
    const nombreUsuario = usuario
      ? [usuario.nombres, usuario.apellidos].filter(Boolean).join(' ')
      : `Usuario #${usuarioId}`

    return this.sesionRepo.save(
      this.sesionRepo.create({
        clienteId, cajaId: dto.cajaId, sucursalId: caja.sucursalId, usuarioId,
        estadoSesion: EstadoSesion.ABIERTA,
        nombreUsuario,
        montoInicial: dto.montoInicial, totalVentas: 0, nroVentas: 0,
        fechaApertura: new Date(),
        observaciones: dto.observaciones,
        estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: usuarioId,
      }),
    )
  }

  async cerrarSesion(clienteId: string, sesionId: string, dto: CerrarSesionDto, usuarioModificacion: string): Promise<CajaSesion> {
    const sesion = await this.sesionRepo.findOne({
      where: { id: sesionId, clienteId, estadoSesion: EstadoSesion.ABIERTA, estado: Status.ACTIVE },
    })
    if (!sesion) throw new NotFoundException('Sesión abierta no encontrada')

    const montoEsperado = Number(sesion.montoInicial) + Number(sesion.totalVentas)
    const diferencia = Number(dto.montoFinal) - montoEsperado

    Object.assign(sesion, {
      estadoSesion: EstadoSesion.CERRADA,
      montoFinal: dto.montoFinal,
      diferencia,
      fechaCierre: new Date(),
      observaciones: dto.observaciones || sesion.observaciones,
      transaccion: Transacccion.ACTUALIZAR,
      usuarioModificacion,
    })
    return this.sesionRepo.save(sesion)
  }

  async incrementarTotalesSesion(sesionId: string, total: number): Promise<void> {
    await this.sesionRepo.increment({ id: sesionId }, 'totalVentas', total)
    await this.sesionRepo.increment({ id: sesionId }, 'nroVentas', 1)
  }
}
