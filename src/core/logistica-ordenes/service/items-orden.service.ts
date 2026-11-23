import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ItemOrdenImportacion } from '../entity/item-orden-importacion.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateItemOrdenDto, UpdateItemOrdenDto } from '../dto/item-orden.dto'

const aCentavos = (n: number) => Math.round((Number(n) + Number.EPSILON) * 100) / 100

/**
 * Montos de un ítem a partir del TOTAL de la línea (el de la factura), no del precio unitario:
 * 16,210.57 / 28,000 = 0.578949 por unidad; si se partía del unitario redondeado (0.5789)
 * el subtotal quedaba en 16,209.20 y no cuadraba con lo registrado.
 */
export function calcularMontosItem(item: ItemOrdenImportacion, totalCompra: number): void {
  const cant = Number(item.cantidadUnidades) || 0
  const tc = Number(item.tipoCambio) || 0
  const total = aCentavos(totalCompra)
  const totalBase = aCentavos(total * tc)
  item.subtotalMonedaCompra = total
  item.subtotalMonedaBase = totalBase
  item.precioUnitarioMonedaCompra = cant > 0 ? Number((total / cant).toFixed(10)) : 0
  item.precioUnitarioMonedaBase = cant > 0 ? Number((totalBase / cant).toFixed(10)) : 0
}

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
    const { totalDeCompra, ...datos } = dto
    const item = this.repo.create({
      ...datos,
      clienteId,
      ordenImportacionId: ordenId,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    const total = totalDeCompra != null
      ? Number(totalDeCompra)
      : Number(dto.precioUnitarioMonedaCompra) * Number(dto.cantidadUnidades)
    calcularMontosItem(item, total)
    return this.repo.save(item)
  }

  async actualizar(clienteId: string, ordenId: string, id: string, dto: UpdateItemOrdenDto, usuarioModificacion: string): Promise<ItemOrdenImportacion> {
    const item = await this.obtener(clienteId, ordenId, id)
    if (dto.productoId && dto.productoId !== item.productoId) {
      await this.validarProductoUnico(ordenId, clienteId, dto.productoId, id)
    }
    const { totalDeCompra, ...datos } = dto
    Object.assign(item, datos)
    // El total de la factura manda; si no viene, se respeta el guardado salvo que cambie precio o cantidad
    let total: number
    if (totalDeCompra != null) total = Number(totalDeCompra)
    else if (dto.precioUnitarioMonedaCompra != null || dto.cantidadUnidades != null || item.subtotalMonedaCompra == null) {
      total = Number(item.precioUnitarioMonedaCompra) * Number(item.cantidadUnidades)
    } else total = Number(item.subtotalMonedaCompra)
    calcularMontosItem(item, total)
    Object.assign(item, { transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(item)
  }

  async eliminar(clienteId: string, ordenId: string, id: string, usuarioModificacion: string): Promise<void> {
    const item = await this.obtener(clienteId, ordenId, id)
    Object.assign(item, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(item)
  }
}
