import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Lote, EstadoLote } from '../entity/lote.entity'
import { MovimientoStock, TipoMovimiento } from '../../movimientos-stock/entity/movimiento-stock.entity'
import { Producto } from '../../productos/entity/producto.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { IngresoLoteDto, CambiarEstadoLoteDto } from '../dto/lote.dto'

@Injectable()
export class LotesService {
  constructor(
    @InjectRepository(Lote)
    private readonly loteRepo: Repository<Lote>,
    @InjectRepository(MovimientoStock)
    private readonly movRepo: Repository<MovimientoStock>,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
    private readonly ds: DataSource,
  ) {}

  // ── Stock resumen por sucursal ──────────────────────────────────────────────
  async stockResumen(clienteId: string, sucursalId?: string): Promise<any[]> {
    const qb = this.loteRepo
      .createQueryBuilder('l')
      .select('l.producto_id', 'productoId')
      .addSelect('l.sucursal_id', 'sucursalId')
      .addSelect('SUM(l.cantidad_actual)', 'stockTotal')
      .addSelect('COUNT(l.id)', 'nroLotes')
      .addSelect('MIN(l.fecha_vencimiento)', 'proximoVencimiento')
      .where(
        'l.cliente_id = :clienteId AND l.estado_lote = :estadoLote AND l._estado = :dbEstado',
        { clienteId, estadoLote: EstadoLote.ACTIVO, dbEstado: Status.ACTIVE },
      )
    if (sucursalId) qb.andWhere('l.sucursal_id = :sucursalId', { sucursalId })
    qb.groupBy('l.producto_id, l.sucursal_id')
    const rows = await qb.getRawMany()

    if (!rows.length) return []

    const productoIds = rows.map(r => r.productoId)
    const productos = await this.productoRepo
      .createQueryBuilder('p')
      .where('p.id IN (:...ids) AND p._estado = :est', { ids: productoIds, est: Status.ACTIVE })
      .getMany()

    const prodMap = new Map(productos.map(p => [p.id, p]))
    return rows.map(r => {
      const prod = prodMap.get(r.productoId)
      return {
        productoId: r.productoId,
        sucursalId: r.sucursalId,
        nombre: prod?.nombre || '',
        codigo: prod?.codigoTienda || prod?.codigoBarras || '',
        requiereLote: prod?.requiereLote || false,
        metodoPicking: prod?.metodoPicking || 'FEFO',
        unidadNombre: '',
        stockTotal: Number(r.stockTotal) || 0,
        nroLotes: Number(r.nroLotes),
        proximoVencimiento: r.proximoVencimiento || null,
      }
    })
  }

  // ── Lotes de un producto en una sucursal ───────────────────────────────────
  async listarPorProducto(clienteId: string, sucursalId: string | undefined, productoId: string): Promise<Lote[]> {
    const where: any = { clienteId, productoId, estado: Status.ACTIVE }
    if (sucursalId) where.sucursalId = sucursalId
    return this.loteRepo.find({ where, order: { fechaVencimiento: 'ASC', fechaIngreso: 'ASC' } })
  }

