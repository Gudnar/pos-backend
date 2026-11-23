import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, In, Repository } from 'typeorm'
import { Cotizacion, EstadoCotizacion } from '../entity/cotizacion.entity'
import { CotizacionDetalle } from '../entity/cotizacion-detalle.entity'
import { Producto } from '../../productos/entity/producto.entity'
import { Status, Transacccion } from '../../../common/constants'
import { CrearCotizacionDto, AnularCotizacionDto } from '../dto/cotizacion.dto'

const r2 = (n: number) => Math.round(n * 100) / 100

@Injectable()
export class CotizacionesService {
  private schema = process.env.DB_SCHEMA || 'public'

  constructor(
    @InjectRepository(Cotizacion) private readonly repo: Repository<Cotizacion>,
    @InjectRepository(CotizacionDetalle) private readonly detalleRepo: Repository<CotizacionDetalle>,
    private readonly ds: DataSource,
  ) {}

  async crear(clienteId: string, dto: CrearCotizacionDto, usuarioId: string): Promise<Cotizacion> {
    if (dto.validoHasta && dto.fecha && dto.validoHasta < dto.fecha) {
      throw new BadRequestException('La fecha de validez no puede ser anterior a la fecha de la cotización')
    }
    return this.ds.transaction(async manager => {
      const ids = [...new Set(dto.detalles.map(d => d.productoId))]
      const productos = await manager.find(Producto, { where: { id: In(ids), clienteId, estado: Status.ACTIVE } })
      const prodMap = new Map(productos.map(p => [p.id, p]))
      const faltante = ids.find(id => !prodMap.has(id))
      if (faltante) throw new NotFoundException(`Producto ${faltante} no encontrado`)

      // Correlativo por empresa y año: COT-2026-00001. El bloqueo evita números repetidos
      const fecha = dto.fecha || new Date().toISOString().split('T')[0]
      const anio = fecha.slice(0, 4)
      await manager.query('SELECT pg_advisory_xact_lock($1)', [Number(clienteId) + 7_200_000])
      const [{ max }] = await manager.query(
        `SELECT COALESCE(MAX(CAST(SPLIT_PART(nro_cotizacion, '-', 3) AS int)), 0) AS max
         FROM ${this.schema}.cotizacion WHERE cliente_id = $1 AND nro_cotizacion LIKE $2`,
        [clienteId, `COT-${anio}-%`],
      )
      const nroCotizacion = `COT-${anio}-${String(Number(max) + 1).padStart(5, '0')}`

      const lineas = dto.detalles.map((d, i) => ({
        d, i, subtotal: r2(Number(d.precioUnitario) * Number(d.cantidad) - Number(d.descuento || 0)),
      }))
      const total = r2(lineas.reduce((s, l) => s + l.subtotal, 0))

      const cot = await manager.save(Cotizacion, manager.create(Cotizacion, {
        clienteId, sucursalId: dto.sucursalId, usuarioId, nroCotizacion, fecha,
        validoHasta: dto.validoHasta || undefined, estadoCotizacion: EstadoCotizacion.VIGENTE,
        tipoPrecio: dto.tipoPrecio, contactoClienteId: dto.contactoClienteId,
        nombreCliente: dto.nombreCliente, nitCi: dto.nitCi, telefonoCliente: dto.telefonoCliente,
        observaciones: dto.observaciones, total,
        estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: usuarioId,
      }))
      for (const { d, i, subtotal } of lineas) {
        await manager.save(CotizacionDetalle, manager.create(CotizacionDetalle, {
          clienteId, cotizacionId: cot.id, productoId: d.productoId, loteId: d.loteId,
          nombreProducto: prodMap.get(d.productoId)!.nombre,
          cantidad: Number(d.cantidad), precioUnitario: Number(d.precioUnitario), subtotal, orden: i,
          estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: usuarioId,
        }))
      }
      return cot
    })
  }

