import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { randomUUID } from 'crypto'
import { Venta, EstadoVenta } from '../entity/venta.entity'
import { DetalleVenta } from '../entity/detalle-venta.entity'
import { VentaHojaRuta } from '../entity/venta-hoja-ruta.entity'
import { VentaComision } from '../entity/venta-comision.entity'
import { MovimientosFuenteService } from '../../fuentes/service/movimientos-fuente.service'
import { Status, Transacccion } from '../../../common/constants'
import { DatosNotaVentaDto, HojaRutaDto, CrearComisionDto } from '../dto/venta-extras.dto'

export const ORIGEN_COMISION = 'venta_comision'

/** Datos de impresión (nota de venta, hoja de ruta) y comisiones de una venta. */
@Injectable()
export class VentaExtrasService {
  constructor(
    @InjectRepository(Venta) private readonly ventaRepo: Repository<Venta>,
    @InjectRepository(DetalleVenta) private readonly detalleRepo: Repository<DetalleVenta>,
    @InjectRepository(VentaHojaRuta) private readonly hojaRepo: Repository<VentaHojaRuta>,
    @InjectRepository(VentaComision) private readonly comisionRepo: Repository<VentaComision>,
    private readonly movimientosSvc: MovimientosFuenteService,
    private readonly ds: DataSource,
  ) {}

  private schema = process.env.DB_SCHEMA || 'public'

  private async obtenerVenta(clienteId: string, ventaId: string): Promise<Venta> {
    const venta = await this.ventaRepo.findOne({ where: { id: ventaId, clienteId, estado: Status.ACTIVE } })
    if (!venta) throw new NotFoundException('Venta no encontrada')
    return venta
  }

  // ── Datos de la nota de venta ──────────────────────────────────────────────
  async actualizarDatosNota(clienteId: string, ventaId: string, dto: DatosNotaVentaDto, usuarioId: string): Promise<Venta> {
    const venta = await this.obtenerVenta(clienteId, ventaId)
    if (dto.contactoClienteId) await this.validarContacto(clienteId, dto.contactoClienteId)
    Object.assign(venta, dto, { usuarioModificacion: usuarioId, transaccion: Transacccion.ACTUALIZAR })
    return this.ventaRepo.save(venta)
  }

  // ── Hoja de ruta ───────────────────────────────────────────────────────────
  async obtenerHojaRuta(clienteId: string, ventaId: string): Promise<VentaHojaRuta | null> {
    await this.obtenerVenta(clienteId, ventaId)
    return this.hojaRepo.findOne({ where: { clienteId, ventaId, estado: Status.ACTIVE } })
  }

  async guardarHojaRuta(clienteId: string, ventaId: string, dto: HojaRutaDto, usuarioId: string): Promise<VentaHojaRuta> {
    const venta = await this.obtenerVenta(clienteId, ventaId)
    if (venta.estadoVenta === EstadoVenta.ANULADA) throw new BadRequestException('La venta está anulada')
    const existente = await this.hojaRepo.findOne({ where: { clienteId, ventaId, estado: Status.ACTIVE } })
    if (existente) {
      Object.assign(existente, dto, { usuarioModificacion: usuarioId, transaccion: Transacccion.ACTUALIZAR })
      return this.hojaRepo.save(existente)
    }
    return this.ds.transaction(async manager => {
      // Correlativo por empresa; el bloqueo evita números repetidos en altas simultáneas
      await manager.query('SELECT pg_advisory_xact_lock($1)', [Number(clienteId) + 7_100_000])
      const [{ max }] = await manager.query(
        `SELECT COALESCE(MAX(nro_hoja_ruta), 0) AS max FROM ${this.schema}.venta_hoja_ruta WHERE cliente_id = $1`, [clienteId],
      )
      return manager.save(VentaHojaRuta, manager.create(VentaHojaRuta, {
        ...dto, clienteId, ventaId, nroHojaRuta: Number(max) + 1,
        estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: usuarioId,
      }))
    })
  }

