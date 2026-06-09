import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Especialista } from '../entity/especialista.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateEspecialistaDto, UpdateEspecialistaDto } from '../dto/especialista.dto'

@Injectable()
export class EspecialistaService {
  constructor(
    @InjectRepository(Especialista)
    private readonly repo: Repository<Especialista>,
  ) {}

  async listar(clienteId: string, especialidad?: string): Promise<Especialista[]> {
    const qb = this.repo
      .createQueryBuilder('e')
      .where('e.cliente_id = :clienteId AND e._estado = :estado', { clienteId, estado: Status.ACTIVE })
      .orderBy('e.nombre', 'ASC')

    if (especialidad) {
      qb.andWhere(`e.especialidades::text ILIKE :esp`, { esp: `%${especialidad}%` })
    }

    return qb.getMany()
  }

  async obtener(id: string, clienteId: string): Promise<Especialista> {
    const e = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!e) throw new NotFoundException(Messages.NOT_FOUND)
    return e
  }

  async crear(clienteId: string, dto: CreateEspecialistaDto, usuarioCreacion: string): Promise<Especialista> {
    const e = this.repo.create({
      ...dto,
      clienteId,
      activo: true,
      horarios: dto.horarios || [],
      especialidades: dto.especialidades || [],
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.repo.save(e)
  }

  async actualizar(clienteId: string, id: string, dto: UpdateEspecialistaDto, usuarioModificacion: string): Promise<Especialista> {
    const e = await this.obtener(id, clienteId)
    Object.assign(e, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(e)
  }

  async eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const e = await this.obtener(id, clienteId)
    Object.assign(e, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(e)
  }
}
