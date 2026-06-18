import { Injectable, NotFoundException, BadRequestException, StreamableFile } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource, EntityManager } from 'typeorm'
import * as ExcelJS from 'exceljs'
import PDFDocument = require('pdfkit')
import { Compra, TipoCompra, EstadoCompra, EstadoPagoCompra } from '../entity/compra.entity'
import { CompraDetalle } from '../entity/compra-detalle.entity'
import { PagoProveedor } from '../entity/pago-proveedor.entity'
import { CompraLog, TipoLog } from '../entity/compra-log.entity'
import { Lote, EstadoLote } from '../../lotes/entity/lote.entity'
import { MovimientoStock, TipoMovimiento } from '../../movimientos-stock/entity/movimiento-stock.entity'
import { Status, Transacccion } from '../../../common/constants'
import {
  CreateCompraDto, UpdateCompraDto, UpdateIngresoDto,
  MarcarPendienteDto, FinalizarCompraDto, EditarOrdenDto,
  CreatePagoProveedorDto,
} from '../dto/compra.dto'

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly compraRepo: Repository<Compra>,
    @InjectRepository(CompraDetalle)
    private readonly detalleRepo: Repository<CompraDetalle>,
    @InjectRepository(PagoProveedor)
    private readonly pagoRepo: Repository<PagoProveedor>,
    @InjectRepository(CompraLog)
    private readonly logRepo: Repository<CompraLog>,
    @InjectRepository(Lote)
    private readonly loteRepo: Repository<Lote>,
    @InjectRepository(MovimientoStock)
    private readonly movimientoRepo: Repository<MovimientoStock>,
    private readonly dataSource: DataSource,
  ) {}

  // ── Listar ──────────────────────────────────────────────────────────────────

  async listar(clienteId: string, filtros: {
    tipo?: string
    estado?: string
    proveedorId?: string
    fechaDesde?: string
    fechaHasta?: string
  } = {}): Promise<any[]> {
    const qb = this.compraRepo
      .createQueryBuilder('c')
      .where('c.cliente_id = :clienteId AND c._estado = :est', { clienteId, est: Status.ACTIVE })
      .orderBy('c.fecha', 'DESC')
      .addOrderBy('c.nro_compra', 'DESC')

    if (filtros.tipo) qb.andWhere('c.tipo_compra = :tipo', { tipo: filtros.tipo })
    if (filtros.estado) qb.andWhere('c.estado_compra = :estado', { estado: filtros.estado })
    if (filtros.proveedorId) qb.andWhere('c.proveedor_id = :prov', { prov: filtros.proveedorId })
    if (filtros.fechaDesde) qb.andWhere('c.fecha >= :desde', { desde: filtros.fechaDesde })
    if (filtros.fechaHasta) qb.andWhere('c.fecha <= :hasta', { hasta: filtros.fechaHasta })

    return qb.getMany()
  }

  async obtener(clienteId: string, id: string): Promise<any> {
    const compra = await this.compraRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!compra) throw new NotFoundException('Compra no encontrada')

    const detalles = await this.detalleRepo.find({
      where: { compraId: id, clienteId, estado: Status.ACTIVE },
    })
    const pagos = await this.pagoRepo.find({
      where: { compraId: id, clienteId, estado: Status.ACTIVE },
    })
    return { ...compra, detalles, pagos }
  }

  // ── Crear ───────────────────────────────────────────────────────────────────

  async crear(clienteId: string, dto: CreateCompraDto, usuarioId: string): Promise<Compra> {
    if (!dto.detalles?.length) throw new BadRequestException('Debe incluir al menos un detalle')

    const subtotal = dto.detalles.reduce((acc, d) => acc + (d.cantidad * d.precioUnitario - (d.descuento || 0)), 0)
    const esInicial = dto.tipoCompra === TipoCompra.INICIAL
    const nroCompra = await this.generarNro(clienteId, dto.tipoCompra)

    const qr = this.dataSource.createQueryRunner()
    await qr.connect()
    await qr.startTransaction()

    try {
      const compra = await qr.manager.save(Compra, {
        clienteId,
        sucursalId: dto.sucursalId,
        proveedorId: dto.proveedorId,
        nroCompra,
        tipoCompra: dto.tipoCompra,
        estadoCompra: esInicial ? EstadoCompra.FINALIZADO : EstadoCompra.EN_TRANSITO,
        estadoPago: EstadoPagoCompra.PENDIENTE,
        fecha: dto.fecha,
        nroFactura: dto.nroFactura,
        fechaEnvio: dto.fechaEnvio || null,
        fechaEstimadaLlegada: dto.fechaEstimadaLlegada || null,
        nroGuiaRemision: dto.nroGuiaRemision || null,
        transportista: dto.transportista || null,
        subtotal,
        descuento: 0,
        total: subtotal,
        montoPagado: 0,
        observaciones: dto.observaciones,
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion: usuarioId,
      } as any) as unknown as Compra

      const detalles = await Promise.all(
        dto.detalles.map(d => {
          const sub = d.cantidad * d.precioUnitario - (d.descuento || 0)
          return qr.manager.save(CompraDetalle, {
            clienteId,
            compraId: compra.id,
            productoId: d.productoId,
            unidadId: d.unidadId,
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario,
            totalCompra: d.totalCompra ?? null,
            descuento: d.descuento || 0,
            subtotal: sub,
            moneda: d.moneda || 'BOB',
            nroLote: d.nroLote || null,
            fechaVencimiento: d.fechaVencimiento || null,
            estado: Status.ACTIVE,
            transaccion: Transacccion.CREAR,
            usuarioCreacion: usuarioId,
          } as any)
        }),
      )

      if (esInicial) {
        await this.ingresarLotesEnManager(qr.manager, clienteId, compra, detalles, usuarioId)
      }

      await qr.commitTransaction()

      await this.log(clienteId, compra.id, TipoLog.CREACION, null, compra.estadoCompra,
        `${compra.tipoCompra === TipoCompra.INICIAL ? 'Ingreso inicial' : 'Orden de compra'} creada con ${dto.detalles.length} producto(s). Total: ${subtotal.toFixed(2)}`,
        usuarioId)

      return compra
    } catch (err) {
      await qr.rollbackTransaction()
      throw err
    } finally {
      await qr.release()
    }
  }

  // ── Editar orden (EN_TRANSITO o PENDIENTE) ──────────────────────────────────

  async editarOrden(clienteId: string, id: string, dto: EditarOrdenDto, usuarioId: string): Promise<Compra> {
    const compra = await this.compraRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!compra) throw new NotFoundException('Compra no encontrada')
    if (compra.estadoCompra === EstadoCompra.FINALIZADO || compra.estadoCompra === EstadoCompra.ANULADA) {
      throw new BadRequestException('No se puede editar una compra finalizada o anulada')
    }
    if (!dto.detalles?.length) throw new BadRequestException('Debe incluir al menos un detalle')

    const cambios: string[] = []
    if (dto.proveedorId && dto.proveedorId !== compra.proveedorId) cambios.push('Proveedor actualizado')
    if (dto.fecha && dto.fecha !== compra.fecha) cambios.push(`Fecha: ${compra.fecha} → ${dto.fecha}`)
    if (dto.nroFactura !== undefined && dto.nroFactura !== compra.nroFactura) cambios.push(`Nro Factura: "${compra.nroFactura || '—'}" → "${dto.nroFactura || '—'}"`)
    if (dto.nroGuiaRemision !== undefined && dto.nroGuiaRemision !== compra.nroGuiaRemision) cambios.push(`Guía: "${dto.nroGuiaRemision}"`)
    if (dto.transportista !== undefined && dto.transportista !== compra.transportista) cambios.push(`Transportista: "${dto.transportista}"`)
    if (dto.fechaEstimadaLlegada !== undefined && dto.fechaEstimadaLlegada !== compra.fechaEstimadaLlegada) cambios.push(`Llegada estimada: ${dto.fechaEstimadaLlegada || '—'}`)

    Object.assign(compra, {
      proveedorId: dto.proveedorId ?? compra.proveedorId,
      sucursalId: dto.sucursalId ?? compra.sucursalId,
      fecha: dto.fecha ?? compra.fecha,
      nroFactura: dto.nroFactura !== undefined ? dto.nroFactura || null : compra.nroFactura,
      fechaEnvio: dto.fechaEnvio !== undefined ? dto.fechaEnvio || null : compra.fechaEnvio,
      fechaEstimadaLlegada: dto.fechaEstimadaLlegada !== undefined ? dto.fechaEstimadaLlegada || null : compra.fechaEstimadaLlegada,
      nroGuiaRemision: dto.nroGuiaRemision !== undefined ? dto.nroGuiaRemision || null : compra.nroGuiaRemision,
      transportista: dto.transportista !== undefined ? dto.transportista || null : compra.transportista,
      observaciones: dto.observaciones !== undefined ? dto.observaciones : compra.observaciones,
      transaccion: Transacccion.ACTUALIZAR,
      usuarioModificacion: usuarioId,
    })

    const detallesActuales = await this.detalleRepo.find({ where: { compraId: id, clienteId, estado: Status.ACTIVE } })
    const idsEnviados = new Set(dto.detalles.filter(d => d.id).map(d => d.id!))

    for (const det of detallesActuales) {
      if (!idsEnviados.has(det.id)) {
        await this.detalleRepo.update(det.id, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion: usuarioId } as any)
        cambios.push(`Producto eliminado del detalle`)
      }
    }

    const detallesMap = new Map(detallesActuales.map(d => [d.id, d]))

    for (const d of dto.detalles) {
      const sub = d.cantidad * d.precioUnitario - (d.descuento || 0)
      if (d.id && detallesMap.has(d.id)) {
        const actual = detallesMap.get(d.id)!
        if (Number(d.cantidad) !== Number(actual.cantidad)) cambios.push(`Cantidad: ${actual.cantidad} → ${d.cantidad}`)
        if (Number(d.precioUnitario) !== Number(actual.precioUnitario)) cambios.push(`Precio: ${actual.precioUnitario} → ${d.precioUnitario}`)
        await this.detalleRepo.update(d.id, {
          productoId: d.productoId, unidadId: d.unidadId,
          cantidad: d.cantidad, precioUnitario: d.precioUnitario, totalCompra: d.totalCompra ?? null,
          descuento: d.descuento || 0, subtotal: sub,
          nroLote: d.nroLote || null, fechaVencimiento: d.fechaVencimiento || null,
          transaccion: Transacccion.ACTUALIZAR, usuarioModificacion: usuarioId,
        } as any)
      } else {
        await this.detalleRepo.save(this.detalleRepo.create({
          clienteId, compraId: id, productoId: d.productoId, unidadId: d.unidadId,
          cantidad: d.cantidad, precioUnitario: d.precioUnitario, totalCompra: d.totalCompra ?? null,
          descuento: d.descuento || 0, subtotal: sub,
          nroLote: d.nroLote || null, fechaVencimiento: d.fechaVencimiento || null,
          estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: usuarioId,
        } as any))
        cambios.push('Nuevo producto agregado')
      }
    }

    const todos = await this.detalleRepo.find({ where: { compraId: id, clienteId, estado: Status.ACTIVE } })
    const subtotal = todos.reduce((acc, d) => acc + Number(d.subtotal), 0)
    compra.subtotal = subtotal
    compra.total = subtotal
    const guardada = await this.compraRepo.save(compra)

    if (cambios.length) {
      await this.log(clienteId, id, TipoLog.EDICION, compra.estadoCompra, null,
        `Editada (${compra.estadoCompra}): ${cambios.join('; ')}`, usuarioId)
    }

    return guardada
  }

  // ── Actualizar (solo cabecera, compatibilidad) ──────────────────────────────

  async actualizar(clienteId: string, id: string, dto: UpdateCompraDto, usuarioId: string): Promise<Compra> {
    const compra = await this.compraRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!compra) throw new NotFoundException('Compra no encontrada')
    if (compra.estadoCompra === EstadoCompra.FINALIZADO || compra.estadoCompra === EstadoCompra.ANULADA) {
      throw new BadRequestException('Solo se puede editar una compra activa')
    }
    Object.assign(compra, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion: usuarioId })
    return this.compraRepo.save(compra)
  }

  // ── Editar ingreso inicial ──────────────────────────────────────────────────

  async editarIngreso(clienteId: string, id: string, dto: UpdateIngresoDto, usuarioId: string): Promise<Compra> {
    const compra = await this.compraRepo.findOne({
      where: { id, clienteId, estado: Status.ACTIVE, tipoCompra: TipoCompra.INICIAL },
    })
    if (!compra) throw new NotFoundException('Ingreso inicial no encontrado')
    if (!dto.detalles?.length) throw new BadRequestException('Debe incluir al menos un detalle')

    // Update header
    if (dto.sucursalId) compra.sucursalId = dto.sucursalId
    if (dto.fecha) compra.fecha = dto.fecha
    if (dto.observaciones !== undefined) compra.observaciones = dto.observaciones
    compra.transaccion = Transacccion.ACTUALIZAR
    compra.usuarioModificacion = usuarioId

    // Existing detalles
    const detallesActuales = await this.detalleRepo.find({
      where: { compraId: id, clienteId, estado: Status.ACTIVE },
    })
    const idsEnviados = new Set(dto.detalles.filter(d => d.id).map(d => d.id!))

    // Remove detalles not included in the new list
    for (const det of detallesActuales) {
      if (!idsEnviados.has(det.id)) {
        await this.detalleRepo.update(det.id, {
          estado: Status.ELIMINATE,
          transaccion: Transacccion.ELIMINAR,
          usuarioModificacion: usuarioId,
        } as any)
        if (det.loteId) {
          await this.loteRepo.update(det.loteId, {
            estado: Status.ELIMINATE,
            transaccion: Transacccion.ELIMINAR,
            usuarioModificacion: usuarioId,
          } as any)
        }
      }
    }

    const detallesMap = new Map(detallesActuales.map(d => [d.id, d]))
    const nuevosDetalles: CompraDetalle[] = []

    for (const d of dto.detalles) {
      const sub = d.cantidad * d.precioUnitario - (d.descuento || 0)

      if (d.id && detallesMap.has(d.id)) {
        // Update existing detalle
        const detActual = detallesMap.get(d.id)!
        const delta = d.cantidad - Number(detActual.cantidad)

        await this.detalleRepo.update(d.id, {
          productoId: d.productoId,
          unidadId: d.unidadId,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          totalCompra: d.totalCompra ?? null,
          descuento: d.descuento || 0,
          subtotal: sub,
          nroLote: d.nroLote,
          fechaVencimiento: d.fechaVencimiento || null,
          transaccion: Transacccion.ACTUALIZAR,
          usuarioModificacion: usuarioId,
        } as any)

        if (detActual.loteId && delta !== 0) {
          await this.loteRepo
            .createQueryBuilder()
            .update(Lote)
            .set({
              cantidadInicial: () => `cantidad_inicial + ${delta}`,
              cantidadActual: () => `cantidad_actual + ${delta}`,
              nroLote: d.nroLote,
              fechaVencimiento: d.fechaVencimiento || null,
              transaccion: Transacccion.ACTUALIZAR,
              usuarioModificacion: usuarioId,
            } as any)
            .where('id = :loteId', { loteId: detActual.loteId })
            .execute()
        }
      } else {
        // New detalle → create it and generate lote below
        const newDet = await this.detalleRepo.save(this.detalleRepo.create({
          clienteId,
          compraId: id,
          productoId: d.productoId,
          unidadId: d.unidadId,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          totalCompra: d.totalCompra ?? null,
          descuento: d.descuento || 0,
          subtotal: sub,
          nroLote: d.nroLote || null,
          fechaVencimiento: d.fechaVencimiento || null,
          estado: Status.ACTIVE,
          transaccion: Transacccion.CREAR,
          usuarioCreacion: usuarioId,
        } as any)) as unknown as CompraDetalle
        nuevosDetalles.push(newDet)
      }
    }

    if (nuevosDetalles.length) {
      await this.ingresarLotesEnManager(this.dataSource.manager, clienteId, compra, nuevosDetalles, usuarioId)
    }

    // Recalculate totals from active detalles
    const todosDetalles = await this.detalleRepo.find({
      where: { compraId: id, clienteId, estado: Status.ACTIVE },
    })
    const subtotal = todosDetalles.reduce((acc, d) => acc + Number(d.subtotal), 0)
    compra.subtotal = subtotal
    compra.total = subtotal

    return this.compraRepo.save(compra)
  }

  // ── Eliminar ingreso inicial ────────────────────────────────────────────────

  async eliminarIngreso(clienteId: string, id: string, usuarioId: string): Promise<void> {
    const compra = await this.compraRepo.findOne({
      where: { id, clienteId, estado: Status.ACTIVE, tipoCompra: TipoCompra.INICIAL },
    })
    if (!compra) throw new NotFoundException('Ingreso inicial no encontrado')

    const detalles = await this.detalleRepo.find({
      where: { compraId: id, clienteId, estado: Status.ACTIVE },
    })

    for (const det of detalles) {
      if (det.loteId) {
        await this.loteRepo.update(det.loteId, {
          estado: Status.ELIMINATE,
          transaccion: Transacccion.ELIMINAR,
          usuarioModificacion: usuarioId,
        } as any)
        await this.movimientoRepo.update(
          { loteId: det.loteId, clienteId },
          { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion: usuarioId } as any,
        )
      }
      await this.detalleRepo.update(det.id, {
        estado: Status.ELIMINATE,
        transaccion: Transacccion.ELIMINAR,
        usuarioModificacion: usuarioId,
      } as any)
    }

    Object.assign(compra, {
      estadoCompra: EstadoCompra.ANULADA,
      estado: Status.ELIMINATE,
      transaccion: Transacccion.ELIMINAR,
      usuarioModificacion: usuarioId,
    })
    await this.compraRepo.save(compra)
  }

  // ── Anular ──────────────────────────────────────────────────────────────────

  async anular(clienteId: string, id: string, motivo: string | undefined, usuarioId: string): Promise<void> {
    const compra = await this.compraRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!compra) throw new NotFoundException('Compra no encontrada')
    if (compra.estadoCompra === EstadoCompra.FINALIZADO) {
      throw new BadRequestException('No se puede anular una compra ya finalizada')
    }
    const estadoAnteriorAnular = compra.estadoCompra
    Object.assign(compra, {
      estadoCompra: EstadoCompra.ANULADA,
      transaccion: Transacccion.ACTUALIZAR,
      usuarioModificacion: usuarioId,
    })
    await this.compraRepo.save(compra)
    const descripcion = motivo ? `Compra anulada. Motivo: ${motivo}` : 'Compra anulada'
    await this.log(clienteId, id, TipoLog.ESTADO, estadoAnteriorAnular, EstadoCompra.ANULADA, descripcion, usuarioId)
  }

  // ── Marcar Pendiente (EN_TRANSITO → PENDIENTE) ───────────────────────────────

  async marcarPendiente(clienteId: string, id: string, dto: MarcarPendienteDto, usuarioId: string): Promise<Compra> {
    const compra = await this.compraRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!compra) throw new NotFoundException('Compra no encontrada')
    if (compra.estadoCompra !== EstadoCompra.EN_TRANSITO) {
      throw new BadRequestException('La compra debe estar en estado EN_TRANSITO')
    }
    Object.assign(compra, {
      estadoCompra: EstadoCompra.PENDIENTE,
      fechaRecepcion: dto.fechaRecepcion,
      usuarioRecepcion: usuarioId,
      condicionMercancia: dto.condicionMercancia || null,
      observacionesRecepcion: dto.observacionesRecepcion || null,
      transaccion: Transacccion.ACTUALIZAR,
      usuarioModificacion: usuarioId,
    })
    const guardada = await this.compraRepo.save(compra)
    const condTxt = dto.condicionMercancia ? ` · Condición: ${dto.condicionMercancia}` : ''
    const obsTxt = dto.observacionesRecepcion ? ` · ${dto.observacionesRecepcion}` : ''
    await this.log(clienteId, id, TipoLog.ESTADO, EstadoCompra.EN_TRANSITO, EstadoCompra.PENDIENTE,
      `Mercancía recibida en almacén el ${dto.fechaRecepcion}${condTxt}${obsTxt}`, usuarioId)
    return guardada
  }

  // ── Finalizar (PENDIENTE → FINALIZADO) ───────────────────────────────────────

  async finalizar(clienteId: string, id: string, dto: FinalizarCompraDto, usuarioId: string): Promise<Compra> {
    const compra = await this.compraRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!compra) throw new NotFoundException('Compra no encontrada')
    if (compra.estadoCompra !== EstadoCompra.PENDIENTE) {
      throw new BadRequestException('La compra debe estar en estado PENDIENTE para finalizar')
    }

    const detalles = await this.detalleRepo.find({
      where: { compraId: id, clienteId, estado: Status.ACTIVE },
    })

    // Apply lot data from DTO onto detalles before creating lots
    const loteMap = new Map(dto.detalles.map(d => [d.id, d]))
    for (const det of detalles) {
      const info = loteMap.get(det.id)
      if (info) {
        ;(det as any).nroLote = info.nroLote || null
        ;(det as any).fechaVencimiento = info.fechaVencimiento || null
      }
    }

    const today = new Date().toISOString().split('T')[0]
    const qr = this.dataSource.createQueryRunner()
    await qr.connect()
    await qr.startTransaction()

    try {
      // Persist lot data changes on detalles
      for (const det of detalles) {
        const info = loteMap.get(det.id)
        if (info) {
          await qr.manager.update(CompraDetalle, det.id, {
            nroLote: det.nroLote,
            fechaVencimiento: det.fechaVencimiento,
            transaccion: Transacccion.ACTUALIZAR,
            usuarioModificacion: usuarioId,
          } as any)
        }
      }

      await this.ingresarLotesEnManager(qr.manager, clienteId, compra, detalles, usuarioId)

      Object.assign(compra, {
        estadoCompra: EstadoCompra.FINALIZADO,
        fechaFinalizacion: today,
        usuarioFinalizacion: usuarioId,
        observacionesFinalizacion: dto.observacionesFinalizacion || null,
        transaccion: Transacccion.ACTUALIZAR,
        usuarioModificacion: usuarioId,
      })
      const guardada = await qr.manager.save(compra)
      await qr.commitTransaction()
      await this.log(clienteId, id, TipoLog.ESTADO, EstadoCompra.PENDIENTE, EstadoCompra.FINALIZADO,
        `Compra finalizada el ${today}. Lotes de inventario generados. ${dto.observacionesFinalizacion || ''}`.trim(), usuarioId)
      return guardada
    } catch (err) {
      await qr.rollbackTransaction()
      throw err
    } finally {
      await qr.release()
    }
  }

  // ── Logs / Trazabilidad ──────────────────────────────────────────────────────

  async obtenerLogs(clienteId: string, compraId: string): Promise<CompraLog[]> {
    return this.logRepo.find({
      where: { clienteId, compraId },
      order: { createdAt: 'DESC' },
    })
  }

  // ── Reporte Excel ────────────────────────────────────────────────────────────

  async exportarExcel(clienteId: string, filtros: {
    tipo?: string; estado?: string; proveedorId?: string; fechaDesde?: string; fechaHasta?: string
  } = {}): Promise<Buffer> {
    const compras = await this.listar(clienteId, filtros)

    const wb = new ExcelJS.Workbook()
    wb.creator = 'Sistema POS'
    wb.created = new Date()

    const ws = wb.addWorksheet('Órdenes de Compra')

    ws.columns = [
      { header: 'Nro Compra',        key: 'nroCompra',           width: 14 },
      { header: 'Tipo',               key: 'tipoCompra',          width: 10 },
      { header: 'Estado',             key: 'estadoCompra',        width: 14 },
      { header: 'Fecha Orden',        key: 'fecha',               width: 14 },
      { header: 'Nro Factura',        key: 'nroFactura',          width: 16 },
      { header: 'Guía Remisión',      key: 'nroGuiaRemision',     width: 16 },
      { header: 'Transportista',      key: 'transportista',       width: 18 },
      { header: 'Fec. Envío',         key: 'fechaEnvio',          width: 14 },
      { header: 'Fec. Est. Llegada',  key: 'fechaEstimadaLlegada',width: 16 },
      { header: 'Fec. Recepción',     key: 'fechaRecepcion',      width: 16 },
      { header: 'Condición',          key: 'condicionMercancia',  width: 12 },
      { header: 'Fec. Finalización',  key: 'fechaFinalizacion',   width: 16 },
      { header: 'Subtotal',           key: 'subtotal',            width: 14 },
      { header: 'Total',              key: 'total',               width: 14 },
      { header: 'Pagado',             key: 'montoPagado',         width: 14 },
      { header: 'Saldo',              key: 'saldo',               width: 14 },
      { header: 'Estado Pago',        key: 'estadoPago',          width: 14 },
    ]

    const headerRow = ws.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } }
    headerRow.alignment = { vertical: 'middle' }
    headerRow.height = 20

    compras.forEach(c => {
      const row = ws.addRow({
        ...c,
        saldo: (Number(c.total) - Number(c.montoPagado)).toFixed(2),
      })
      const estado = c.estadoCompra
      if (estado === 'FINALIZADO') row.getCell('estadoCompra').font = { color: { argb: 'FF34D399' } }
      else if (estado === 'ANULADA') row.getCell('estadoCompra').font = { color: { argb: 'FFF87171' } }
      else if (estado === 'EN_TRANSITO') row.getCell('estadoCompra').font = { color: { argb: 'FF60A5FA' } }
      else row.getCell('estadoCompra').font = { color: { argb: 'FFFBBF24' } }
    })

    ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
    ws.autoFilter = { from: 'A1', to: 'Q1' }

    return wb.xlsx.writeBuffer() as Promise<Buffer>
  }

  // ── Reporte PDF ──────────────────────────────────────────────────────────────

  async generarPdf(clienteId: string, id: string): Promise<Buffer> {
    const compra = await this.compraRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!compra) throw new NotFoundException('Compra no encontrada')

    const [detalles, pagos] = await Promise.all([
      this.detalleRepo.find({ where: { compraId: id, clienteId, estado: Status.ACTIVE } }),
      this.pagoRepo.find({ where: { compraId: id, clienteId, estado: Status.ACTIVE }, order: { fecha: 'ASC' } as any }),
    ])

    const schema = process.env.DB_SCHEMA || 'public'
    const productoIds = [...new Set(detalles.map(d => d.productoId))]

    const [productosRaw, provResult] = await Promise.all([
      productoIds.length
        ? this.dataSource.query(`SELECT id, nombre FROM "${schema}"."producto" WHERE id = ANY($1::uuid[])`, [productoIds])
        : Promise.resolve([]),
      compra.proveedorId
        ? this.dataSource.query(`SELECT nombre FROM "${schema}"."proveedor" WHERE id = $1`, [compra.proveedorId])
        : Promise.resolve([]),
    ])

    const prodMap = new Map<string, string>(productosRaw.map((p: any) => [p.id, p.nombre]))
    const proveedorNombre: string = provResult[0]?.nombre || 'Sin proveedor'

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: { Title: compra.nroCompra, Author: 'Sistema POS' },
      })

      const buffers: Buffer[] = []
      doc.on('data', (b: Buffer) => buffers.push(b))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', reject)

      const ML = 40
      const W = doc.page.width - ML * 2   // 515.28
      const MR = ML + W
      const fmt = (v: number | string) => Number(v || 0).toFixed(2)
      const estadoLabel: Record<string, string> = {
        EN_TRANSITO: 'En Tránsito', PENDIENTE: 'En Almacén',
        FINALIZADO: 'Finalizado',   ANULADA: 'Anulada',
      }

      // ── Header ──────────────────────────────────────────────────────────────
      doc.rect(ML, 40, W, 58).fill('#1e3a5f')
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(18)
         .text('ORDEN DE COMPRA', ML + 12, 50, { width: 320, lineBreak: false })
      doc.font('Helvetica').fontSize(9).fillColor('#94a3b8')
         .text(compra.nroCompra, ML + 12, 73, { width: 200, lineBreak: false })

      const estadoTxt = estadoLabel[compra.estadoCompra] || compra.estadoCompra
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff')
         .text(estadoTxt, ML, 53, { width: W - 12, align: 'right', lineBreak: false })
      doc.font('Helvetica').fontSize(9).fillColor('#94a3b8')
         .text(`Fecha: ${compra.fecha}`, ML, 68, { width: W - 12, align: 'right', lineBreak: false })

      let y = 112

      // ── Info grid ────────────────────────────────────────────────────────────
      const drawInfo = (label: string, value: string, x: number, yy: number, colW: number) => {
        doc.font('Helvetica').fontSize(7).fillColor('#64748b')
           .text(label.toUpperCase(), x, yy, { width: colW, lineBreak: false })
        doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#1e293b')
           .text(value || '—', x, yy + 10, { width: colW, lineBreak: false })
      }

      const half = W / 2 - 8
      drawInfo('Proveedor', proveedorNombre, ML, y, half)
      drawInfo('Fecha Orden', compra.fecha, ML + W / 2, y, half)
      y += 30

      drawInfo('Nro Factura / Ref.', compra.nroFactura || '—', ML, y, half)
      drawInfo('Tipo', compra.tipoCompra === 'INICIAL' ? 'Ingreso Inicial' : 'Compra a Proveedor', ML + W / 2, y, half)
      y += 30

      if (compra.transportista || compra.nroGuiaRemision) {
        drawInfo('Transportista', compra.transportista || '—', ML, y, half)
        drawInfo('Guía / Remisión', compra.nroGuiaRemision || '—', ML + W / 2, y, half)
        y += 30
      }

      if (compra.fechaEnvio || compra.fechaEstimadaLlegada) {
        drawInfo('Fecha de Envío', compra.fechaEnvio || '—', ML, y, half)
        drawInfo('Llegada Estimada', compra.fechaEstimadaLlegada || '—', ML + W / 2, y, half)
        y += 30
      }

      if (compra.observaciones) {
        drawInfo('Observaciones', compra.observaciones, ML, y, W)
        y += 30
      }

      y += 4
      doc.moveTo(ML, y).lineTo(MR, y).lineWidth(0.5).strokeColor('#e2e8f0').stroke()
      y += 10

      // ── Productos ────────────────────────────────────────────────────────────
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#334155')
         .text('DETALLE DE PRODUCTOS', ML, y)
      y += 13

      const colW = { prod: 195, cant: 45, pu: 72, desc: 62, sub: 72, lote: 69 }
      const cx = {
        prod: ML,
        cant: ML + colW.prod,
        pu:   ML + colW.prod + colW.cant,
        desc: ML + colW.prod + colW.cant + colW.pu,
        sub:  ML + colW.prod + colW.cant + colW.pu + colW.desc,
        lote: ML + colW.prod + colW.cant + colW.pu + colW.desc + colW.sub,
      }

      // Header row
      doc.rect(ML, y, W, 18).fill('#1e3a5f')
      const hdr = (txt: string, x: number, w: number, align: 'left' | 'right' | 'center' = 'left') =>
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#ffffff')
           .text(txt, x + 3, y + 5, { width: w - 6, align, lineBreak: false })
      hdr('PRODUCTO', cx.prod, colW.prod)
      hdr('CANT.', cx.cant, colW.cant, 'right')
      hdr('PRECIO U.', cx.pu, colW.pu, 'right')
      hdr('DESCUENTO', cx.desc, colW.desc, 'right')
      hdr('SUBTOTAL', cx.sub, colW.sub, 'right')
      hdr('LOTE', cx.lote, colW.lote, 'center')
      y += 18

      for (let i = 0; i < detalles.length; i++) {
        const d = detalles[i]
        const nombre = prodMap.get(d.productoId) || 'Producto desconocido'
        const rH = 18
        if (i % 2 === 1) doc.rect(ML, y, W, rH).fill('#f8fafc')
        const cell = (txt: string, x: number, w: number, align: 'left' | 'right' | 'center' = 'left') =>
          doc.font('Helvetica').fontSize(8).fillColor('#1e293b')
             .text(txt, x + 3, y + 5, { width: w - 6, align, lineBreak: false, ellipsis: true })
        cell(nombre, cx.prod, colW.prod)
        cell(fmt(d.cantidad), cx.cant, colW.cant, 'right')
        cell(`Bs ${fmt(d.precioUnitario)}`, cx.pu, colW.pu, 'right')
        cell(`Bs ${fmt(d.descuento)}`, cx.desc, colW.desc, 'right')
        cell(`Bs ${fmt(d.subtotal)}`, cx.sub, colW.sub, 'right')
        cell(d.nroLote || '—', cx.lote, colW.lote, 'center')
        y += rH
      }

      // Total row
      doc.rect(ML, y, W, 22).fill('#0f172a')
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#f1f5f9')
         .text(`TOTAL:  Bs ${fmt(compra.total)}`, ML, y + 6, { width: W - 10, align: 'right', lineBreak: false })
      y += 30

      // ── Trazabilidad ─────────────────────────────────────────────────────────
      if (compra.fechaRecepcion || compra.fechaFinalizacion) {
        doc.moveTo(ML, y).lineTo(MR, y).lineWidth(0.5).strokeColor('#e2e8f0').stroke()
        y += 10
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#334155').text('TRAZABILIDAD', ML, y)
        y += 13

        if (compra.fechaRecepcion) {
          doc.rect(ML, y, W, 16).fill('#0f172a')
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#60a5fa')
             .text('RECEPCIÓN EN ALMACÉN', ML + 6, y + 5, { lineBreak: false })
          y += 16
          doc.rect(ML, y, W, 22).fill('#0d1526')
          doc.font('Helvetica').fontSize(8).fillColor('#94a3b8')
             .text(`Fecha: `, ML + 6, y + 4, { continued: true, lineBreak: false })
          doc.fillColor('#e2e8f0').text(compra.fechaRecepcion, { continued: true, lineBreak: false })
          if (compra.condicionMercancia) {
            doc.fillColor('#94a3b8').text(`   Condición: `, { continued: true, lineBreak: false })
            doc.fillColor('#e2e8f0').text(compra.condicionMercancia, { lineBreak: false })
          }
          if (compra.observacionesRecepcion) {
            doc.font('Helvetica').fontSize(8).fillColor('#94a3b8')
               .text(`Obs: ${compra.observacionesRecepcion}`, ML + 6, y + 13, { width: W - 12, lineBreak: false })
          }
          y += 28
        }

        if (compra.fechaFinalizacion) {
          doc.rect(ML, y, W, 16).fill('#0f172a')
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#34d399')
             .text('FINALIZACIÓN', ML + 6, y + 5, { lineBreak: false })
          y += 16
          doc.rect(ML, y, W, 20).fill('#0d1526')
          doc.font('Helvetica').fontSize(8).fillColor('#94a3b8')
             .text(`Fecha: `, ML + 6, y + 6, { continued: true, lineBreak: false })
          doc.fillColor('#e2e8f0').text(compra.fechaFinalizacion, { lineBreak: false })
          if (compra.observacionesFinalizacion) {
            doc.font('Helvetica').fontSize(8).fillColor('#94a3b8')
               .text(`Obs: ${compra.observacionesFinalizacion}`, ML + 6, y + 13, { width: W - 12, lineBreak: false })
          }
          y += 26
        }

        y += 6
      }

      // ── Pagos ─────────────────────────────────────────────────────────────────
      if (pagos.length) {
        doc.moveTo(ML, y).lineTo(MR, y).lineWidth(0.5).strokeColor('#e2e8f0').stroke()
        y += 10
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#334155').text('PAGOS REGISTRADOS', ML, y)
        y += 13

        // Pagos table header
        doc.rect(ML, y, W, 16).fill('#334155')
        const ph = (txt: string, x: number, w: number, align: 'left' | 'right' = 'left') =>
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#ffffff')
             .text(txt, x + 3, y + 4, { width: w - 6, align, lineBreak: false })
        ph('FECHA', ML, 100)
        ph('MÉTODO', ML + 100, 100)
        ph('REFERENCIA', ML + 200, 180)
        ph('MONTO', ML + 380, W - 380, 'right')
        y += 16

        let totalPagado = 0
        for (let i = 0; i < pagos.length; i++) {
          const p = pagos[i]
          if (i % 2 === 1) doc.rect(ML, y, W, 18).fill('#f8fafc')
          const pc = (txt: string, x: number, w: number, align: 'left' | 'right' = 'left') =>
            doc.font('Helvetica').fontSize(8).fillColor('#1e293b')
               .text(txt, x + 3, y + 5, { width: w - 6, align, lineBreak: false })
          pc(p.fecha, ML, 100)
          pc(p.metodoPago, ML + 100, 100)
          pc(p.referencia || '—', ML + 200, 180)
          pc(`Bs ${fmt(p.monto)}`, ML + 380, W - 380, 'right')
          totalPagado += Number(p.monto)
          y += 18
        }

        const saldo = Math.max(0, Number(compra.total) - totalPagado)
        doc.rect(ML, y, W, 20).fill('#0f172a')
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#4ade80')
           .text(`Pagado: Bs ${fmt(totalPagado)}    Saldo: Bs ${fmt(saldo)}`, ML, y + 6, { width: W - 10, align: 'right', lineBreak: false })
        y += 26
      }

      // ── Footer ────────────────────────────────────────────────────────────────
      const footerY = doc.page.height - 40
      doc.moveTo(ML, footerY - 8).lineTo(MR, footerY - 8).lineWidth(0.4).strokeColor('#e2e8f0').stroke()
      doc.font('Helvetica').fontSize(7.5).fillColor('#94a3b8')
         .text(`Generado el ${new Date().toLocaleString('es-BO')}  ·  ${compra.nroCompra}`, ML, footerY - 2, { width: W, align: 'center', lineBreak: false })

      doc.end()
    })
  }

  // ── Historial de pagos ───────────────────────────────────────────────────────

  async historialPagos(clienteId: string, filtros: {
    proveedorId?: string; fechaDesde?: string; fechaHasta?: string
  } = {}): Promise<any[]> {
    const schema = process.env.DB_SCHEMA || 'public'
    const params: any[] = [clienteId, Status.ACTIVE]
    let sql = `
      SELECT
        p.id, p.fecha, p.monto,
        p.metodo_pago    AS "metodoPago",
        p.referencia,    p.notas,
        p.proveedor_id   AS "proveedorId",
        p.compra_id      AS "compraId",
        c.nro_compra     AS "nroCompra",
        c.nro_factura    AS "nroFactura",
        c.tipo_compra    AS "tipoCompra",
        c.estado_compra  AS "estadoCompra"
      FROM "${schema}"."pago_proveedor" p
      JOIN "${schema}"."compra" c ON c.id = p.compra_id
      WHERE p.cliente_id = $1 AND p._estado = $2
    `
    let idx = 3
    if (filtros.proveedorId) { sql += ` AND p.proveedor_id = $${idx++}`; params.push(filtros.proveedorId) }
    if (filtros.fechaDesde)  { sql += ` AND p.fecha >= $${idx++}`;        params.push(filtros.fechaDesde) }
    if (filtros.fechaHasta)  { sql += ` AND p.fecha <= $${idx++}`;        params.push(filtros.fechaHasta) }
    sql += ' ORDER BY p.fecha DESC, p.id DESC'
    return this.dataSource.query(sql, params)
  }

  // ── Pagos ───────────────────────────────────────────────────────────────────

  async listarPagos(clienteId: string, compraId: string): Promise<PagoProveedor[]> {
    return this.pagoRepo.find({ where: { compraId, clienteId, estado: Status.ACTIVE } })
  }

  async registrarPago(clienteId: string, compraId: string, dto: CreatePagoProveedorDto, usuarioId: string): Promise<PagoProveedor> {
    const compra = await this.compraRepo.findOne({ where: { id: compraId, clienteId, estado: Status.ACTIVE } })
    if (!compra) throw new NotFoundException('Compra no encontrada')

    const saldo = Number(compra.total) - Number(compra.montoPagado)
    if (dto.monto > saldo + 0.001) {
      throw new BadRequestException(`El monto (${dto.monto}) supera el saldo pendiente (${saldo.toFixed(2)})`)
    }

    const pago = await this.pagoRepo.save(
      this.pagoRepo.create({
        clienteId,
        compraId,
        proveedorId: compra.proveedorId,
        fecha: dto.fecha,
        monto: dto.monto,
        metodoPago: dto.metodoPago,
        referencia: dto.referencia,
        notas: dto.notas,
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion: usuarioId,
      }),
    )

    await this.recalcularPago(clienteId, compraId, usuarioId)
    await this.log(clienteId, compraId, TipoLog.PAGO, null, null,
      `Pago registrado: ${dto.metodoPago} Bs ${dto.monto}${dto.referencia ? ' · Ref: ' + dto.referencia : ''}`, usuarioId)
    return pago
  }

  async eliminarPago(clienteId: string, compraId: string, pagoId: string, usuarioId: string): Promise<void> {
    const pago = await this.pagoRepo.findOne({ where: { id: pagoId, compraId, clienteId, estado: Status.ACTIVE } })
    if (!pago) throw new NotFoundException('Pago no encontrado')
    Object.assign(pago, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion: usuarioId })
    await this.pagoRepo.save(pago)
    await this.recalcularPago(clienteId, compraId, usuarioId)
    await this.log(clienteId, compraId, TipoLog.PAGO, null, null,
      `Pago eliminado: ${pago.metodoPago} Bs ${pago.monto}`, usuarioId)
  }

  async resumenPagosProveedores(clienteId: string): Promise<any[]> {
    return this.compraRepo
      .createQueryBuilder('c')
      .select('c.proveedor_id', 'proveedorId')
      .addSelect('SUM(c.total)', 'totalCompras')
      .addSelect('SUM(c.monto_pagado)', 'totalPagado')
      .addSelect('SUM(c.total - c.monto_pagado)', 'saldoPendiente')
      .addSelect('COUNT(c.id)', 'nroCompras')
      .where('c.cliente_id = :clienteId AND c._estado = :est AND c.proveedor_id IS NOT NULL AND c.estado_compra = :rec', {
        clienteId,
        est: Status.ACTIVE,
        rec: EstadoCompra.FINALIZADO,
      })
      .andWhere('c.total > c.monto_pagado')
      .groupBy('c.proveedor_id')
      .getRawMany()
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private async generarNro(clienteId: string, tipo: string): Promise<string> {
    const prefix = tipo === TipoCompra.INICIAL ? 'INI' : 'COM'
    const count = await this.compraRepo.count({
      where: { clienteId, tipoCompra: tipo, estado: Status.ACTIVE },
    })
    return `${prefix}-${String(count + 1).padStart(4, '0')}`
  }

  private async ingresarLotesEnManager(
    manager: EntityManager,
    clienteId: string,
    compra: Compra,
    detalles: CompraDetalle[],
    usuarioId: string,
  ): Promise<void> {
    const hoy = new Date().toISOString().split('T')[0]
    for (const detalle of detalles) {
      const loteData: any = {
        clienteId,
        sucursalId: compra.sucursalId,
        productoId: detalle.productoId,
        nroLote: detalle.nroLote || null,
        loteInterno: `L-${Date.now()}`,
        fechaVencimiento: detalle.fechaVencimiento || null,
        fechaIngreso: hoy,
        proveedorId: compra.proveedorId || null,
        nroFacturaProveedor: compra.nroFactura || null,
        nroPedidoCompra: compra.nroCompra,
        cantidadInicial: detalle.cantidad,
        cantidadActual: detalle.cantidad,
        unidadId: detalle.unidadId || null,
        estadoLote: EstadoLote.ACTIVO,
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion: usuarioId,
      }
      const lote = await manager.save(Lote, loteData)

      const movData: any = {
        clienteId,
        sucursalId: compra.sucursalId,
        productoId: detalle.productoId,
        loteId: lote.id,
        unidadId: detalle.unidadId || null,
        tipo: TipoMovimiento.INGRESO,
        cantidad: detalle.cantidad,
        cantidadAnterior: 0,
        cantidadPosterior: detalle.cantidad,
        referenciaDocumento: compra.nroCompra,
        tipoDocumento: 'INGRESO',
        usuarioId,
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion: usuarioId,
      }
      await manager.save(MovimientoStock, movData)

      await manager.update(CompraDetalle, detalle.id, { loteId: lote.id })
    }
  }

  private async recalcularPago(clienteId: string, compraId: string, usuarioId: string): Promise<void> {
    const { suma } = await this.pagoRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.monto), 0)', 'suma')
      .where('p.compra_id = :compraId AND p.cliente_id = :clienteId AND p._estado = :est', {
        compraId, clienteId, est: Status.ACTIVE,
      })
      .getRawOne()

    const compra = await this.compraRepo.findOne({ where: { id: compraId } })
    if (!compra) return

    const montoPagado = Number(suma)
    const total = Number(compra.total)
    let estadoPago = EstadoPagoCompra.PENDIENTE
    if (montoPagado >= total) estadoPago = EstadoPagoCompra.PAGADO
    else if (montoPagado > 0) estadoPago = EstadoPagoCompra.PARCIAL

    await this.compraRepo.update(compraId, {
      montoPagado,
      estadoPago,
      usuarioModificacion: usuarioId,
      transaccion: Transacccion.ACTUALIZAR,
    })
  }

  private async log(
    clienteId: string, compraId: string, tipo: string,
    estadoAnterior: string | null, estadoNuevo: string | null,
    descripcion: string, usuarioId: string,
  ): Promise<void> {
    try {
      await this.logRepo.save(
        this.logRepo.create({ clienteId, compraId, tipo, estadoAnterior, estadoNuevo, descripcion, usuarioId } as any)
      )
    } catch (_) { /* non-critical — don't fail the main operation */ }
  }
}