  // ── Comisiones ─────────────────────────────────────────────────────────────
  async listarComisiones(clienteId: string, ventaId: string): Promise<any[]> {
    await this.obtenerVenta(clienteId, ventaId)
    return this.ds.query(
      `SELECT c.id, c.representante_id AS "representanteId", c.contacto_cliente_id AS "contactoClienteId",
              c.beneficiario_nombre AS "beneficiarioNombre", c.beneficiario_cargo AS "beneficiarioCargo",
              c.monto::float AS monto, c.fecha::text AS fecha, c.observaciones, c.fuente_id AS "fuenteId", f.nombre AS "fuenteNombre"
       FROM ${this.schema}.venta_comision c
       LEFT JOIN ${this.schema}.fuente f ON f.id = c.fuente_id
       WHERE c.cliente_id = $1 AND c.venta_id = $2 AND c._estado = $3
       ORDER BY c.fecha ASC, c._fecha_creacion ASC`,
      [clienteId, ventaId, Status.ACTIVE],
    )
  }

  async crearComision(clienteId: string, ventaId: string, dto: CrearComisionDto, usuarioId: string): Promise<any> {
    const venta = await this.obtenerVenta(clienteId, ventaId)
    if (venta.estadoVenta === EstadoVenta.ANULADA) throw new BadRequestException('No se puede pagar comisión de una venta anulada')

    const [rep] = await this.ds.query(
      `SELECT id, entidad_id AS "entidadId", nombre, cargo FROM ${this.schema}.representante
       WHERE id = $1 AND cliente_id = $2 AND tipo = 'CLIENTE' AND _estado = $3`,
      [dto.representanteId, clienteId, Status.ACTIVE],
    )
    if (!rep) throw new NotFoundException('Representante no encontrado')
    if (venta.contactoClienteId && venta.contactoClienteId !== rep.entidadId) {
      throw new BadRequestException('El representante no pertenece al cliente de esta venta')
    }

    const id = randomUUID()
    return this.ds.transaction(async manager => {
      const comision = await manager.save(VentaComision, manager.create(VentaComision, {
        id, clienteId, ventaId,
        contactoClienteId: rep.entidadId, representanteId: rep.id,
        beneficiarioNombre: rep.nombre, beneficiarioCargo: rep.cargo || null,
        monto: dto.monto, fuenteId: dto.fuenteId, fecha: dto.fecha, observaciones: dto.observaciones || undefined,
        estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: usuarioId,
      }))
      // Valida la fuente y que tenga fondos; si falla se revierte la comisión
      await this.movimientosSvc.registrarExterno(
        clienteId, dto.fuenteId, 'EGRESO',
        `Comisión venta ${venta.nroVenta} - ${rep.nombre}${rep.cargo ? ` (${rep.cargo})` : ''}`,
        Number(dto.monto), undefined, 1, dto.fecha, 'COMISION_VENTA', ORIGEN_COMISION, id, usuarioId,
      )
      return comision
    })
  }

