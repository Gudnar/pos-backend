import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Paciente } from '../entity/paciente.entity'
import { Consulta } from '../entity/consulta.entity'
import { Cita } from '../../citas-medicas/entity/cita.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import {
  CreatePacienteDto,
  UpdatePacienteDto,
  CreateConsultaDto,
  UpdateConsultaDto,
} from '../dto/paciente.dto'

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)  private readonly pacienteRepo: Repository<Paciente>,
    @InjectRepository(Consulta)  private readonly consultaRepo: Repository<Consulta>,
    @InjectRepository(Cita)      private readonly citaRepo: Repository<Cita>,
  ) {}

  // ── Pacientes ─────────────────────────────────────────────────────────────

  async listar(clienteId: string, q?: string): Promise<Paciente[]> {
    const qb = this.pacienteRepo
      .createQueryBuilder('p')
      .where('p.cliente_id = :clienteId AND p._estado = :estado', { clienteId, estado: Status.ACTIVE })
      .orderBy('p.nombre', 'ASC')

    if (q && q.trim().length >= 1) {
      qb.andWhere('(LOWER(p.nombre) LIKE LOWER(:q) OR p.telefono LIKE :q)', { q: `%${q.trim()}%` })
    }

    return qb.getMany()
  }

  async buscar(clienteId: string, q: string): Promise<Paciente[]> {
    if (!q || q.trim().length < 2) return []
    return this.pacienteRepo
      .createQueryBuilder('p')
      .where('p.cliente_id = :clienteId AND p._estado = :estado', { clienteId, estado: Status.ACTIVE })
      .andWhere('(LOWER(p.nombre) LIKE LOWER(:q) OR p.telefono LIKE :q)', { q: `%${q.trim()}%` })
      .orderBy('p.nombre', 'ASC')
      .limit(8)
      .getMany()
  }

  async obtener(clienteId: string, id: string): Promise<Paciente> {
    const p = await this.pacienteRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!p) throw new NotFoundException(Messages.NOT_FOUND)
    return p
  }

  async crear(clienteId: string, dto: CreatePacienteDto, usuarioCreacion: string): Promise<Paciente> {
    const existe = await this.pacienteRepo.findOne({
      where: { clienteId, telefono: dto.telefono, estado: Status.ACTIVE },
    })
    if (existe) throw new ConflictException(`Ya existe un paciente con el teléfono "${dto.telefono}".`)

    return this.pacienteRepo.save(this.pacienteRepo.create({
      ...dto,
      clienteId,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    }))
  }

  async actualizar(clienteId: string, id: string, dto: UpdatePacienteDto, usuarioModificacion: string): Promise<Paciente> {
    const paciente = await this.obtener(clienteId, id)

    if (dto.telefono && dto.telefono !== paciente.telefono) {
      const existe = await this.pacienteRepo.findOne({
        where: { clienteId, telefono: dto.telefono, estado: Status.ACTIVE },
      })
      if (existe) throw new ConflictException(`Ya existe un paciente con el teléfono "${dto.telefono}".`)
    }

    Object.assign(paciente, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.pacienteRepo.save(paciente)
  }

  async eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const paciente = await this.obtener(clienteId, id)
    Object.assign(paciente, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.pacienteRepo.save(paciente)
  }

  // ── Historial de citas ────────────────────────────────────────────────────

  async historialCitas(clienteId: string, pacienteId: string): Promise<Cita[]> {
    const paciente = await this.obtener(clienteId, pacienteId)
    return this.citaRepo.find({
      where: { clienteId, pacienteTelefono: paciente.telefono, estado: Status.ACTIVE },
      order: { fecha: 'DESC', horaInicio: 'DESC' },
    })
  }

  // ── Consultas ─────────────────────────────────────────────────────────────

  async listarConsultas(clienteId: string, pacienteId: string): Promise<Consulta[]> {
    await this.obtener(clienteId, pacienteId)
    return this.consultaRepo.find({
      where: { clienteId, pacienteId, estado: Status.ACTIVE },
      order: { fecha: 'DESC' },
    })
  }

  async crearConsulta(clienteId: string, pacienteId: string, dto: CreateConsultaDto, usuarioCreacion: string): Promise<Consulta> {
    await this.obtener(clienteId, pacienteId)
    return this.consultaRepo.save(this.consultaRepo.create({
      ...dto,
      clienteId,
      pacienteId,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    }))
  }

  async actualizarConsulta(clienteId: string, pacienteId: string, consultaId: string, dto: UpdateConsultaDto, usuarioModificacion: string): Promise<Consulta> {
    await this.obtener(clienteId, pacienteId)
    const consulta = await this.consultaRepo.findOne({ where: { id: consultaId, pacienteId, clienteId, estado: Status.ACTIVE } })
    if (!consulta) throw new NotFoundException(Messages.NOT_FOUND)

    Object.assign(consulta, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.consultaRepo.save(consulta)
  }

  async eliminarConsulta(clienteId: string, pacienteId: string, consultaId: string, usuarioModificacion: string): Promise<void> {
    await this.obtener(clienteId, pacienteId)
    const consulta = await this.consultaRepo.findOne({ where: { id: consultaId, pacienteId, clienteId, estado: Status.ACTIVE } })
    if (!consulta) throw new NotFoundException(Messages.NOT_FOUND)

    Object.assign(consulta, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.consultaRepo.save(consulta)
  }
}
