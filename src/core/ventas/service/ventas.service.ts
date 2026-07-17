import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository, In, Like, Not } from 'typeorm'
import { Venta, EstadoVenta } from '../entity/venta.entity'
import { DetalleVenta } from '../entity/detalle-venta.entity'
import { Lote, EstadoLote } from '../../lotes/entity/lote.entity'
import { MovimientoStock, TipoMovimiento } from '../../movimientos-stock/entity/movimiento-stock.entity'
import { Producto } from '../../productos/entity/producto.entity'
import { CajaSesion } from '../../caja/entity/caja-sesion.entity'
import { IngresosService } from '../../ingresos/service/ingresos.service'
import { Status, Transacccion } from '../../../common/constants'
import { CrearVentaDto, AnularVentaDto } from '../dto/venta.dto'

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta) private readonly ventaRepo: Repository<Venta>,
    @InjectRepository(DetalleVenta) private readonly detalleRepo: Repository<DetalleVenta>,
    @InjectRepository(Lote) private readonly loteRepo: Repository<Lote>,
    @InjectRepository(MovimientoStock) private readonly movRepo: Repository<MovimientoStock>,
    @InjectRepository(Producto) private readonly productoRepo: Repository<Producto>,
    @InjectRepository(CajaSesion) private readonly sesionRepo: Repository<CajaSesion>,
    private readonly ingresosService: IngresosService,
    private readonly dataSource: DataSource,
  ) {}

  async listar(
    clienteId: string,
    sucursalId?: string,
    fechaDesde?: string,
    fechaHasta?: string,
    estadoVenta?: string,
    nombreCliente?: string,
    conSaldo?: boolean,
  ): Promise<Venta[]> {
    let qb = this.ventaRepo.createQueryBuilder('v')
      .where('v.clienteId = :clienteId', { clienteId })
      .andWhere('v.estado = :est', { est: Status.ACTIVE })
      .orderBy('v.fechaCreacion', 'DESC')
      .take(500)

    if (sucursalId) qb = qb.andWhere('v.sucursalId = :sucursalId', { sucursalId })
    if (estadoVenta) qb = qb.andWhere('v.estadoVenta = :estadoVenta', { estadoVenta })

    // Filtro de rango de fechas
    if (fechaDesde) qb = qb.andWhere('v.fecha >= :fechaDesde', { fechaDesde })
    if (fechaHasta) qb = qb.andWhere('v.fecha <= :fechaHasta', { fechaHasta })

    // Filtro de nombre de cliente
    if (nombreCliente) qb = qb.andWhere('v.nombreCliente ILIKE :nombreCliente', { nombreCliente: `%${nombreCliente}%` })

    // Filtro de saldo pendiente
    if (conSaldo !== undefined) {
      if (conSaldo) {
        // Saldos pendientes: COALESCE(v.total, 0) > COALESCE(v.montoPagado, 0)
        qb = qb.andWhere('COALESCE(v.total, 0) > COALESCE(v.montoPagado, 0)')
      } else {
        // Sin saldo: COALESCE(v.total, 0) <= COALESCE(v.montoPagado, 0)
        qb = qb.andWhere('COALESCE(v.total, 0) <= COALESCE(v.montoPagado, 0)')
      }
    }

    return qb.getMany()
  }

  async obtener(clienteId: string, id: string): Promise<any> {
    const venta = await this.ventaRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!venta) throw new NotFoundException('Venta no encontrada')
    const detalles = await this.detalleRepo.find({ where: { ventaId: id, clienteId, estado: Status.ACTIVE } })

    // Obtener porcentajeFactura de productos
    const productoIds = [...new Set(detalles.map(d => d.productoId))]
    const productos = productoIds.length > 0
      ? await this.productoRepo.find({ where: { id: In(productoIds) } })
      : []
    const prodMap = new Map(productos.map(p => [p.id, p]))

    // Agregar porcentajeFactura a detalles
    return {
      venta,
      detalles: detalles.map(d => ({
        ...d,
        porcentajeFactura: prodMap.get(d.productoId)?.porcentajeFactura || 0,
      })),
    }
  }

  async crear(clienteId: string, dto: CrearVentaDto, usuarioId: string): Promise<Venta> {
    return this.dataSource.transaction(async (manager) => {
      // Generate nroVenta
      const year = new Date().getFullYear()
      const count = await manager.count(Venta, { where: { clienteId } })
      const nroVenta = `V-${year}-${String(count + 1).padStart(5, '0')}`

      // Process each line: find lotes using product picking method
      type Asignacion = { loteId: string; cantidad: number; lote: Lote }
      const detallesResueltos: Array<{
        productoId: string
        nombreProducto: string
        cantidadTotal: number
        precioUnitario: number
        descuento: number
        asignaciones: Asignacion[]
      }> = []

      let subtotal = 0

      for (const det of dto.detalles) {
        const producto = await manager.findOne(Producto, {
          where: { id: det.productoId, clienteId, estado: Status.ACTIVE },
        })
        if (!producto) throw new NotFoundException(`Producto ${det.productoId} no encontrado`)

        const orden = this._ordenPicking(producto.metodoPicking)
        const lotes = await manager.find(Lote, {
          where: {
            clienteId,
            sucursalId: dto.sucursalId,
            productoId: det.productoId,
            estadoLote: EstadoLote.ACTIVO,
            estado: Status.ACTIVE,
          },
          order: orden,
        })

        const asignaciones: Asignacion[] = []
        let restante = Number(det.cantidad)

        for (const lote of lotes) {
          if (restante <= 0) break
          const usar = Math.min(restante, Number(lote.cantidadActual))
          if (usar > 0) {
            asignaciones.push({ loteId: lote.id, cantidad: usar, lote })
            restante -= usar
          }
        }

        if (restante > 0 && lotes.length > 0) {
          throw new BadRequestException(
            `Stock insuficiente para "${producto.nombre}". Disponible: ${lotes.reduce((s, l) => s + Number(l.cantidadActual), 0)}`,
          )
        }

        const lineaSubtotal = Number(det.precioUnitario) * Number(det.cantidad) - Number(det.descuento || 0)
        subtotal += lineaSubtotal

        detallesResueltos.push({
          productoId: det.productoId,
          nombreProducto: producto.nombre,
          cantidadTotal: Number(det.cantidad),
          precioUnitario: Number(det.precioUnitario),
          descuento: Number(det.descuento || 0),
          asignaciones,
        })
      }

      const descuento = Number(dto.descuento || 0)
      const impuesto = Number(dto.impuesto || 0)
      const total = subtotal - descuento + impuesto
      const cambio = dto.montoPagado != null ? Number(dto.montoPagado) - total : null

      // Save Venta
      const ventaEntity = manager.create(Venta, {
        clienteId, sucursalId: dto.sucursalId,
        cajaId: dto.cajaId, cajaSesionId: dto.cajaSesionId,
        usuarioId, nroVenta,
        fecha: new Date().toISOString().split('T')[0],
        estadoVenta: EstadoVenta.PAGADA,
        metodoPago: dto.metodoPago,
        subtotal, descuento, impuesto, total,
        montoPagado: dto.montoPagado ?? null, cambio,
        contactoClienteId: dto.contactoClienteId, nombreCliente: dto.nombreCliente,
        observaciones: dto.observaciones,
        estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: usuarioId,
      } as any)
      const venta = await manager.save(Venta, ventaEntity)

      // Save detalles + update lotes + create movements
      for (const det of detallesResueltos) {
        if (det.asignaciones.length === 0) {
          // Product without stock tracking
          await manager.save(
            DetalleVenta,
            manager.create(DetalleVenta, {
              clienteId, ventaId: venta.id, productoId: det.productoId,
              nombreProducto: det.nombreProducto,
              cantidad: det.cantidadTotal, precioUnitario: det.precioUnitario,
              descuento: det.descuento,
              subtotal: det.precioUnitario * det.cantidadTotal - det.descuento,
              estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: usuarioId,
            }),
          )
        } else {
          for (const { loteId, cantidad, lote } of det.asignaciones) {
            await manager.save(
              DetalleVenta,
              manager.create(DetalleVenta, {
                clienteId, ventaId: venta.id, productoId: det.productoId, loteId,
                nombreProducto: det.nombreProducto,
                cantidad, precioUnitario: det.precioUnitario, descuento: 0,
                subtotal: det.precioUnitario * cantidad,
                estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: usuarioId,
              }),
            )

            const cantAnterior = Number(lote.cantidadActual)
            const cantPosterior = Math.max(0, cantAnterior - cantidad)
            Object.assign(lote, {
              cantidadActual: cantPosterior,
              estadoLote: cantPosterior <= 0 ? EstadoLote.AGOTADO : lote.estadoLote,
              transaccion: Transacccion.ACTUALIZAR,
              usuarioModificacion: usuarioId,
            })
            await manager.save(Lote, lote)

            await manager.save(
              MovimientoStock,
              manager.create(MovimientoStock, {
                clienteId, sucursalId: dto.sucursalId, productoId: det.productoId, loteId,
                tipo: TipoMovimiento.SALIDA,
                cantidad, cantidadAnterior: cantAnterior, cantidadPosterior: cantPosterior,
                referenciaDocumento: venta.nroVenta, tipoDocumento: 'VENTA',
                motivo: `Venta ${venta.nroVenta}`,
                usuarioId,
                estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: usuarioId,
              }),
            )
          }
        }
      }

      // Update caja session totals
      if (dto.cajaSesionId) {
        await manager.increment(CajaSesion, { id: dto.cajaSesionId }, 'totalVentas', total)
        await manager.increment(CajaSesion, { id: dto.cajaSesionId }, 'nroVentas', 1)
      }

      // Apply adelanto if provided
      if (dto.adelantoId) {
        const montoAplicar = Number(dto.montoAdelanto ?? total)
        await this.ingresosService.aplicarMonto(manager, clienteId, dto.adelantoId, montoAplicar, usuarioId)
        venta.adelantoId = dto.adelantoId
        venta.montoAdelanto = montoAplicar
        await manager.save(Venta, venta)
      }

      return venta
    })
  }

  async anular(clienteId: string, id: string, dto: AnularVentaDto, usuarioModificacion: string): Promise<Venta> {
    return this.dataSource.transaction(async (manager) => {
      const venta = await manager.findOne(Venta, { where: { id, clienteId, estado: Status.ACTIVE } })
      if (!venta) throw new NotFoundException('Venta no encontrada')
      if (venta.estadoVenta === EstadoVenta.ANULADA) throw new BadRequestException('La venta ya está anulada')

      const detalles = await manager.find(DetalleVenta, { where: { ventaId: id, clienteId, estado: Status.ACTIVE } })

      // Reverse stock for detalles with lote
      for (const det of detalles) {
        if (!det.loteId) continue
        const lote = await manager.findOne(Lote, { where: { id: det.loteId } })
        if (!lote) continue
        const cantAnterior = Number(lote.cantidadActual)
        const cantPosterior = cantAnterior + Number(det.cantidad)
        Object.assign(lote, {
          cantidadActual: cantPosterior,
          estadoLote: cantPosterior > 0 ? EstadoLote.ACTIVO : lote.estadoLote,
          transaccion: Transacccion.ACTUALIZAR,
          usuarioModificacion,
        })
        await manager.save(Lote, lote)

        await manager.save(
          MovimientoStock,
          manager.create(MovimientoStock, {
            clienteId, sucursalId: venta.sucursalId, productoId: det.productoId, loteId: det.loteId,
            tipo: TipoMovimiento.DEVOLUCION_CLIENTE,
            cantidad: Number(det.cantidad), cantidadAnterior: cantAnterior, cantidadPosterior: cantPosterior,
            referenciaDocumento: venta.nroVenta, tipoDocumento: 'ANULACION',
            motivo: dto.motivo || `Anulación ${venta.nroVenta}`,
            usuarioId: usuarioModificacion,
            estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: usuarioModificacion,
          }),
        )
      }

      // Update cajaSesion
      if (venta.cajaSesionId) {
        await manager.decrement(CajaSesion, { id: venta.cajaSesionId }, 'totalVentas', Number(venta.total))
        await manager.decrement(CajaSesion, { id: venta.cajaSesionId }, 'nroVentas', 1)
      }

      Object.assign(venta, {
        estadoVenta: EstadoVenta.ANULADA,
        observaciones: dto.motivo ? `ANULADA: ${dto.motivo}${venta.observaciones ? ' | ' + venta.observaciones : ''}` : venta.observaciones,
        transaccion: Transacccion.ACTUALIZAR,
        usuarioModificacion,
      })
      return manager.save(Venta, venta)
    })
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private _ordenPicking(metodoPicking: string): Record<string, 'ASC' | 'DESC'> {
    if (metodoPicking === 'FIFO') return { fechaIngreso: 'ASC' }
    if (metodoPicking === 'LIFO') return { fechaIngreso: 'DESC' }
    return { fechaVencimiento: 'ASC', fechaIngreso: 'ASC' } // FEFO
  }
}
