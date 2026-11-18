import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository, In, Like, Not } from 'typeorm'
import { Venta, EstadoVenta } from '../entity/venta.entity'
import { DetalleVenta } from '../entity/detalle-venta.entity'
import { Lote, EstadoLote } from '../../lotes/entity/lote.entity'
import { MovimientoStock, TipoMovimiento } from '../../movimientos-stock/entity/movimiento-stock.entity'
import { Producto } from '../../productos/entity/producto.entity'
import { CajaSesion, EstadoSesion } from '../../caja/entity/caja-sesion.entity'
import { IngresosService } from '../../ingresos/service/ingresos.service'
import { Status, Transacccion } from '../../../common/constants'
import { CrearVentaDto, AnularVentaDto, VentaPosDto } from '../dto/venta.dto'

/** Valores que calcula el cobro del POS y que no vienen del DTO genérico. */
type OpcionesVenta = {
  fecha?: string
  estadoVenta?: string
  montoPagado?: number
  cambio?: number | null
  montoEfectivoCaja?: number
  nitCi?: string
  telefonoCliente?: string
}

const r2 = (n: number) => Math.round(n * 100) / 100
const ETIQUETA_PAGO: Record<string, string> = {
  EFECTIVO: 'Efectivo', TRANSFERENCIA: 'Transferencia', CHEQUE: 'Cheque', QR: 'QR', TARJETA: 'Tarjeta', ADELANTO: 'Adelanto',
}

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

  async crear(clienteId: string, dto: CrearVentaDto, usuarioId: string, opciones: OpcionesVenta = {}): Promise<Venta> {
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
        // Lote elegido en el POS: se usa primero y, si no alcanza, se sigue con los demás en orden de picking
        if (det.loteId) {
          const elegido = lotes.find(l => l.id === det.loteId)
          if (!elegido) {
            throw new BadRequestException(`El lote seleccionado para "${producto.nombre}" no está disponible en esta sucursal`)
          }
          lotes.splice(lotes.indexOf(elegido), 1)
          lotes.unshift(elegido)
        }

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
        fecha: opciones.fecha || new Date().toISOString().split('T')[0],
        estadoVenta: opciones.estadoVenta || EstadoVenta.PAGADA,
        metodoPago: dto.metodoPago,
        subtotal, descuento, impuesto, total,
        montoPagado: opciones.montoPagado ?? dto.montoPagado ?? null,
        cambio: opciones.cambio !== undefined ? opciones.cambio : cambio,
        montoEfectivo: opciones.montoEfectivoCaja ?? null,
        nitCi: opciones.nitCi || null, telefonoCliente: opciones.telefonoCliente || null,
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
        // La sesión de caja acumula el efectivo esperado; si no se indicó, se asume todo en efectivo
        await manager.increment(CajaSesion, { id: dto.cajaSesionId }, 'totalVentas', opciones.montoEfectivoCaja ?? total)
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

  /**
   * Venta desde el POS. conCobro=true (COBRAR): pagos en uno o varios métodos; el saldo solo se acepta
   * si se pide registrarlo como deuda. conCobro=false (GUARDAR): sin pagos, todo el total queda como deuda.
   */
  async registrarDesdePOS(clienteId: string, dto: VentaPosDto, usuarioId: string, conCobro: boolean): Promise<Venta> {
    if (dto.tipoOperacion === 'COTIZACION') {
      throw new BadRequestException('Una cotización no se registra como venta: no descuenta stock ni genera cobro')
    }
    const total = r2(dto.detalles.reduce((s, d) => s + Number(d.precioUnitario) * Number(d.cantidad) - Number(d.descuento || 0), 0))
    const pagos = conCobro ? (dto.pagos || []).filter(p => Number(p.monto) > 0) : []

    const adelantos = pagos.filter(p => p.metodoPago === 'ADELANTO')
    if (adelantos.length > 1) throw new BadRequestException('Solo se puede aplicar un adelanto por venta')
    if (adelantos.length && !adelantos[0].adelantoId) throw new BadRequestException('Selecciona el adelanto a aplicar')

    const totalPagado = r2(pagos.reduce((s, p) => s + Number(p.monto), 0))
    const efectivo = r2(pagos.filter(p => p.metodoPago === 'EFECTIVO').reduce((s, p) => s + Number(p.monto), 0))
    if (r2(totalPagado - efectivo) > total + 0.009) {
      throw new BadRequestException('Los pagos que no son en efectivo superan el total; solo el efectivo puede dar cambio')
    }
    const cambio = r2(Math.max(0, totalPagado - total))
    const saldo = r2(Math.max(0, total - totalPagado))
    if (conCobro && saldo > 0 && !dto.registrarDeuda) {
      throw new BadRequestException(`Faltan Bs ${saldo.toFixed(2)}. Completa el pago o regístralo como deuda`)
    }

    // Sesión de caja del usuario: obligatoria para cobrar
    const sesion = await this.sesionRepo.findOne({
      where: { clienteId, usuarioId, estadoSesion: EstadoSesion.ABIERTA, estado: Status.ACTIVE },
    })
    if (conCobro && !sesion) throw new BadRequestException('No tienes una caja abierta. Abre la caja antes de cobrar')
    if (sesion && sesion.sucursalId && sesion.sucursalId !== dto.sucursalId) {
      throw new BadRequestException('Tu caja abierta pertenece a otra sucursal')
    }

    const metodos = [...new Set(pagos.map(p => p.metodoPago))]
    const metodoPago = !metodos.length ? 'CREDITO' : metodos.length === 1 ? metodos[0] : 'MIXTO'
    const resumenPagos = pagos.length
      ? 'Pagos: ' + pagos.map(p => `${ETIQUETA_PAGO[p.metodoPago] || p.metodoPago} Bs ${Number(p.monto).toFixed(2)}${p.referencia ? ` (ref. ${p.referencia})` : ''}`).join(', ')
      : ''

    const ventaDto: CrearVentaDto = {
      sucursalId: dto.sucursalId,
      cajaId: sesion?.cajaId,
      cajaSesionId: sesion?.id,
      metodoPago,
      contactoClienteId: dto.contactoClienteId,
      nombreCliente: dto.nombreCliente,
      observaciones: [dto.observaciones, resumenPagos].filter(Boolean).join(' | ') || undefined,
      adelantoId: adelantos[0]?.adelantoId,
      montoAdelanto: adelantos[0] ? Number(adelantos[0].monto) : undefined,
      detalles: dto.detalles,
    }
    return this.crear(clienteId, ventaDto, usuarioId, {
      fecha: dto.fecha,
      estadoVenta: saldo > 0 ? EstadoVenta.PENDIENTE : EstadoVenta.PAGADA,
      montoPagado: totalPagado,
      cambio: cambio > 0 ? cambio : null,
      montoEfectivoCaja: r2(efectivo - cambio),
      nitCi: dto.nitCi,
      telefonoCliente: dto.telefonoCliente,
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
        const efectivoCaja = venta.montoEfectivo != null ? Number(venta.montoEfectivo) : Number(venta.total)
        await manager.decrement(CajaSesion, { id: venta.cajaSesionId }, 'totalVentas', efectivoCaja)
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
    // fechaCreacion desempata lotes del mismo día; el POS usa el mismo orden (LotesService.lotesParaPOS)
    if (metodoPicking === 'FIFO') return { fechaIngreso: 'ASC', fechaCreacion: 'ASC' }
    if (metodoPicking === 'LIFO') return { fechaIngreso: 'DESC', fechaCreacion: 'DESC' }
    return { fechaVencimiento: 'ASC', fechaIngreso: 'ASC', fechaCreacion: 'ASC' } // FEFO
  }
}
