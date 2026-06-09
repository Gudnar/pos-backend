import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Cita } from '../entity/cita.entity'
import { Paciente } from '../../pacientes/entity/paciente.entity'
import { Cliente } from '../../cliente/entity/cliente.entity'
import { EspecialistaService } from '../../especialista/service/especialista.service'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateCitaDto, UpdateCitaDto, CreatePacienteDto } from '../dto/cita.dto'

const DIAS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

function minutosDeHora(h: string): number {
  const [hh, mm] = h.split(':').map(Number)
  return hh * 60 + mm
}

function minutosAHora(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

@Injectable()
export class CitasMedicasService {
  constructor(
    @InjectRepository(Cita)      private readonly citaRepo: Repository<Cita>,
    @InjectRepository(Paciente)  private readonly pacienteRepo: Repository<Paciente>,
    @InjectRepository(Cliente)   private readonly clienteRepo: Repository<Cliente>,
    private readonly especialistaSvc: EspecialistaService,
  ) {}

  private async getCliente(clienteId: string): Promise<Cliente> {
    const c = await this.clienteRepo.findOne({ where: { id: clienteId, estado: Status.ACTIVE } })
    if (!c) throw new NotFoundException(Messages.CLIENTE_NOT_FOUND)
    return c
  }

  async obtenerServicios(clienteId: string): Promise<string[]> {
    const c = await this.getCliente(clienteId)
    return c.servicios || []
  }

  // ── Pacientes ─────────────────────────────────────────────────────────────

  async buscarPacientes(clienteId: string, q: string): Promise<Paciente[]> {
    if (!q || q.trim().length < 2) return []
    return this.pacienteRepo
      .createQueryBuilder('p')
      .where('p.cliente_id = :clienteId AND p._estado = :estado', { clienteId, estado: Status.ACTIVE })
      .andWhere('(LOWER(p.nombre) LIKE LOWER(:q) OR p.telefono LIKE :q)', { q: `%${q.trim()}%` })
      .orderBy('p.nombre', 'ASC')
      .limit(8)
      .getMany()
  }

  async crearPaciente(clienteId: string, dto: CreatePacienteDto, usuarioCreacion: string, origenRegistro = 'STAFF'): Promise<Paciente> {
    const existe = await this.pacienteRepo.findOne({
      where: { clienteId, telefono: dto.telefono, estado: Status.ACTIVE },
    })
    if (existe) {
      Object.assign(existe, { nombre: dto.nombre, email: dto.email ?? existe.email, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion: usuarioCreacion })
      return this.pacienteRepo.save(existe)
    }
    return this.pacienteRepo.save(this.pacienteRepo.create({
      ...dto,
      clienteId,
      origenRegistro,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    }))
  }

  private async upsertPaciente(clienteId: string, dto: CreatePacienteDto, usuarioCreacion: string, origenRegistro = 'STAFF'): Promise<void> {
    await this.crearPaciente(clienteId, dto, usuarioCreacion, origenRegistro).catch(() => { /* no bloquear la cita */ })
  }

  async citasPorTelefono(clienteId: string, telefono: string): Promise<Cita[]> {
    return this.citaRepo.find({
      where: { clienteId, pacienteTelefono: telefono, estado: Status.ACTIVE },
      order: { fecha: 'ASC', horaInicio: 'ASC' },
    })
  }

  // ── Citas ─────────────────────────────────────────────────────────────────

  async listar(clienteId: string, fecha?: string, especialistaId?: string): Promise<Cita[]> {
    const where: any = { clienteId, estado: Status.ACTIVE }
    if (fecha) where.fecha = fecha
    if (especialistaId) where.especialistaId = especialistaId
    return this.citaRepo.find({ where, order: { horaInicio: 'ASC' } })
  }

  async disponibilidad(
    clienteId: string,
    fecha: string,
    especialistaId?: string,
  ): Promise<{ horaInicio: string; horaFin: string }[]> {
    const diaSemana = DIAS_ES[new Date(fecha + 'T12:00:00').getDay()]

    let horariosBase: Array<{ dia: string; franjas: Array<{ inicio: string; fin: string }> }>

    if (especialistaId) {
      const especialista = await this.especialistaSvc.obtener(especialistaId, clienteId)
      horariosBase = especialista.horarios || []
    } else {
      const cliente = await this.getCliente(clienteId)
      horariosBase = cliente.horarios || []
    }

    const horarioDelDia = horariosBase.find(h => h.dia.toLowerCase() === diaSemana.toLowerCase())
    if (!horarioDelDia) return []

    const slots: { horaInicio: string; horaFin: string }[] = []
    for (const franja of horarioDelDia.franjas) {
      let cur = minutosDeHora(franja.inicio)
      const fin = minutosDeHora(franja.fin)
      while (cur + 30 <= fin) {
        slots.push({ horaInicio: minutosAHora(cur), horaFin: minutosAHora(cur + 30) })
        cur += 30
      }
    }

    const whereConsultas: any = { clienteId, fecha, estado: Status.ACTIVE }
    if (especialistaId) whereConsultas.especialistaId = especialistaId

    const consultasDelDia = await this.citaRepo.find({ where: whereConsultas })
    const ocupadas = new Set(
      consultasDelDia.filter(c => c.estadoCita !== 'CANCELADA').map(c => c.horaInicio),
    )
    return slots.filter(s => !ocupadas.has(s.horaInicio))
  }

  async crear(clienteId: string, dto: CreateCitaDto, usuarioCreacion: string): Promise<Cita> {
    if (!dto.especialistaId) {
      const cliente = await this.getCliente(clienteId)
      if (!(cliente.servicios || []).includes(dto.servicio)) {
        throw new BadRequestException(`El servicio "${dto.servicio}" no está disponible.`)
      }
    }

    const cita = this.citaRepo.create({
      ...dto,
      clienteId,
      estadoCita: dto.estadoCita || 'PENDIENTE',
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    const saved = await this.citaRepo.save(cita)

    await this.upsertPaciente(clienteId, {
      nombre: dto.pacienteNombre,
      telefono: dto.pacienteTelefono,
      email: dto.pacienteEmail,
    }, usuarioCreacion, dto.origenRegistro || 'STAFF')

    return saved
  }

  async actualizar(clienteId: string, id: string, dto: UpdateCitaDto, usuarioModificacion: string): Promise<Cita> {
    const cita = await this.citaRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!cita) throw new NotFoundException(Messages.NOT_FOUND)

    if (dto.servicio) {
      const cliente = await this.getCliente(clienteId)
      if (!(cliente.servicios || []).includes(dto.servicio)) {
        throw new BadRequestException(`El servicio "${dto.servicio}" no está disponible.`)
      }
    }

    Object.assign(cita, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    const saved = await this.citaRepo.save(cita)

    if (dto.pacienteNombre && dto.pacienteTelefono) {
      await this.upsertPaciente(clienteId, {
        nombre: dto.pacienteNombre,
        telefono: dto.pacienteTelefono,
        email: dto.pacienteEmail,
      }, usuarioModificacion)
    }

    return saved
  }

  async estadisticasConsultas(clienteId: string, desde?: string, hasta?: string): Promise<any> {
    const qb = this.citaRepo.createQueryBuilder('c')
      .where('c.cliente_id = :clienteId AND c._estado = :estado', { clienteId, estado: Status.ACTIVE })
    if (desde) qb.andWhere('c._fecha_creacion >= :desde', { desde: new Date(desde) })
    if (hasta) qb.andWhere('c._fecha_creacion <= :hasta', { hasta: new Date(hasta + 'T23:59:59') })

    const consultas = await qb.getMany()
    const total = consultas.length
    const pendientes  = consultas.filter(c => c.estadoCita === 'PENDIENTE').length
    const confirmadas = consultas.filter(c => c.estadoCita === 'CONFIRMADA').length
    const canceladas  = consultas.filter(c => c.estadoCita === 'CANCELADA').length
    const completadas = consultas.filter(c => c.estadoCita === 'COMPLETADA').length

    const espMap: Record<string, { nombre: string; total: number }> = {}
    const svcMap: Record<string, number> = {}
    for (const c of consultas) {
      svcMap[c.servicio] = (svcMap[c.servicio] || 0) + 1
      if (c.especialistaId) {
        if (!espMap[c.especialistaId]) espMap[c.especialistaId] = { nombre: c.especialistaNombre || 'Sin nombre', total: 0 }
        espMap[c.especialistaId].total++
      }
    }

    return {
      total,
      pendientes,
      confirmadas,
      canceladas,
      completadas,
      tasaCancelacion: total > 0 ? Math.round((canceladas / total) * 100) : 0,
      porOrigenRegistro: {
        ia:    consultas.filter(c => c.origenRegistro === 'IA_AGENTE').length,
        staff: consultas.filter(c => c.origenRegistro !== 'IA_AGENTE').length,
      },
      porEspecialista: Object.entries(espMap)
        .map(([id, v]) => ({ id, nombre: v.nombre, total: v.total }))
        .sort((a, b) => b.total - a.total),
      porServicio: Object.entries(svcMap)
        .map(([nombre, total]) => ({ nombre, total }))
        .sort((a, b) => b.total - a.total),
    }
  }

  async eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const cita = await this.citaRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!cita) throw new NotFoundException(Messages.NOT_FOUND)
    Object.assign(cita, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.citaRepo.save(cita)
  }
}
