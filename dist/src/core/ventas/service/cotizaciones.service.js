"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CotizacionesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cotizacion_entity_1 = require("../entity/cotizacion.entity");
const cotizacion_detalle_entity_1 = require("../entity/cotizacion-detalle.entity");
const producto_entity_1 = require("../../productos/entity/producto.entity");
const constants_1 = require("../../../common/constants");
const r2 = (n) => Math.round(n * 100) / 100;
let CotizacionesService = class CotizacionesService {
    constructor(repo, detalleRepo, ds) {
        this.repo = repo;
        this.detalleRepo = detalleRepo;
        this.ds = ds;
        this.schema = process.env.DB_SCHEMA || 'public';
        this.estadoSql = `(CASE WHEN c.estado_cotizacion = '${cotizacion_entity_1.EstadoCotizacion.VIGENTE}' AND c.valido_hasta < CURRENT_DATE THEN 'VENCIDA' ELSE c.estado_cotizacion END)`;
    }
    async crear(clienteId, dto, usuarioId) {
        if (dto.validoHasta && dto.fecha && dto.validoHasta < dto.fecha) {
            throw new common_1.BadRequestException('La fecha de validez no puede ser anterior a la fecha de la cotización');
        }
        return this.ds.transaction(async (manager) => {
            const ids = [...new Set(dto.detalles.map(d => d.productoId))];
            const productos = await manager.find(producto_entity_1.Producto, { where: { id: (0, typeorm_2.In)(ids), clienteId, estado: constants_1.Status.ACTIVE } });
            const prodMap = new Map(productos.map(p => [p.id, p]));
            const faltante = ids.find(id => !prodMap.has(id));
            if (faltante)
                throw new common_1.NotFoundException(`Producto ${faltante} no encontrado`);
            const fecha = dto.fecha || new Date().toISOString().split('T')[0];
            const anio = fecha.slice(0, 4);
            await manager.query('SELECT pg_advisory_xact_lock($1)', [Number(clienteId) + 7200000]);
            const [{ max }] = await manager.query(`SELECT COALESCE(MAX(CAST(SPLIT_PART(nro_cotizacion, '-', 3) AS int)), 0) AS max
         FROM ${this.schema}.cotizacion WHERE cliente_id = $1 AND nro_cotizacion LIKE $2`, [clienteId, `COT-${anio}-%`]);
            const nroCotizacion = `COT-${anio}-${String(Number(max) + 1).padStart(5, '0')}`;
            const lineas = dto.detalles.map((d, i) => ({
                d, i, subtotal: r2(Number(d.precioUnitario) * Number(d.cantidad) - Number(d.descuento || 0)),
            }));
            const total = r2(lineas.reduce((s, l) => s + l.subtotal, 0));
            const cot = await manager.save(cotizacion_entity_1.Cotizacion, manager.create(cotizacion_entity_1.Cotizacion, {
                clienteId, sucursalId: dto.sucursalId, usuarioId, nroCotizacion, fecha,
                validoHasta: dto.validoHasta || undefined, estadoCotizacion: cotizacion_entity_1.EstadoCotizacion.VIGENTE,
                tipoPrecio: dto.tipoPrecio, contactoClienteId: dto.contactoClienteId,
                nombreCliente: dto.nombreCliente, nitCi: dto.nitCi, telefonoCliente: dto.telefonoCliente,
                observaciones: dto.observaciones, total,
                estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioId,
            }));
            for (const { d, i, subtotal } of lineas) {
                await manager.save(cotizacion_detalle_entity_1.CotizacionDetalle, manager.create(cotizacion_detalle_entity_1.CotizacionDetalle, {
                    clienteId, cotizacionId: cot.id, productoId: d.productoId, loteId: d.loteId,
                    nombreProducto: prodMap.get(d.productoId).nombre,
                    cantidad: Number(d.cantidad), precioUnitario: Number(d.precioUnitario), subtotal, orden: i,
                    estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioId,
                }));
            }
            return cot;
        });
    }
    async listar(clienteId, f) {
        const params = [clienteId, constants_1.Status.ACTIVE];
        const cond = [];
        const add = (sql, v) => { params.push(v); cond.push(sql.replace('?', `$${params.length}`)); };
        if (f.sucursalId)
            add('c.sucursal_id = ?', f.sucursalId);
        if (f.fechaDesde)
            add('c.fecha >= ?', f.fechaDesde);
        if (f.fechaHasta)
            add('c.fecha <= ?', f.fechaHasta);
        if (f.nombreCliente)
            add('c.nombre_cliente ILIKE ?', `%${f.nombreCliente}%`);
        if (f.estado)
            add(`${this.estadoSql} = ?`, f.estado);
        return this.ds.query(`SELECT c.id, c.nro_cotizacion AS "nroCotizacion", c.fecha::text AS fecha, c.valido_hasta::text AS "validoHasta",
              ${this.estadoSql} AS "estadoCotizacion", c.nombre_cliente AS "nombreCliente", c.total::float AS total,
              c.venta_id AS "ventaId", v.nro_venta AS "nroVenta", c.fecha_conversion AS "fechaConversion"
       FROM ${this.schema}.cotizacion c
       LEFT JOIN ${this.schema}.venta v ON v.id = c.venta_id
       WHERE c.cliente_id = $1 AND c._estado = $2 ${cond.length ? 'AND ' + cond.join(' AND ') : ''}
       ORDER BY c._fecha_creacion DESC
       LIMIT 500`, params);
    }
    async obtener(clienteId, id) {
        const [cot] = await this.ds.query(`SELECT c.*, ${this.estadoSql} AS estado_calculado, v.nro_venta FROM ${this.schema}.cotizacion c
       LEFT JOIN ${this.schema}.venta v ON v.id = c.venta_id
       WHERE c.id = $1 AND c.cliente_id = $2 AND c._estado = $3`, [id, clienteId, constants_1.Status.ACTIVE]);
        if (!cot)
            throw new common_1.NotFoundException('Cotización no encontrada');
        const detalles = await this.ds.query(`SELECT d.id, d.producto_id AS "productoId", d.lote_id AS "loteId", d.nombre_producto AS "nombreProducto",
              d.cantidad::float AS cantidad, d.precio_unitario::float AS "precioUnitario", d.subtotal::float AS subtotal,
              p.unidad_medida AS "unidadMedida", p.porcentaje_factura::float AS "porcentajeFactura",
              s.nombre AS subcategoria, ca.nombre AS categoria
       FROM ${this.schema}.cotizacion_detalle d
       LEFT JOIN ${this.schema}.producto p ON p.id = d.producto_id
       LEFT JOIN ${this.schema}.subcategoria_producto s ON s.id = p.subcategoria_id
       LEFT JOIN ${this.schema}.categoria_producto ca ON ca.id = s.categoria_id
       WHERE d.cotizacion_id = $1 AND d._estado = $2
       ORDER BY d.orden ASC`, [id, constants_1.Status.ACTIVE]);
        return {
            cotizacion: {
                id: cot.id, nroCotizacion: cot.nro_cotizacion, fecha: this.fechaTexto(cot.fecha), validoHasta: this.fechaTexto(cot.valido_hasta),
                estadoCotizacion: cot.estado_calculado, sucursalId: cot.sucursal_id, usuarioId: cot.usuario_id, tipoPrecio: cot.tipo_precio,
                contactoClienteId: cot.contacto_cliente_id, nombreCliente: cot.nombre_cliente, nitCi: cot.nit_ci,
                telefonoCliente: cot.telefono_cliente, observaciones: cot.observaciones, total: Number(cot.total),
                ventaId: cot.venta_id, nroVenta: cot.nro_venta, fechaConversion: cot.fecha_conversion,
            },
            detalles,
        };
    }
    async anular(clienteId, id, dto, usuarioId) {
        const cot = await this.repo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!cot)
            throw new common_1.NotFoundException('Cotización no encontrada');
        if (cot.estadoCotizacion !== cotizacion_entity_1.EstadoCotizacion.VIGENTE) {
            throw new common_1.BadRequestException(cot.estadoCotizacion === cotizacion_entity_1.EstadoCotizacion.CONVERTIDA
                ? 'La cotización ya se convirtió en venta; anula la venta si corresponde'
                : 'La cotización ya está anulada');
        }
        Object.assign(cot, {
            estadoCotizacion: cotizacion_entity_1.EstadoCotizacion.ANULADA,
            observaciones: dto.motivo ? `ANULADA: ${dto.motivo}${cot.observaciones ? ' | ' + cot.observaciones : ''}` : cot.observaciones,
            transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion: usuarioId,
        });
        return this.repo.save(cot);
    }
    async datosImpresion(clienteId, id) {
        const { cotizacion, detalles } = await this.obtener(clienteId, id);
        const lineas = detalles.map((d) => ({
            productoId: d.productoId,
            descripcion: [d.subcategoria, d.nombreProducto].filter(Boolean).join(' '),
            categoria: d.categoria, unidadMedida: d.unidadMedida, porcentajeFactura: Number(d.porcentajeFactura || 0),
            precioUnitario: d.precioUnitario, cantidad: d.cantidad, subtotal: d.subtotal,
        }));
        const [empresa] = await this.ds.query(`SELECT nombre, logo_url AS "logoUrl", telefono, correo_contacto AS correo, metadatos FROM ${this.schema}.cliente WHERE id = $1`, [clienteId]);
        const [vendedor] = await this.ds.query(`SELECT nombres, apellidos, telefono FROM ${this.schema}.usuario WHERE id = $1`, [cotizacion.usuarioId]);
        let contacto = null;
        if (cotizacion.contactoClienteId) {
            ;
            [contacto] = await this.ds.query(`SELECT id, nombre, empresa, direccion FROM ${this.schema}.contacto_cliente WHERE id = $1 AND cliente_id = $2`, [cotizacion.contactoClienteId, clienteId]);
        }
        return { cotizacion, lineas, empresa: empresa || null, vendedor: vendedor || null, contacto: contacto || null };
    }
    static async marcarConvertida(manager, clienteId, cotizacionId, ventaId) {
        const cot = await manager.findOne(cotizacion_entity_1.Cotizacion, {
            where: { id: cotizacionId, clienteId, estado: constants_1.Status.ACTIVE },
            lock: { mode: 'pessimistic_write' },
        });
        if (!cot)
            throw new common_1.NotFoundException('Cotización no encontrada');
        if (cot.estadoCotizacion === cotizacion_entity_1.EstadoCotizacion.CONVERTIDA)
            throw new common_1.BadRequestException(`La cotización ${cot.nroCotizacion} ya se convirtió en venta`);
        if (cot.estadoCotizacion === cotizacion_entity_1.EstadoCotizacion.ANULADA)
            throw new common_1.BadRequestException(`La cotización ${cot.nroCotizacion} está anulada`);
        await manager.update(cotizacion_entity_1.Cotizacion, { id: cot.id }, {
            estadoCotizacion: cotizacion_entity_1.EstadoCotizacion.CONVERTIDA, ventaId, fechaConversion: new Date(), transaccion: constants_1.Transacccion.ACTUALIZAR,
        });
    }
    static async liberarPorVenta(manager, clienteId, ventaId) {
        await manager.update(cotizacion_entity_1.Cotizacion, { clienteId, ventaId, estadoCotizacion: cotizacion_entity_1.EstadoCotizacion.CONVERTIDA }, {
            estadoCotizacion: cotizacion_entity_1.EstadoCotizacion.VIGENTE, ventaId: null, fechaConversion: null, transaccion: constants_1.Transacccion.ACTUALIZAR,
        });
    }
    fechaTexto(d) {
        if (!d)
            return null;
        if (typeof d === 'string')
            return d.slice(0, 10);
        const f = new Date(d);
        return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
    }
};
CotizacionesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cotizacion_entity_1.Cotizacion)),
    __param(1, (0, typeorm_1.InjectRepository)(cotizacion_detalle_entity_1.CotizacionDetalle)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], CotizacionesService);
exports.CotizacionesService = CotizacionesService;
//# sourceMappingURL=cotizaciones.service.js.map