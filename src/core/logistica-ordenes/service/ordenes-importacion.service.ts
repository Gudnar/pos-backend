import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OrdenImportacion } from '../entity/orden-importacion.entity'
import { ItemOrdenImportacion } from '../entity/item-orden-importacion.entity'
import { PagoProveedorImportacion } from '../entity/pago-proveedor-importacion.entity'
import { GastoLogistica } from '../entity/gasto-logistica.entity'
import { PrecioProducto } from '../../productos/entity/precio-producto.entity'
import { LotesService } from '../../lotes/service/lotes.service'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateOrdenImportacionDto, UpdateOrdenImportacionDto, CerrarOrdenDto, FormulaDto, ProponerPreciosDto, ComponenteFormulaDto, PrecioVentaManualItemDto } from '../dto/orden-importacion.dto'

function aplicarRedondeo(precio: number, redondeo?: { tipo: string; multiplo?: number }): number {
  if (!redondeo || redondeo.tipo === 'ninguno') return precio
  if (redondeo.tipo === 'entero') return Math.ceil(precio)
  if (redondeo.tipo === 'multiplo' && redondeo.multiplo) return Math.ceil(precio / redondeo.multiplo) * redondeo.multiplo
  return precio
}

function aplicarFormula(base: number, formula: FormulaDto): number {
  let precio = base
  for (const paso of formula.pasos) {
    switch (paso.operacion) {
      case 'multiplicar': precio = precio * paso.valor; break
      case 'dividir':     precio = paso.valor !== 0 ? precio / paso.valor : precio; break
      case 'sumar':       precio = precio + paso.valor; break
      case 'restar':      precio = precio - paso.valor; break
    }
  }
  if (formula.redondeo) {
    if (formula.redondeo.tipo === 'entero') {
      precio = Math.ceil(precio)
    } else if (formula.redondeo.tipo === 'multiplo' && formula.redondeo.multiplo) {
      precio = Math.ceil(precio / formula.redondeo.multiplo) * formula.redondeo.multiplo
    }
  }
  return Math.max(0, precio)
}

@Injectable()
export class OrdenesImportacionService {
  constructor(
    @InjectRepository(OrdenImportacion)
    private readonly ordenRepo: Repository<OrdenImportacion>,
    @InjectRepository(ItemOrdenImportacion)
    private readonly itemRepo: Repository<ItemOrdenImportacion>,
    @InjectRepository(PagoProveedorImportacion)
    private readonly pagoRepo: Repository<PagoProveedorImportacion>,
    @InjectRepository(GastoLogistica)
    private readonly gastoRepo: Repository<GastoLogistica>,
    @InjectRepository(PrecioProducto)
    private readonly precioRepo: Repository<PrecioProducto>,
    private readonly lotesSvc: LotesService,
  ) {}

  async listar(clienteId: string, q?: string): Promise<OrdenImportacion[]> {
    const qb = this.ordenRepo
      .createQueryBuilder('o')
      .where('o.cliente_id = :clienteId AND o._estado = :estado', { clienteId, estado: Status.ACTIVE })
      .orderBy('o.fecha_orden', 'DESC')
    if (q && q.trim()) {
      qb.andWhere('(LOWER(o.numero) LIKE LOWER(:q) OR LOWER(o.pais_origen) LIKE LOWER(:q))', { q: `%${q.trim()}%` })
    }
    return qb.getMany()
  }

