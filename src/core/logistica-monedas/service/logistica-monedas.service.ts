import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Moneda } from '../entity/moneda.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateMonedaDto, UpdateMonedaDto } from '../dto/moneda.dto'

@Injectable()
export class LogisticaMonedasService {
  constructor(
    @InjectRepository(Moneda)
    private readonly repo: Repository<Moneda>,
  ) {}

  async listar(clienteId: string, q?: string): Promise<Moneda[]> {
    const qb = this.repo
      .createQueryBuilder('m')
      .where('m.cliente_id = :clienteId AND m._estado = :estado', { clienteId, estado: Status.ACTIVE })
      .orderBy('m.nombre', 'ASC')
    if (q && q.trim()) {
      qb.andWhere('LOWER(m.nombre) LIKE LOWER(:q) OR LOWER(m.codigo) LIKE LOWER(:q)', { q: `%${q.trim()}%` })
    }
    return qb.getMany()
  }

  async obtener(clienteId: string, id: string): Promise<Moneda> {
    const m = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!m) throw new NotFoundException(Messages.NOT_FOUND)
    return m
  }

  async crear(clienteId: string, dto: CreateMonedaDto, usuarioCreacion: string): Promise<Moneda> {
    return this.repo.save(
      this.repo.create({
        ...dto,
        clienteId,
        activo: dto.estado !== 'inactivo',
        esMonedaBase: dto.esMonedaBase ?? false,
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion,
      }),
    )
  }

  async actualizar(clienteId: string, id: string, dto: UpdateMonedaDto, usuarioModificacion: string): Promise<Moneda> {
    const m = await this.obtener(clienteId, id)
    const { estado: estadoDto, ...rest } = dto
    const activo = estadoDto !== undefined ? estadoDto !== 'inactivo' : m.activo
    Object.assign(m, { ...rest, activo, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(m)
  }

  async eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const m = await this.obtener(clienteId, id)
    Object.assign(m, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(m)
  }

  async setBase(clienteId: string, id: string, usuarioModificacion: string): Promise<Moneda> {
    // Desmarcar cualquier moneda base anterior
    await this.repo
      .createQueryBuilder()
      .update(Moneda)
      .set({ esMonedaBase: false, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
      .where('cliente_id = :clienteId AND _estado = :estado AND es_moneda_base = true', { clienteId, estado: Status.ACTIVE })
      .execute()

    const m = await this.obtener(clienteId, id)
    Object.assign(m, { esMonedaBase: true, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(m)
  }
}
