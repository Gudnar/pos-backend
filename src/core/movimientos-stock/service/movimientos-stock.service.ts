import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { MovimientoStock, TipoMovimiento } from '../entity/movimiento-stock.entity'
import { Lote, EstadoLote } from '../../lotes/entity/lote.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { RegistrarMovimientoDto, TransferirStockDto } from '../dto/movimiento-stock.dto'

@Injectable()
export class MovimientosStockService {
  constructor(
    @InjectRepository(MovimientoStock)
    private readonly movRepo: Repository<MovimientoStock>,
    @InjectRepository(Lote)
    private readonly loteRepo: Repository<Lote>,
    private readonly ds: DataSource,
  ) {}

  async listarPorSucursal(clienteId: string, sucursalId?: string, productoId?: string): Promise<MovimientoStock[]> {
    const where: any = { clienteId, estado: Status.ACTIVE }
    if (sucursalId) where.sucursalId = sucursalId
    if (productoId) where.productoId = productoId
    return this.movRepo.find({ where, order: { fechaCreacion: 'DESC' }, take: 100 })
  }

  async registrar(clienteId: string, dto: RegistrarMovimientoDto, usuarioId: string): Promise<MovimientoStock> {
    const lote = await this.loteRepo.findOne({
      where: { id: dto.loteId, clienteId, sucursalId: dto.sucursalId, estado: Status.ACTIVE },
    })
    if (!lote) throw new NotFoundException(Messages.NOT_FOUND)

    if (lote.estadoLote === EstadoLote.CUARENTENA) {
      throw new BadRequestException('El lote está en cuarentena y no se puede mover')
    }
    if (lote.estadoLote === EstadoLote.RETIRADO || lote.estadoLote === EstadoLote.VENCIDO) {
      throw new BadRequestException(`El lote tiene estado ${lote.estadoLote} y no se puede operar`)
    }

    const esSalida = ['SALIDA', 'AJUSTE_NEGATIVO', 'RETIRO', 'DEVOLUCION_PROVEEDOR'].includes(dto.tipo)

    if (esSalida && dto.cantidad > Number(lote.cantidadActual)) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${lote.cantidadActual}, solicitado: ${dto.cantidad}`,
      )
    }

    const cantidadAnterior = Number(lote.cantidadActual)
    const cantidadPosterior = esSalida
      ? cantidadAnterior - dto.cantidad
      : cantidadAnterior + dto.cantidad

    // Actualizar lote
    lote.cantidadActual = cantidadPosterior
    if (cantidadPosterior <= 0) lote.estadoLote = EstadoLote.AGOTADO
    Object.assign(lote, { transaccion: Transacccion.ACTUALIZAR, usuarioModificacion: usuarioId })
    await this.loteRepo.save(lote)

    return this.movRepo.save(
      this.movRepo.create({
        clienteId,
        sucursalId: dto.sucursalId,
        productoId: lote.productoId,
        loteId: dto.loteId,
        unidadId: dto.unidadId,
        tipo: dto.tipo,
        cantidad: dto.cantidad,
        cantidadAnterior,
        cantidadPosterior,
        motivo: dto.motivo,
        referenciaDocumento: dto.referenciaDocumento,
        tipoDocumento: dto.tipoDocumento,
        usuarioId,
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion: usuarioId,
      }),
    )
  }

  async transferir(clienteId: string, dto: TransferirStockDto, usuarioId: string): Promise<{ origen: MovimientoStock; destino: MovimientoStock }> {
    const loteOrigen = await this.loteRepo.findOne({
      where: { id: dto.loteId, clienteId, sucursalId: dto.sucursalOrigenId, estado: Status.ACTIVE },
    })
    if (!loteOrigen) throw new NotFoundException('Lote de origen no encontrado')

    if (dto.cantidad > Number(loteOrigen.cantidadActual)) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${loteOrigen.cantidadActual}, solicitado: ${dto.cantidad}`,
      )
    }

    // Descontar del lote origen
    const cantAntOrigen = Number(loteOrigen.cantidadActual)
    loteOrigen.cantidadActual = cantAntOrigen - dto.cantidad
    if (loteOrigen.cantidadActual <= 0) loteOrigen.estadoLote = EstadoLote.AGOTADO
    Object.assign(loteOrigen, { transaccion: Transacccion.ACTUALIZAR, usuarioModificacion: usuarioId })
    await this.loteRepo.save(loteOrigen)

    // Crear nuevo lote en destino
    const hoy = new Date().toISOString().split('T')[0]
    const loteDestino = await this.loteRepo.save(
      this.loteRepo.create({
        clienteId,
        sucursalId: dto.sucursalDestinoId,
        productoId: loteOrigen.productoId,
        nroLote: loteOrigen.nroLote,
        nroSerie: loteOrigen.nroSerie,
        loteInterno: `${loteOrigen.loteInterno}-TRANSF`,
        fechaFabricacion: loteOrigen.fechaFabricacion,
        fechaVencimiento: loteOrigen.fechaVencimiento,
        fechaIngreso: hoy,
        cantidadInicial: dto.cantidad,
        cantidadActual: dto.cantidad,
        unidadId: loteOrigen.unidadId,
        estadoLote: EstadoLote.ACTIVO,
        notas: dto.motivo,
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion: usuarioId,
      }),
    )

    const movBase = {
      clienteId,
      productoId: loteOrigen.productoId,
      cantidad: dto.cantidad,
      motivo: dto.motivo,
      tipoDocumento: 'TRANSFERENCIA',
      usuarioId,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion: usuarioId,
    }

    const movOrigen = await this.movRepo.save(
      this.movRepo.create({
        ...movBase,
        sucursalId: dto.sucursalOrigenId,
        loteId: loteOrigen.id,
        tipo: TipoMovimiento.TRANSFERENCIA_SALIDA,
        cantidadAnterior: cantAntOrigen,
        cantidadPosterior: Number(loteOrigen.cantidadActual),
        sucursalDestinoId: dto.sucursalDestinoId,
        loteDestinoId: (loteDestino as any).id,
      }),
    )

    const movDestino = await this.movRepo.save(
      this.movRepo.create({
        ...movBase,
        sucursalId: dto.sucursalDestinoId,
        loteId: (loteDestino as any).id,
        tipo: TipoMovimiento.TRANSFERENCIA_ENTRADA,
        cantidadAnterior: 0,
        cantidadPosterior: dto.cantidad,
      }),
    )

    return { origen: movOrigen, destino: movDestino }
  }

  async kardex(
    clienteId: string,
    opts: { sucursalId?: string; productoId?: string; fechaDesde?: string; fechaHasta?: string; tipo?: string },
  ): Promise<any[]> {
    const schema = process.env.DB_SCHEMA || 'public'
    const params: any[] = [clienteId, Status.ACTIVE]
    let idx = 3
    const conds: string[] = []
    if (opts.sucursalId) { conds.push(`m.sucursal_id = $${idx++}`); params.push(opts.sucursalId) }
    if (opts.productoId) { conds.push(`m.producto_id = $${idx++}`); params.push(opts.productoId) }
    if (opts.tipo)       { conds.push(`m.tipo = $${idx++}`); params.push(opts.tipo) }
    if (opts.fechaDesde) { conds.push(`m._fecha_creacion::date >= $${idx++}::date`); params.push(opts.fechaDesde) }
    if (opts.fechaHasta) { conds.push(`m._fecha_creacion::date <= $${idx++}::date`); params.push(opts.fechaHasta) }
    const where = conds.length ? ' AND ' + conds.join(' AND ') : ''
    const sql = `
      SELECT m.id, m._fecha_creacion AS fecha, m.tipo, m.cantidad, m.cantidad_anterior AS "cantidadAnterior",
             m.cantidad_posterior AS "cantidadPosterior", m.motivo, m.referencia_documento AS "referenciaDocumento",
             m.tipo_documento AS "tipoDocumento", m.lote_id AS "loteId",
             m.producto_id AS "productoId",
             p.nombre AS "productoNombre", p.codigo_tienda AS "codigo",
             l.nro_lote AS "nroLote", l.lote_interno AS "loteInterno"
      FROM ${schema}.movimiento_stock m
      LEFT JOIN ${schema}.producto p ON p.id = m.producto_id
      LEFT JOIN ${schema}.lote l ON l.id = m.lote_id
      WHERE m.cliente_id = $1 AND m._estado = $2
      ${where}
      ORDER BY m._fecha_creacion DESC
      LIMIT 500`
    return this.ds.query(sql, params)
  }

  async sinMovimiento(clienteId: string, opts: { sucursalId?: string; dias?: number }): Promise<any[]> {
    const schema = process.env.DB_SCHEMA || 'public'
    const dias = opts.dias ?? 30
    const params: any[] = [clienteId, Status.ACTIVE, EstadoLote.ACTIVO, dias]
    let sucursalCond = ''
    if (opts.sucursalId) { sucursalCond = `AND l.sucursal_id = $5`; params.push(opts.sucursalId) }
    const sql = `
      SELECT l.producto_id AS "productoId", l.sucursal_id AS "sucursalId",
             p.nombre AS "productoNombre", p.codigo_tienda AS "codigo",
             SUM(l.cantidad_actual) AS "stockTotal",
             MAX(m._fecha_creacion) AS "ultimoMovimiento"
      FROM ${schema}.lote l
      LEFT JOIN ${schema}.producto p ON p.id = l.producto_id
      LEFT JOIN ${schema}.movimiento_stock m ON m.lote_id = l.id AND m._estado = $2
      WHERE l.cliente_id = $1 AND l._estado = $2 AND l.estado_lote = $3
      ${sucursalCond}
      GROUP BY l.producto_id, l.sucursal_id, p.nombre, p.codigo_tienda
      HAVING MAX(m._fecha_creacion) IS NULL OR MAX(m._fecha_creacion) < NOW() - ($4 || ' days')::interval
      ORDER BY "ultimoMovimiento" ASC NULLS FIRST`
    return this.ds.query(sql, params)
  }

  async reporteRotacion(
    clienteId: string,
    opts: { sucursalId?: string; fechaDesde?: string; fechaHasta?: string },
  ): Promise<any[]> {
    const schema = process.env.DB_SCHEMA || 'public'
    const params: any[] = [clienteId, Status.ACTIVE]
    let idx = 3
    const conds: string[] = []
    if (opts.sucursalId) { conds.push(`m.sucursal_id = $${idx++}`); params.push(opts.sucursalId) }
    if (opts.fechaDesde) { conds.push(`m._fecha_creacion::date >= $${idx++}::date`); params.push(opts.fechaDesde) }
    if (opts.fechaHasta) { conds.push(`m._fecha_creacion::date <= $${idx++}::date`); params.push(opts.fechaHasta) }
    const where = conds.length ? ' AND ' + conds.join(' AND ') : ''
    const sql = `
      SELECT m.producto_id AS "productoId", p.nombre AS "productoNombre", p.codigo_tienda AS "codigo",
             COUNT(*) AS "totalMovimientos",
             SUM(CASE WHEN m.tipo IN ('INGRESO') THEN m.cantidad ELSE 0 END) AS "totalEntradas",
             SUM(CASE WHEN m.tipo IN ('SALIDA','RETIRO','DEVOLUCION_PROVEEDOR') THEN m.cantidad ELSE 0 END) AS "totalSalidas",
             SUM(CASE WHEN m.tipo IN ('AJUSTE_POSITIVO','AJUSTE_NEGATIVO') THEN 1 ELSE 0 END) AS "totalAjustes",
             SUM(CASE WHEN m.tipo IN ('TRANSFERENCIA_SALIDA','TRANSFERENCIA_ENTRADA') THEN 1 ELSE 0 END) AS "totalTransferencias"
      FROM ${schema}.movimiento_stock m
      LEFT JOIN ${schema}.producto p ON p.id = m.producto_id
      WHERE m.cliente_id = $1 AND m._estado = $2
      ${where}
      GROUP BY m.producto_id, p.nombre, p.codigo_tienda
      ORDER BY "totalMovimientos" DESC
      LIMIT 200`
    return this.ds.query(sql, params)
  }
}
