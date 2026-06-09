import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UnidadMedida } from '../entity/unidad-medida.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateUnidadMedidaDto, UpdateUnidadMedidaDto } from '../dto/unidad-medida.dto'

@Injectable()
export class UnidadesMedidaService {
  constructor(
    @InjectRepository(UnidadMedida)
    private readonly repo: Repository<UnidadMedida>,
  ) {}

  async listar(clienteId: string): Promise<any[]> {
    const unidades = await this.repo.find({
      where: { clienteId, estado: Status.ACTIVE },
      order: { esBase: 'DESC', nombre: 'ASC' },
    })
    // Adjuntar nombre de unidad base para empaques
    const baseMap = new Map(unidades.filter(u => u.esBase).map(u => [u.id, u]))
    return unidades.map(u => ({
      ...u,
      unidadBaseNombre: u.unidadBaseId ? baseMap.get(u.unidadBaseId)?.nombre ?? null : null,
    }))
  }

  async obtener(clienteId: string, id: string): Promise<UnidadMedida> {
    const u = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!u) throw new NotFoundException(Messages.NOT_FOUND)
    return u
  }

  async crear(clienteId: string, dto: CreateUnidadMedidaDto, usuarioCreacion: string): Promise<UnidadMedida> {
    return this.repo.save(
      this.repo.create({
        ...dto,
        clienteId,
        esBase: dto.esBase !== false,
        factorConversion: dto.factorConversion ?? 1,
        activo: dto.estado !== 'inactivo',
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion,
      }),
    )
  }

  async actualizar(clienteId: string, id: string, dto: UpdateUnidadMedidaDto, usuarioModificacion: string): Promise<UnidadMedida> {
    const u = await this.obtener(clienteId, id)
    const { estado: estadoDto, ...rest } = dto
    const activo = estadoDto !== undefined ? estadoDto !== 'inactivo' : u.activo
    Object.assign(u, { ...rest, activo, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(u)
  }

  async eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const u = await this.obtener(clienteId, id)
    Object.assign(u, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(u)
  }
}
