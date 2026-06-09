import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TipoGastoLogistica } from '../entity/tipo-gasto-logistica.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateTipoGastoLogisticaDto, UpdateTipoGastoLogisticaDto } from '../dto/tipo-gasto-logistica.dto'

@Injectable()
export class LogisticaTiposGastoService {
  constructor(
    @InjectRepository(TipoGastoLogistica)
    private readonly repo: Repository<TipoGastoLogistica>,
  ) {}

  async listar(clienteId: string, q?: string): Promise<TipoGastoLogistica[]> {
    const qb = this.repo
      .createQueryBuilder('t')
      .where('t.cliente_id = :clienteId AND t._estado = :estado', { clienteId, estado: Status.ACTIVE })
      .orderBy('t.nombre', 'ASC')
    if (q && q.trim()) {
      qb.andWhere('LOWER(t.nombre) LIKE LOWER(:q)', { q: `%${q.trim()}%` })
    }
    return qb.getMany()
  }

  async obtener(clienteId: string, id: string): Promise<TipoGastoLogistica> {
    const t = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!t) throw new NotFoundException(Messages.NOT_FOUND)
    return t
  }

  async crear(clienteId: string, dto: CreateTipoGastoLogisticaDto, usuarioCreacion: string): Promise<TipoGastoLogistica> {
    return this.repo.save(
      this.repo.create({
        ...dto,
        clienteId,
        activo: dto.estado !== 'inactivo',
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion,
      }),
    )
  }

  async actualizar(clienteId: string, id: string, dto: UpdateTipoGastoLogisticaDto, usuarioModificacion: string): Promise<TipoGastoLogistica> {
    const t = await this.obtener(clienteId, id)
    const { estado: estadoDto, ...rest } = dto
    const activo = estadoDto !== undefined ? estadoDto !== 'inactivo' : t.activo
    Object.assign(t, { ...rest, activo, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(t)
  }

  async eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const t = await this.obtener(clienteId, id)
    Object.assign(t, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(t)
  }

  async inicializarDefaults(clienteId: string, usuarioCreacion: string): Promise<void> {
    const count = await this.repo.count({ where: { clienteId, estado: Status.ACTIVE } })
    if (count > 0) return
    const defaults = [
      'Flete Internacional',
      'Arancel Aduanero',
      'Seguro de Carga',
      'Transporte Local',
      'Almacenaje',
      'Gastos Bancarios',
      'Otros',
    ]
    for (const nombre of defaults) {
      await this.crear(clienteId, { nombre }, usuarioCreacion)
    }
  }
}