  async listar(clienteId: string, f: { sucursalId?: string; fechaDesde?: string; fechaHasta?: string; estado?: string; nombreCliente?: string }): Promise<any[]> {
    const params: any[] = [clienteId, Status.ACTIVE]
    const cond: string[] = []
    const add = (sql: string, v: any) => { params.push(v); cond.push(sql.replace('?', `$${params.length}`)) }
    if (f.sucursalId) add('c.sucursal_id = ?', f.sucursalId)
    if (f.fechaDesde) add('c.fecha >= ?', f.fechaDesde)
    if (f.fechaHasta) add('c.fecha <= ?', f.fechaHasta)
    if (f.nombreCliente) add('c.nombre_cliente ILIKE ?', `%${f.nombreCliente}%`)
    if (f.estado) add(`${this.estadoSql} = ?`, f.estado)
    return this.ds.query(
      `SELECT c.id, c.nro_cotizacion AS "nroCotizacion", c.fecha::text AS fecha, c.valido_hasta::text AS "validoHasta",
              ${this.estadoSql} AS "estadoCotizacion", c.nombre_cliente AS "nombreCliente", c.total::float AS total,
              c.venta_id AS "ventaId", v.nro_venta AS "nroVenta", c.fecha_conversion AS "fechaConversion"
       FROM ${this.schema}.cotizacion c
       LEFT JOIN ${this.schema}.venta v ON v.id = c.venta_id
       WHERE c.cliente_id = $1 AND c._estado = $2 ${cond.length ? 'AND ' + cond.join(' AND ') : ''}
       ORDER BY c._fecha_creacion DESC
       LIMIT 500`,
      params,
    )
  }

  // VENCIDA se calcula: vigente con fecha de validez ya pasada
  private estadoSql = `(CASE WHEN c.estado_cotizacion = '${EstadoCotizacion.VIGENTE}' AND c.valido_hasta < CURRENT_DATE THEN 'VENCIDA' ELSE c.estado_cotizacion END)`

  async obtener(clienteId: string, id: string): Promise<any> {
    const [cot] = await this.ds.query(
      `SELECT c.*, ${this.estadoSql} AS estado_calculado, v.nro_venta FROM ${this.schema}.cotizacion c
       LEFT JOIN ${this.schema}.venta v ON v.id = c.venta_id
       WHERE c.id = $1 AND c.cliente_id = $2 AND c._estado = $3`, [id, clienteId, Status.ACTIVE])
    if (!cot) throw new NotFoundException('Cotización no encontrada')
    const detalles = await this.ds.query(
      `SELECT d.id, d.producto_id AS "productoId", d.lote_id AS "loteId", d.nombre_producto AS "nombreProducto",
              d.cantidad::float AS cantidad, d.precio_unitario::float AS "precioUnitario", d.subtotal::float AS subtotal,
              p.unidad_medida AS "unidadMedida", p.porcentaje_factura::float AS "porcentajeFactura",
              s.nombre AS subcategoria, ca.nombre AS categoria
       FROM ${this.schema}.cotizacion_detalle d
       LEFT JOIN ${this.schema}.producto p ON p.id = d.producto_id
       LEFT JOIN ${this.schema}.subcategoria_producto s ON s.id = p.subcategoria_id
       LEFT JOIN ${this.schema}.categoria_producto ca ON ca.id = s.categoria_id
       WHERE d.cotizacion_id = $1 AND d._estado = $2
       ORDER BY d.orden ASC`, [id, Status.ACTIVE])
    return {
      cotizacion: {
        id: cot.id, nroCotizacion: cot.nro_cotizacion, fecha: this.fechaTexto(cot.fecha), validoHasta: this.fechaTexto(cot.valido_hasta),
        estadoCotizacion: cot.estado_calculado, sucursalId: cot.sucursal_id, usuarioId: cot.usuario_id, tipoPrecio: cot.tipo_precio,
        contactoClienteId: cot.contacto_cliente_id, nombreCliente: cot.nombre_cliente, nitCi: cot.nit_ci,
        telefonoCliente: cot.telefono_cliente, observaciones: cot.observaciones, total: Number(cot.total),
        ventaId: cot.venta_id, nroVenta: cot.nro_venta, fechaConversion: cot.fecha_conversion,
      },
      detalles,
    }
  }