  async obtener(clienteId: string, id: string): Promise<OrdenImportacion> {
    const o = await this.ordenRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!o) throw new NotFoundException(Messages.NOT_FOUND)
    return o
  }

  async obtenerDetalle(clienteId: string, id: string): Promise<any> {
    const orden = await this.obtener(clienteId, id)
    const [items, pagos, gastos] = await Promise.all([
      this.itemRepo.find({ where: { ordenImportacionId: id, clienteId, estado: Status.ACTIVE } }),
      this.pagoRepo.find({ where: { ordenImportacionId: id, clienteId, estado: Status.ACTIVE } }),
      this.gastoRepo.find({ where: { ordenImportacionId: id, clienteId, estado: Status.ACTIVE } }),
    ])
    return { ...orden, items, pagos, gastos }
  }

  private async generarNumero(clienteId: string): Promise<string> {
    const anio = new Date().getFullYear()
    const count = await this.ordenRepo.count({ where: { clienteId, estado: Status.ACTIVE } })
    return `IMP-${anio}-${String(count + 1).padStart(3, '0')}`
  }

  async crear(clienteId: string, dto: CreateOrdenImportacionDto, usuarioCreacion: string): Promise<OrdenImportacion> {
    const numero = dto.numero?.trim() || await this.generarNumero(clienteId)
    return this.ordenRepo.save(
      this.ordenRepo.create({
        ...dto,
        numero,
        clienteId,
        metodoDistribucion: dto.metodoDistribucion ?? 'POR_VALOR',
        estadoOrden: 'BORRADOR',
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion,
      }),
    )
  }

  async actualizar(clienteId: string, id: string, dto: UpdateOrdenImportacionDto, usuarioModificacion: string): Promise<OrdenImportacion> {
    const o = await this.obtener(clienteId, id)
    if (o.estadoOrden === 'CERRADO') throw new BadRequestException('No se puede modificar una orden cerrada.')
    Object.assign(o, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.ordenRepo.save(o)
  }

  async eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const o = await this.obtener(clienteId, id)
    if (o.estadoOrden !== 'BORRADOR') throw new BadRequestException('Solo se pueden eliminar órdenes en estado BORRADOR.')
    Object.assign(o, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.ordenRepo.save(o)
  }

  async calcularCostos(clienteId: string, id: string, usuarioModificacion: string): Promise<any> {
    const orden = await this.obtener(clienteId, id)
    const items = await this.itemRepo.find({ where: { ordenImportacionId: id, clienteId, estado: Status.ACTIVE } })
    const gastos = await this.gastoRepo.find({ where: { ordenImportacionId: id, clienteId, estado: Status.ACTIVE } })

    if (!items.length) throw new BadRequestException('La orden no tiene productos registrados.')

    // 1. Calcular subtotales por ítem
    for (const item of items) {
      const tc = Number(item.tipoCambio)
      const pUnitCompra = Number(item.precioUnitarioMonedaCompra)
      const cant = Number(item.cantidadUnidades)
      item.precioUnitarioMonedaBase = pUnitCompra * tc
      item.subtotalMonedaCompra = pUnitCompra * cant
      item.subtotalMonedaBase = item.precioUnitarioMonedaBase * cant
    }

    // 2. Totales
    const totalProductosMonedaCompra = items.reduce((s, i) => s + Number(i.subtotalMonedaCompra), 0)
    const totalProductosMonedaBase = items.reduce((s, i) => s + Number(i.subtotalMonedaBase), 0)
    const totalGastosMonedaBase = gastos.reduce((s, g) => s + Number(g.monto) * Number(g.tipoCambio), 0)
    const costoTotalMonedaBase = totalProductosMonedaBase + totalGastosMonedaBase
    const unidadesTotales = items.reduce((s, i) => s + Number(i.cantidadUnidades), 0)

    // 3. Distribuir gastos por ítem
    for (const item of items) {
      let factor: number
      if (orden.metodoDistribucion === 'POR_CANTIDAD') {
        factor = unidadesTotales > 0 ? Number(item.cantidadUnidades) / unidadesTotales : 0
      } else {
        factor = totalProductosMonedaBase > 0 ? Number(item.subtotalMonedaBase) / totalProductosMonedaBase : 0
      }
      item.costoLogisticaAsignado = totalGastosMonedaBase * factor
      const costoTotalItem = Number(item.subtotalMonedaBase) + item.costoLogisticaAsignado
      item.costoTotalUnitario = Number(item.cantidadUnidades) > 0 ? costoTotalItem / Number(item.cantidadUnidades) : 0
      Object.assign(item, { transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    }

    // 4. Actualizar gastos con monto en moneda base
    for (const g of gastos) {
      g.montoMonedaBase = Number(g.monto) * Number(g.tipoCambio)
      Object.assign(g, { transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    }

    // 5. Persistir
    await this.itemRepo.save(items)
    await this.gastoRepo.save(gastos)
    Object.assign(orden, {
      totalProductosMonedaCompra,
      totalProductosMonedaBase,
      totalGastosMonedaBase,
      costoTotalMonedaBase,
      unidadesTotales,
      transaccion: Transacccion.ACTUALIZAR,
      usuarioModificacion,
    })
    await this.ordenRepo.save(orden)

    return { orden, items, gastos }
  }

  async cerrarOrden(clienteId: string, id: string, dto: CerrarOrdenDto, usuarioModificacion: string): Promise<any> {
    const resultado = await this.calcularCostos(clienteId, id, usuarioModificacion)
    const { orden, items, gastos } = resultado

    // ── Cálculo de precio (puede diferir del costo contable) ──────────────
    // Filtrar gastos que participan en el precio (por defecto: todos)
    const gastosParaPrecio = (dto.gastosParaPrecio?.length)
      ? (gastos as GastoLogistica[]).filter(g => dto.gastosParaPrecio!.includes(g.id))
      : gastos as GastoLogistica[]

    // Mapa de TC efectivo para precio (original o sobreescrito)
    const tcPrecioMap = new Map<string, number>()
    for (const g of gastos as GastoLogistica[]) {
      const override = dto.tiposCambioOverride?.find(o => o.gastoId === g.id)
      tcPrecioMap.set(g.id, override ? Number(override.tipoCambio) : Number(g.tipoCambio))
    }

    const totalGastosPrecioBase = gastosParaPrecio.reduce(
      (s, g) => s + Number(g.monto) * (tcPrecioMap.get(g.id) ?? Number(g.tipoCambio)),
      0,
    )
    const totalProductosBase = (items as ItemOrdenImportacion[]).reduce(
      (s, i) => s + Number(i.subtotalMonedaBase ?? 0), 0,
    )
    const unidadesTotales = (items as ItemOrdenImportacion[]).reduce(
      (s, i) => s + Number(i.cantidadUnidades), 0,
    )

    // Guardar tasaIva en la orden si viene en el DTO
    if (dto.tasaIva != null) orden.tasaIva = dto.tasaIva

    // Mapa de precios directos por ítem (modo precio directo)
    const precioManualMap = new Map<string, number>(
      (dto.preciosVentaManual ?? []).map((p: PrecioVentaManualItemDto) => [p.itemId, p.precioVenta]),
    )
    const modoDirecto = precioManualMap.size > 0

    // ── Proponer precios ──────────────────────────────────────────────────
    const preciosPropuestos: any[] = []
    for (const item of items as ItemOrdenImportacion[]) {
      if (!item.costoTotalUnitario) continue  // skip items without calculated cost

      // Costo unitario para precio (con gastos/TC seleccionados)
      let factorPrecio: number
      if (orden.metodoDistribucion === 'POR_CANTIDAD') {
        factorPrecio = unidadesTotales > 0 ? Number(item.cantidadUnidades) / unidadesTotales : 0
      } else {
        factorPrecio = totalProductosBase > 0 ? Number(item.subtotalMonedaBase) / totalProductosBase : 0
      }
      const gastoAsignadoPrecio = totalGastosPrecioBase * factorPrecio
      const costoItemPrecio = Number(item.subtotalMonedaBase ?? 0) + gastoAsignadoPrecio
      const costoUnitPrecio = Number(item.cantidadUnidades) > 0
        ? costoItemPrecio / Number(item.cantidadUnidades)
        : Number(item.costoTotalUnitario)

      let precioSugerido: number
      let margen = 0

      if (modoDirecto && precioManualMap.has(item.id)) {
        // ── MODO PRECIO DIRECTO ──────────────────────────────────────────
        const pvManual = precioManualMap.get(item.id)!
        item.precioVentaManual = pvManual
        precioSugerido = pvManual
        margen = costoUnitPrecio > 0 ? ((pvManual / costoUnitPrecio) - 1) * 100 : 0

        if (dto.tasaIva != null) {
          const iva = Number(dto.tasaIva)
          item.precioVentaConIva = pvManual * (1 + iva)
          item.utilidadTonelada = (pvManual - Number(item.costoTotalUnitario)) * 1000
          item.utilidadToneladaConIva = (item.precioVentaConIva - Number(item.costoTotalUnitario)) * 1000
        }
      } else if (dto.formula) {
        // ── MODO FÓRMULA ─────────────────────────────────────────────────
        const baseVal = dto.formula.base === 'costoProducto'
          ? Number(item.precioUnitarioMonedaBase)
          : costoUnitPrecio
        precioSugerido = aplicarFormula(baseVal, dto.formula)
        margen = costoUnitPrecio > 0 ? ((precioSugerido / costoUnitPrecio) - 1) * 100 : 0
      } else {
        // ── MODO MARGEN SIMPLE ───────────────────────────────────────────
        margen = Number(dto.margenPorcentaje ?? 0)
        precioSugerido = costoUnitPrecio * (1 + margen / 100)
      }

      item.margenAplicado = margen
      item.precioVentaSugerido = precioSugerido
      Object.assign(item, { transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })

      // Guardar en catálogo de precios (solo ítems vinculados al catálogo)
      if (item.productoId) {
        const gastosDesc = gastosParaPrecio.length < (gastos as GastoLogistica[]).length
          ? ` | Gastos seleccionados: ${gastosParaPrecio.length}/${(gastos as GastoLogistica[]).length}`
          : ''
        const tcDesc = dto.tiposCambioOverride?.length
          ? ` | TC overrides: ${dto.tiposCambioOverride.length}`
          : ''
        const notasPrecio = modoDirecto
          ? `Costo/kg: ${costoUnitPrecio.toFixed(4)} | P.U. Venta directo: ${precioSugerido.toFixed(4)}${dto.tasaIva != null ? ` | IVA: ${(Number(dto.tasaIva) * 100).toFixed(2)}%` : ''}`
          : dto.formula
          ? `Costo precio: ${costoUnitPrecio.toFixed(4)}${gastosDesc}${tcDesc} | Fórmula: ${dto.formula.base} → ${dto.formula.pasos.map(p => `${p.operacion}(${p.valor})`).join(' → ')}${dto.formula.redondeo?.tipo !== 'ninguno' ? ` → redondeo(${dto.formula.redondeo?.tipo})` : ''}`
          : `Costo precio: ${costoUnitPrecio.toFixed(4)}${gastosDesc}${tcDesc} | Margen: ${margen.toFixed(2)}%`

        let precio = await this.precioRepo.findOne({
          where: { productoId: item.productoId, clienteId, tipo: 'LOGISTICA', estado: Status.ACTIVE },
        })
        if (precio) {
          Object.assign(precio, { precio: precioSugerido, notas: notasPrecio, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
        } else {
          precio = this.precioRepo.create({
            productoId: item.productoId, clienteId, tipo: 'LOGISTICA',
            precio: precioSugerido, moneda: 'BASE', cantidadMin: 1, activo: true,
            notas: notasPrecio, estado: Status.ACTIVE,
            transaccion: Transacccion.CREAR, usuarioCreacion: usuarioModificacion,
          })
        }
        await this.precioRepo.save(precio)
        preciosPropuestos.push({
          productoId: item.productoId,
          costoContable: item.costoTotalUnitario,
          costoParaPrecio: costoUnitPrecio,
          margen,
          precioSugerido,
          precioVentaConIva: item.precioVentaConIva ?? null,
          utilidadTonelada: item.utilidadTonelada ?? null,
          utilidadToneladaConIva: item.utilidadToneladaConIva ?? null,
        })
      }
    }

    await this.itemRepo.save(items)
    Object.assign(orden, { estadoOrden: 'CERRADO', transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    await this.ordenRepo.save(orden)

    // Ingreso automático al inventario (opcional)
    const lotesCreados: any[] = []
    if (dto.ingresarInventario && dto.sucursalId) {
      for (const item of items as ItemOrdenImportacion[]) {
        if (!item.productoId || !item.cantidadUnidades) continue
        const lote = await this.lotesSvc.ingresar(
          orden.clienteId,
          {
            productoId: item.productoId,
            sucursalId: dto.sucursalId,
            cantidad: Number(item.cantidadUnidades),
            nroLote: orden.numero,
            proveedorId: orden.proveedorId,
            paisOrigen: orden.paisOrigen,
            nroPedidoCompra: orden.numero,
            referenciaDocumento: orden.numero,
            notas: `Ingreso desde orden de importación ${orden.numero}`,
          },
          usuarioModificacion,
        )
        lotesCreados.push({ productoId: item.productoId, loteId: lote.id, cantidad: item.cantidadUnidades })
      }
    }

    return { orden, items, preciosPropuestos, lotesCreados }
  }

  async proponerPrecios(clienteId: string, id: string, dto: ProponerPreciosDto, usuarioModificacion: string): Promise<any> {
    const orden = await this.obtener(clienteId, id)
    const items = await this.itemRepo.find({ where: { ordenImportacionId: id, clienteId, estado: Status.ACTIVE } })
    const gastos = await this.gastoRepo.find({ where: { ordenImportacionId: id, clienteId, estado: Status.ACTIVE } })

    if (!items.length) throw new BadRequestException('La orden no tiene productos registrados.')

    // Gastos seleccionados para precio
    const gastosActivos = dto.gastosParaPrecio?.length
      ? gastos.filter(g => dto.gastosParaPrecio!.includes(g.id))
      : gastos

    // TC efectivo por gasto (original o sobreescrito)
    const tcMap = new Map<string, number>()
    for (const g of gastos) {
      const ov = dto.tiposCambioOverride?.find(o => o.gastoId === g.id)
      tcMap.set(g.id, ov ? Number(ov.tipoCambio) : Number(g.tipoCambio))
    }

    const totalGastosPrecioBase = gastosActivos.reduce(
      (s, g) => s + Number(g.monto) * (tcMap.get(g.id) ?? Number(g.tipoCambio)), 0,
    )
    const totalProductosBase = items.reduce((s, i) => s + Number(i.subtotalMonedaBase ?? 0), 0)
    const unidadesTotales = items.reduce((s, i) => s + Number(i.cantidadUnidades), 0)

    const preciosPropuestos: any[] = []

    for (const item of items) {
      if (!item.productoId) continue

      // Distribución proporcional de logística
      let factor: number
      if (orden.metodoDistribucion === 'POR_CANTIDAD') {
        factor = unidadesTotales > 0 ? Number(item.cantidadUnidades) / unidadesTotales : 0
      } else {
        factor = totalProductosBase > 0 ? Number(item.subtotalMonedaBase ?? 0) / totalProductosBase : 0
      }
      const logUnit = Number(item.cantidadUnidades) > 0
        ? (totalGastosPrecioBase * factor) / Number(item.cantidadUnidades) : 0
      const compraUnit = Number(item.precioUnitarioMonedaBase ?? 0)

      // Aplicar componentes
      const aplicarComponente = (base: number, comp: ComponenteFormulaDto) =>
        base * Number(comp.multiplicador) + Number(comp.sumarFijo ?? 0)

      let precio = aplicarComponente(compraUnit, dto.componenteCompra)
               + aplicarComponente(logUnit, dto.componenteLogistica)
               + Number(dto.ajusteFijo ?? 0)
      precio = aplicarRedondeo(Math.max(0, precio), dto.redondeo)

      // Guardar precio LOGISTICA en catálogo
      let precioReg = await this.precioRepo.findOne({
        where: { productoId: item.productoId, clienteId, tipo: 'LOGISTICA', estado: Status.ACTIVE },
      })
      const notas = `CompraUnit:${compraUnit.toFixed(4)}×${dto.componenteCompra.multiplicador} | LogUnit:${logUnit.toFixed(4)}×${dto.componenteLogistica.multiplicador} | Gastos:${gastosActivos.length}/${gastos.length} | Ajuste:${dto.ajusteFijo ?? 0}`
      if (precioReg) {
        Object.assign(precioReg, { precio, notas, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
      } else {
        precioReg = this.precioRepo.create({
          productoId: item.productoId, clienteId, tipo: 'LOGISTICA',
          precio, moneda: 'BASE', cantidadMin: 1, activo: true, notas,
          estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: usuarioModificacion,
        })
      }
      await this.precioRepo.save(precioReg)

      preciosPropuestos.push({
        productoId: item.productoId,
        descripcion: item.descripcionProducto,
        compraUnit,
        logUnit,
        precio,
      })
    }

    return {
      totalGastosPrecioBase,
      totalProductosBase,
      gastosIncluidos: gastosActivos.length,
      totalGastos: gastos.length,
      preciosPropuestos,
    }
  }

  async trazabilidad(clienteId: string, id: string): Promise<any> {
    const orden = await this.obtener(clienteId, id)
    const [items, pagos, gastos] = await Promise.all([
      this.itemRepo.find({ where: { ordenImportacionId: id, clienteId, estado: Status.ACTIVE } }),
      this.pagoRepo.find({ where: { ordenImportacionId: id, clienteId, estado: Status.ACTIVE } }),
      this.gastoRepo.find({ where: { ordenImportacionId: id, clienteId, estado: Status.ACTIVE } }),
    ])

    const totalPagosMonedaBase = pagos.reduce((s, p) => s + Number(p.monto) * Number(p.tipoCambio), 0)
    const totalGastosMonedaBase = gastos.reduce((s, g) => s + Number(g.monto) * Number(g.tipoCambio), 0)
    const totalProductosMonedaBase = items.reduce((s, i) => s + Number(i.subtotalMonedaBase ?? 0), 0)

    return {
      orden,
      resumen: {
        totalPagosMonedaBase,
        totalGastosMonedaBase,
        totalProductosMonedaBase,
        costoTotalMonedaBase: totalProductosMonedaBase + totalGastosMonedaBase,
        unidadesTotales: items.reduce((s, i) => s + Number(i.cantidadUnidades), 0),
      },
      pagos: pagos.map(p => ({
        ...p,
        montoMonedaBase: Number(p.monto) * Number(p.tipoCambio),
      })),
      gastos: gastos.map(g => ({
        ...g,
        montoMonedaBase: Number(g.monto) * Number(g.tipoCambio),
      })),
      items: items.map(i => ({
        ...i,
        costoLogisticaAsignado: i.costoLogisticaAsignado ?? null,
        costoTotalUnitario: i.costoTotalUnitario ?? null,
        precioVentaSugerido: i.precioVentaSugerido ?? null,
      })),
    }
  }
}
