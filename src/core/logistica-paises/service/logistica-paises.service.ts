import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PaisLogistica } from '../entity/pais-logistica.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreatePaisLogisticaDto, UpdatePaisLogisticaDto } from '../dto/pais-logistica.dto'

@Injectable()
export class LogisticaPaisesService {
  constructor(
    @InjectRepository(PaisLogistica)
    private readonly repo: Repository<PaisLogistica>,
  ) {}

  async listar(clienteId: string, q?: string): Promise<PaisLogistica[]> {
    const qb = this.repo
      .createQueryBuilder('p')
      .where('p.cliente_id = :clienteId AND p._estado = :estado', { clienteId, estado: Status.ACTIVE })
      .orderBy('p.nombre', 'ASC')
    if (q && q.trim()) {
      qb.andWhere('LOWER(p.nombre) LIKE LOWER(:q)', { q: `%${q.trim()}%` })
    }
    return qb.getMany()
  }

  async obtener(clienteId: string, id: string): Promise<PaisLogistica> {
    const p = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!p) throw new NotFoundException(Messages.NOT_FOUND)
    return p
  }

  async crear(clienteId: string, dto: CreatePaisLogisticaDto, usuarioCreacion: string): Promise<PaisLogistica> {
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

  async actualizar(clienteId: string, id: string, dto: UpdatePaisLogisticaDto, usuarioModificacion: string): Promise<PaisLogistica> {
    const p = await this.obtener(clienteId, id)
    const { estado: estadoDto, ...rest } = dto
    const activo = estadoDto !== undefined ? estadoDto !== 'inactivo' : p.activo
    Object.assign(p, { ...rest, activo, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(p)
  }

  async eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const p = await this.obtener(clienteId, id)
    Object.assign(p, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(p)
  }

  async inicializarDefaults(clienteId: string, usuarioCreacion: string): Promise<void> {
    const count = await this.repo.count({ where: { clienteId, estado: Status.ACTIVE } })
    if (count > 0) return
    const defaults = [
      { nombre: 'China', codigo: 'CN' },
      { nombre: 'Perú', codigo: 'PE' },
      { nombre: 'Chile', codigo: 'CL' },
      { nombre: 'Estados Unidos', codigo: 'US' },
      { nombre: 'Brasil', codigo: 'BR' },
      { nombre: 'Argentina', codigo: 'AR' },
      { nombre: 'Colombia', codigo: 'CO' },
      { nombre: 'México', codigo: 'MX' },
      { nombre: 'Alemania', codigo: 'DE' },
      { nombre: 'España', codigo: 'ES' },
      { nombre: 'Italia', codigo: 'IT' },
      { nombre: 'Turquía', codigo: 'TR' },
      { nombre: 'India', codigo: 'IN' },
      { nombre: 'Vietnam', codigo: 'VN' },
      { nombre: 'Tailandia', codigo: 'TH' },
      { nombre: 'Bolivia', codigo: 'BO' },
    ]
    for (const d of defaults) {
      await this.crear(clienteId, d, usuarioCreacion)
    }
  }
}