  async anular(clienteId: string, id: string, dto: AnularCotizacionDto, usuarioId: string): Promise<Cotizacion> {
    const cot = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!cot) throw new NotFoundException('Cotización no encontrada')
    if (cot.estadoCotizacion !== EstadoCotizacion.VIGENTE) {
      throw new BadRequestException(cot.estadoCotizacion === EstadoCotizacion.CONVERTIDA
        ? 'La cotización ya se convirtió en venta; anula la venta si corresponde'
        : 'La cotización ya está anulada')
    }
    Object.assign(cot, {
      estadoCotizacion: EstadoCotizacion.ANULADA,
      observaciones: dto.motivo ? `ANULADA: ${dto.motivo}${cot.observaciones ? ' | ' + cot.observaciones : ''}` : cot.observaciones,
      transaccion: Transacccion.ACTUALIZAR, usuarioModificacion: usuarioId,
    })
    return this.repo.save(cot)
  }

  /** Datos para imprimir, con la misma forma que la impresión de ventas (lineas, empresa, vendedor, contacto). */
  async datosImpresion(clienteId: string, id: string): Promise<any> {
    const { cotizacion, detalles } = await this.obtener(clienteId, id)
    const lineas = detalles.map((d: any) => ({
      productoId: d.productoId,
      descripcion: [d.subcategoria, d.nombreProducto].filter(Boolean).join(' '),
      categoria: d.categoria, unidadMedida: d.unidadMedida, porcentajeFactura: Number(d.porcentajeFactura || 0),
      precioUnitario: d.precioUnitario, cantidad: d.cantidad, subtotal: d.subtotal,
    }))
    const [empresa] = await this.ds.query(
      `SELECT nombre, logo_url AS "logoUrl", telefono, correo_contacto AS correo, metadatos FROM ${this.schema}.cliente WHERE id = $1`, [clienteId])
    const [vendedor] = await this.ds.query(
      `SELECT nombres, apellidos, telefono FROM ${this.schema}.usuario WHERE id = $1`, [cotizacion.usuarioId])
    let contacto: any = null
    if (cotizacion.contactoClienteId) {
      ;[contacto] = await this.ds.query(
        `SELECT id, nombre, empresa, direccion FROM ${this.schema}.contacto_cliente WHERE id = $1 AND cliente_id = $2`,
        [cotizacion.contactoClienteId, clienteId])
    }
    return { cotizacion, lineas, empresa: empresa || null, vendedor: vendedor || null, contacto: contacto || null }
  }

  // ── Conversión (se llama dentro de la transacción de la venta) ─────────────
  static async marcarConvertida(manager: EntityManager, clienteId: string, cotizacionId: string, ventaId: string): Promise<void> {
    const cot = await manager.findOne(Cotizacion, {
      where: { id: cotizacionId, clienteId, estado: Status.ACTIVE },
      lock: { mode: 'pessimistic_write' },
    })
    if (!cot) throw new NotFoundException('Cotización no encontrada')
    if (cot.estadoCotizacion === EstadoCotizacion.CONVERTIDA) throw new BadRequestException(`La cotización ${cot.nroCotizacion} ya se convirtió en venta`)
    if (cot.estadoCotizacion === EstadoCotizacion.ANULADA) throw new BadRequestException(`La cotización ${cot.nroCotizacion} está anulada`)
    await manager.update(Cotizacion, { id: cot.id }, {
      estadoCotizacion: EstadoCotizacion.CONVERTIDA, ventaId, fechaConversion: new Date(), transaccion: Transacccion.ACTUALIZAR,
    })
  }

  /** Si se anula la venta, la cotización vuelve a quedar vigente para poder convertirla de nuevo. */
  static async liberarPorVenta(manager: EntityManager, clienteId: string, ventaId: string): Promise<void> {
    await manager.update(Cotizacion, { clienteId, ventaId, estadoCotizacion: EstadoCotizacion.CONVERTIDA }, {
      estadoCotizacion: EstadoCotizacion.VIGENTE, ventaId: null, fechaConversion: null, transaccion: Transacccion.ACTUALIZAR,
    })
  }

  private fechaTexto(d: any): string | null {
    if (!d) return null
    if (typeof d === 'string') return d.slice(0, 10)
    const f = new Date(d)
    return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`
  }
}