  async eliminarComision(clienteId: string, ventaId: string, comisionId: string, usuarioId: string): Promise<void> {
    await this.obtenerVenta(clienteId, ventaId)
    const comision = await this.comisionRepo.findOne({ where: { id: comisionId, clienteId, ventaId, estado: Status.ACTIVE } })
    if (!comision) throw new NotFoundException('Comisión no encontrada')
    Object.assign(comision, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion: usuarioId })
    await this.comisionRepo.save(comision)
    await this.movimientosSvc.cancelarPorOrigen(clienteId, ORIGEN_COMISION, comisionId, usuarioId)
  }

  /** Al anular una venta se revierten sus comisiones y los egresos en las fuentes. */
  async cancelarComisionesDeVenta(clienteId: string, ventaId: string, usuarioId: string): Promise<void> {
    const comisiones = await this.comisionRepo.find({ where: { clienteId, ventaId, estado: Status.ACTIVE } })
    for (const c of comisiones) await this.eliminarComision(clienteId, ventaId, c.id, usuarioId)
  }

  async totalComisionesPorVenta(clienteId: string, ventaIds: string[]): Promise<Map<string, number>> {
    const mapa = new Map<string, number>()
    if (!ventaIds.length) return mapa
    const rows = await this.comisionRepo.createQueryBuilder('c')
      .select('c.ventaId', 'ventaId').addSelect('SUM(c.monto)', 'total')
      .where('c.clienteId = :clienteId', { clienteId })
      .andWhere('c.ventaId IN (:...ventaIds)', { ventaIds })
      .andWhere('c.estado = :est', { est: Status.ACTIVE })
      .groupBy('c.ventaId').getRawMany()
    for (const r of rows) mapa.set(r.ventaId, Number(r.total))
    return mapa
  }

  async cotizacionDeVenta(clienteId: string, cotizacionId?: string | null): Promise<any> {
    if (!cotizacionId) return null
    const [c] = await this.ds.query(
      `SELECT id, nro_cotizacion AS "nroCotizacion", fecha::text AS fecha FROM ${this.schema}.cotizacion WHERE id = $1 AND cliente_id = $2`,
      [cotizacionId, clienteId])
    return c || null
  }

  // ── Datos completos para imprimir nota de venta / hoja de ruta ─────────────
  async datosImpresion(clienteId: string, ventaId: string): Promise<any> {
    const venta = await this.obtenerVenta(clienteId, ventaId)
    const detalles = await this.detalleRepo.find({ where: { ventaId, clienteId, estado: Status.ACTIVE }, order: { fechaCreacion: 'ASC' } })

    // Producto con categoría y subcategoría para la descripción
    const productoIds = [...new Set(detalles.map(d => d.productoId))]
    const productos = productoIds.length
      ? await this.ds.query(
        `SELECT p.id, p.nombre, p.unidad_medida AS "unidadMedida", p.porcentaje_factura::float AS "porcentajeFactura",
                s.nombre AS subcategoria, c.nombre AS categoria
         FROM ${this.schema}.producto p
         LEFT JOIN ${this.schema}.subcategoria_producto s ON s.id = p.subcategoria_id
         LEFT JOIN ${this.schema}.categoria_producto c ON c.id = s.categoria_id
         WHERE p.id = ANY($1)`, [productoIds])
      : []
    const prodMap = new Map(productos.map((p: any) => [p.id, p]))

    // Una línea por producto (la venta guarda una fila por lote usado)
    const lineas: any[] = []
    for (const d of detalles) {
      const prod: any = prodMap.get(d.productoId) || {}
      const precio = Number(d.precioUnitario)
      let linea = lineas.find(l => l.productoId === d.productoId && l.precioUnitario === precio)
      if (!linea) {
        linea = {
          productoId: d.productoId,
          descripcion: [prod.subcategoria, d.nombreProducto].filter(Boolean).join(' ') || d.nombreProducto,
          categoria: prod.categoria || null,
          unidadMedida: prod.unidadMedida || null,
          porcentajeFactura: Number(prod.porcentajeFactura || 0),
          precioUnitario: precio,
          cantidad: 0,
          subtotal: 0,
        }
        lineas.push(linea)
      }
      linea.cantidad += Number(d.cantidad)
      linea.subtotal += Number(d.subtotal)
    }

    const [empresa] = await this.ds.query(
      `SELECT nombre, logo_url AS "logoUrl", telefono, correo_contacto AS correo, metadatos FROM ${this.schema}.cliente WHERE id = $1`, [clienteId])
    const [vendedor] = await this.ds.query(
      `SELECT nombres, apellidos, telefono FROM ${this.schema}.usuario WHERE id = $1`, [venta.usuarioId])

    let contacto: any = null
    let representante: any = null
    if (venta.contactoClienteId) {
      ;[contacto] = await this.ds.query(
        `SELECT id, nombre, empresa, direccion FROM ${this.schema}.contacto_cliente WHERE id = $1 AND cliente_id = $2`,
        [venta.contactoClienteId, clienteId])
      ;[representante] = await this.ds.query(
        `SELECT nombre, cargo, telefono FROM ${this.schema}.representante
         WHERE cliente_id = $1 AND tipo = 'CLIENTE' AND entidad_id = $2 AND activo = true AND _estado = $3
         ORDER BY fecha_inicio DESC NULLS LAST LIMIT 1`,
        [clienteId, venta.contactoClienteId, Status.ACTIVE])
    }

    const hojaRuta = await this.hojaRepo.findOne({ where: { clienteId, ventaId, estado: Status.ACTIVE } })
    return { venta, lineas, empresa: empresa || null, vendedor: vendedor || null, contacto: contacto || null, representante: representante || null, hojaRuta }
  }

  private async validarContacto(clienteId: string, contactoId: string) {
    const [c] = await this.ds.query(
      `SELECT id FROM ${this.schema}.contacto_cliente WHERE id = $1 AND cliente_id = $2 AND _estado = $3`, [contactoId, clienteId, Status.ACTIVE])
    if (!c) throw new NotFoundException('Cliente (contacto) no encontrado')
  }
}