  // ── Detalle de un lote ─────────────────────────────────────────────────────
  async obtener(clienteId: string, id: string): Promise<Lote> {
    const l = await this.loteRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!l) throw new NotFoundException(Messages.NOT_FOUND)
    return l
  }

  // ── Trazabilidad completa: lote + movimientos ──────────────────────────────
  async trazabilidad(clienteId: string, id: string): Promise<any> {
    const lote = await this.obtener(clienteId, id)
    const movimientos = await this.movRepo.find({
      where: { clienteId, loteId: id, estado: Status.ACTIVE },
      order: { fechaCreacion: 'ASC' },
    })
    return { lote, movimientos }
  }

  // ── Ingresar mercadería (crea lote + movimiento INGRESO) ───────────────────
  async ingresar(clienteId: string, dto: IngresoLoteDto, usuarioId: string): Promise<Lote> {
    const producto = await this.productoRepo.findOne({
      where: { id: dto.productoId, clienteId, estado: Status.ACTIVE },
    })
    if (!producto) throw new NotFoundException('Producto no encontrado')

    const hoy = new Date().toISOString().split('T')[0]
    const loteInterno = `L-${Date.now()}`

    const lote = await this.loteRepo.save(this.loteRepo.create({
      clienteId,
      sucursalId: dto.sucursalId,
      productoId: dto.productoId,
      nroLote: dto.nroLote,
      nroSerie: dto.nroSerie,
      loteInterno,
      fechaFabricacion: dto.fechaFabricacion,
      fechaVencimiento: dto.fechaVencimiento || null,
      fechaVencimientoGarantia: dto.fechaVencimientoGarantia || null,
      fechaIngreso: hoy,
      proveedorId: dto.proveedorId,
      nroFacturaProveedor: dto.nroFacturaProveedor,
      nroPedidoCompra: dto.nroPedidoCompra,
      nroRemision: dto.nroRemision,
      paisOrigen: dto.paisOrigen,
      certificadoCalidad: dto.certificadoCalidad,
      cantidadInicial: dto.cantidad,
      cantidadActual: dto.cantidad,
      unidadId: dto.unidadId,
      notas: dto.notas,
      estadoLote: EstadoLote.ACTIVO,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion: usuarioId,
    } as any)) as unknown as Lote

    await this.movRepo.save(
      this.movRepo.create({
        clienteId,
        sucursalId: dto.sucursalId,
        productoId: dto.productoId,
        loteId: lote.id,
        unidadId: dto.unidadId,
        tipo: TipoMovimiento.INGRESO,
        cantidad: dto.cantidad,
        cantidadAnterior: 0,
        cantidadPosterior: dto.cantidad,
        referenciaDocumento: dto.referenciaDocumento,
        tipoDocumento: 'INGRESO',
        usuarioId,
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion: usuarioId,
      }),
    )

    return lote
  }

  // ── Cambiar estado de lote (cuarentena, retirar, liberar) ──────────────────
  async cambiarEstado(clienteId: string, id: string, dto: CambiarEstadoLoteDto, usuarioModificacion: string): Promise<Lote> {
    const lote = await this.obtener(clienteId, id)
    Object.assign(lote, {
      estadoLote: dto.estadoLote,
      motivoCuarentena: dto.motivoCuarentena || null,
      transaccion: Transacccion.ACTUALIZAR,
      usuarioModificacion,
    })
    return this.loteRepo.save(lote)
  }

  // ── Listar todos los lotes con filtros ────────────────────────────────────
  async listarTodos(clienteId: string, opts: { sucursalId?: string; estadoLote?: string; search?: string }): Promise<any[]> {
    const schema = process.env.DB_SCHEMA || 'public'
    const params: any[] = [clienteId, Status.ACTIVE]
    let idx = 3
    const conds: string[] = []
    if (opts.sucursalId) { conds.push(`l.sucursal_id = $${idx++}`); params.push(opts.sucursalId) }
    if (opts.estadoLote) { conds.push(`l.estado_lote = $${idx++}`); params.push(opts.estadoLote) }
    if (opts.search)     { conds.push(`(p.nombre ILIKE $${idx} OR l.nro_lote ILIKE $${idx} OR l.lote_interno ILIKE $${idx})`); params.push(`%${opts.search}%`); idx++ }
    const where = conds.length ? ' AND ' + conds.join(' AND ') : ''
    const sql = `
      SELECT l.id, l.nro_lote AS "nroLote", l.lote_interno AS "loteInterno",
             l.fecha_ingreso AS "fechaIngreso", l.fecha_vencimiento AS "fechaVencimiento",
             l.cantidad_inicial AS "cantidadInicial", l.cantidad_actual AS "cantidadActual",
             l.estado_lote AS "estadoLote", l.sucursal_id AS "sucursalId", l.producto_id AS "productoId",
             p.nombre AS "productoNombre", p.codigo_tienda AS "codigo",
             l.notas
      FROM ${schema}.lote l
      LEFT JOIN ${schema}.producto p ON p.id = l.producto_id
      WHERE l.cliente_id = $1 AND l._estado = $2
      ${where}
      ORDER BY l._fecha_creacion DESC
      LIMIT 500`
    return this.ds.query(sql, params)
  }

  // ── Reporte general de stock ──────────────────────────────────────────────
  async reporteGeneral(clienteId: string, opts: { sucursalId?: string }): Promise<any[]> {
    const schema = process.env.DB_SCHEMA || 'public'
    const params: any[] = [clienteId, Status.ACTIVE, EstadoLote.ACTIVO]
    let sucursalCond = ''
    if (opts.sucursalId) { sucursalCond = `AND l.sucursal_id = $4`; params.push(opts.sucursalId) }
    const sql = `
      SELECT l.producto_id AS "productoId", l.sucursal_id AS "sucursalId",
             p.nombre AS "productoNombre", p.codigo_tienda AS "codigo",
             (SELECT pp.precio FROM ${schema}.precio_producto pp
              WHERE pp.producto_id = l.producto_id AND pp.tipo = 'COMPRA' AND pp.activo = true AND pp._estado = $2
              ORDER BY pp._fecha_creacion DESC LIMIT 1) AS "precioCosto",
             SUM(l.cantidad_actual) AS "stockTotal",
             COUNT(l.id) AS "nroLotes",
             MIN(l.fecha_vencimiento) AS "proximoVencimiento"
      FROM ${schema}.lote l
      LEFT JOIN ${schema}.producto p ON p.id = l.producto_id
      WHERE l.cliente_id = $1 AND l._estado = $2 AND l.estado_lote = $3
      ${sucursalCond}
      GROUP BY l.producto_id, l.sucursal_id, p.nombre, p.codigo_tienda
      ORDER BY p.nombre ASC`
    return this.ds.query(sql, params)
  }

  // ── Historial de precios de un producto ───────────────────────────────────
  async historialPrecios(clienteId: string, opts: { productoId?: string }): Promise<any[]> {
    const schema = process.env.DB_SCHEMA || 'public'
    const params: any[] = [clienteId, Status.ACTIVE]
    let prodCond = ''
    if (opts.productoId) { prodCond = `AND pp.producto_id = $3`; params.push(opts.productoId) }
    const sql = `
      SELECT pp.id, pp.tipo, pp.precio, pp.moneda, pp.fecha_vigencia AS "fechaVigencia",
             pp.fecha_fin AS "fechaFin", pp.activo, pp._fecha_creacion AS "fechaCreacion",
             p.nombre AS "productoNombre", p.codigo_tienda AS "codigo"
      FROM ${schema}.precio_producto pp
      LEFT JOIN ${schema}.producto p ON p.id = pp.producto_id
      WHERE pp.cliente_id = $1 AND pp._estado = $2
      ${prodCond}
      ORDER BY pp._fecha_creacion DESC
      LIMIT 300`
    return this.ds.query(sql, params)
  }

  // ── Job: marcar lotes vencidos ─────────────────────────────────────────────
  async marcarVencidos(): Promise<void> {
    const hoy = new Date().toISOString().split('T')[0]
    await this.loteRepo
      .createQueryBuilder()
      .update(Lote)
      .set({ estadoLote: EstadoLote.VENCIDO })
      .where(
        'fecha_vencimiento IS NOT NULL AND fecha_vencimiento < :hoy AND estado_lote = :activo AND _estado = :dbEstado',
        { hoy, activo: EstadoLote.ACTIVO, dbEstado: Status.ACTIVE },
      )
      .execute()
  }

  // ── Lotes próximos a vencer ────────────────────────────────────────────────
  async proximosAVencer(clienteId: string, sucursalId?: string): Promise<any[]> {
    const qb = this.loteRepo
      .createQueryBuilder('l')
      .innerJoin(Producto, 'p', 'p.id = l.producto_id')
      .select([
        'l.id AS "loteId"', 'l.nro_lote AS "nroLote"', 'l.fecha_vencimiento AS "fechaVencimiento"',
        'l.cantidad_actual AS "cantidadActual"', 'l.sucursal_id AS "sucursalId"',
        'p.nombre AS "productoNombre"',
        `(l.fecha_vencimiento::date - CURRENT_DATE) AS "diasRestantes"`,
      ])
      .where(
        `l.cliente_id = :clienteId AND l.estado_lote = :activo AND l._estado = :dbEstado
         AND l.fecha_vencimiento IS NOT NULL
         AND l.fecha_vencimiento::date <= (CURRENT_DATE + (p.alerta_vencimiento_dias || ' days')::interval)`,
        { clienteId, activo: EstadoLote.ACTIVO, dbEstado: Status.ACTIVE },
      )
      .orderBy('"diasRestantes"', 'ASC')
    if (sucursalId) qb.andWhere('l.sucursal_id = :sucursalId', { sucursalId })
    return qb.getRawMany()
  }
}
