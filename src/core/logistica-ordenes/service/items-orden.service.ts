import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ItemOrdenImportacion } from '../entity/item-orden-importacion.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateItemOrdenDto, UpdateItemOrdenDto } from '../dto/item-orden.dto'

@Injectable()
export class ItemsOrdenService {
  constructor(
    @InjectRepository(ItemOrdenImportacion)
    private readonly repo: Repository<ItemOrdenImportacion>,
  ) {}

  async listar(clienteId: string, ordenId: string): Promise<ItemOrdenImportacion[]> {
    return this.repo.find({
      where: { ordenImportacionId: ordenId, clienteId, estado: Status.ACTIVE },
      order: { fechaCreacion: 'ASC' },
    })
  }

  async obtener(clienteId: string, ordenId: string, id: string): Promise<ItemOrdenImportacion> {
    const item = await this.repo.findOne({ where: { id, ordenImportacionId: ordenId, clienteId, estado: Status.ACTIVE } })
    if (!item) throw new NotFoundException(Messages.NOT_FOUND)
    return item
  }

  private async validarProductoUnico(ordenId: string, clienteId: string, productoId: string, excluirId?: string): Promise<void> {
    const existente = await this.repo.findOne({ where: { ordenImportacionId: ordenId, clienteId, productoId, estado: Status.ACTIVE } })
    if (existente && existente.id !== excluirId) {
      throw new BadRequestException('Este producto ya está agregado a la orden. Edita el ítem existente en lugar de agregar uno nuevo.')
    }
  }

  async crear(clienteId: string, ordenId: string, dto: CreateItemOrdenDto, usuarioCreacion: string): Promise<ItemOrdenImportacion> {
    if (dto.productoId) await this.validarProductoUnico(ordenId, clienteId, dto.productoId)
    const tc = Number(dto.tipoCambio)
    const pUnit = Number(dto.precioUnitarioMonedaCompra)
    const cant = Number(dto.cantidadUnidades)
    return this.repo.save(
      this.repo.create({
        ...dto,
        clienteId,
        ordenImportacionId: ordenId,
        precioUnitarioMonedaBase: pUnit * tc,
        subtotalMonedaCompra: pUnit * cant,
        subtotalMonedaBase: pUnit * tc * cant,
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion,
      }),
    )
  }

  async actualizar(clienteId: string, ordenId: string, id: string, dto: UpdateItemOrdenDto, usuarioModificacion: string): Promise<ItemOrdenImportacion> {
    const item = await this.obtener(clienteId, ordenId, id)
    if (dto.productoId && dto.productoId !== item.productoId) {
      await this.validarProductoUnico(ordenId, clienteId, dto.productoId, id)
    }
    Object.assign(item, dto)
    const tc = Number(item.tipoCambio)
    const pUnit = Number(item.precioUnitarioMonedaCompra)
    const cant = Number(item.cantidadUnidades)
    item.precioUnitarioMonedaBase = pUnit * tc
    item.subtotalMonedaCompra = pUnit * cant
    item.subtotalMonedaBase = pUnit * tc * cant
    Object.assign(item, { transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(item)
  }

  async eliminar(clienteId: string, ordenId: string, id: string, usuarioModificacion: string): Promise<void> {
    const item = await this.obtener(clienteId, ordenId, id)
    Object.assign(item, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(item)
  }
}
