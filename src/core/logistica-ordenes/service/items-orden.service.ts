import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ItemOrdenImportacion } from '../entity/item-orden-importacion.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateItemOrdenDto, UpdateItemOrdenDto } from '../dto/item-orden.dto'

import { aCentavos, calcularConversion } from '../../../common/lib/conversion-moneda'

/**
 * Montos de un ítem a partir del TOTAL de la línea (el de la factura), no del precio unitario:
 * 16,210.57 / 28,000 = 0.578949 por unidad; si se partía del unitario redondeado (0.5789)
 * el subtotal quedaba en 16,209.20 y no cuadraba con lo registrado.
 */
/** Campos de conversión del DTO (los ausentes conservan el valor actual del ítem) */
function camposConversionItem(dto: UpdateItemOrdenDto, actual: Partial<ItemOrdenImportacion>): Partial<ItemOrdenImportacion> {
  const r: Partial<ItemOrdenImportacion> = {}
  if (dto.tipoCambio !== undefined) r.tcPaso1 = Number(dto.tipoCambio)
  if (dto.tcOperacion !== undefined) r.tcOperacion = dto.tcOperacion
  else if (dto.tipoCambio !== undefined && !actual.tcOperacion) r.tcOperacion = 'MULTIPLICAR'
  if (dto.monedaIntermediaId !== undefined) r.monedaIntermediaId = dto.monedaIntermediaId || null
  if (dto.tcPaso2 !== undefined) r.tcPaso2 = dto.tcPaso2
  if (dto.tcPaso2Operacion !== undefined) r.tcPaso2Operacion = dto.tcPaso2Operacion
  const inter = r.monedaIntermediaId !== undefined ? r.monedaIntermediaId : actual.monedaIntermediaId
  if (!inter) { r.monedaIntermediaId = null; r.tcPaso2 = null; r.tcPaso2Operacion = null }
  return r
}

export function calcularMontosItem(item: ItemOrdenImportacion, totalCompra: number): void {
  const cant = Number(item.cantidadUnidades) || 0
  const total = aCentavos(totalCompra)
  let totalBase: number
  if (item.tcPaso1 != null && Number(item.tcPaso1) > 0) {
    // Conversión directa o en dos pasos (ej. CLP → USD → Bs), cada paso a centavos
    const conv = calcularConversion(total, {
      tipoCambio: Number(item.tcPaso1),
      tcOperacion: item.tcOperacion,
      monedaIntermediaId: item.monedaIntermediaId,
      tcPaso2: item.tcPaso2 != null ? Number(item.tcPaso2) : null,
      tcPaso2Operacion: item.tcPaso2Operacion,
    })
    totalBase = conv.montoBase
    item.montoIntermedio = conv.montoIntermedio
    item.tipoCambio = conv.tipoCambio
  } else {
    // Registros antiguos: TC directo (multiplicando)
    totalBase = aCentavos(total * (Number(item.tipoCambio) || 0))
    item.montoIntermedio = null
  }
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
      ...camposConversionItem(dto, {}),
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
    Object.assign(item, datos, camposConversionItem(dto, item))
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
