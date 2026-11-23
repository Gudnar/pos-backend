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
exports.VentaExtrasService = exports.ORIGEN_COMISION = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const venta_entity_1 = require("../entity/venta.entity");
const detalle_venta_entity_1 = require("../entity/detalle-venta.entity");
const venta_hoja_ruta_entity_1 = require("../entity/venta-hoja-ruta.entity");
const venta_comision_entity_1 = require("../entity/venta-comision.entity");
const movimientos_fuente_service_1 = require("../../fuentes/service/movimientos-fuente.service");
const constants_1 = require("../../../common/constants");
exports.ORIGEN_COMISION = 'venta_comision';
let VentaExtrasService = class VentaExtrasService {
    constructor(ventaRepo, detalleRepo, hojaRepo, comisionRepo, movimientosSvc, ds) {
        this.ventaRepo = ventaRepo;
        this.detalleRepo = detalleRepo;
        this.hojaRepo = hojaRepo;
        this.comisionRepo = comisionRepo;
        this.movimientosSvc = movimientosSvc;
        this.ds = ds;
        this.schema = process.env.DB_SCHEMA || 'public';
    }
    async obtenerVenta(clienteId, ventaId) {
        const venta = await this.ventaRepo.findOne({ where: { id: ventaId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!venta)
            throw new common_1.NotFoundException('Venta no encontrada');
        return venta;
    }
    async actualizarDatosNota(clienteId, ventaId, dto, usuarioId) {
        const venta = await this.obtenerVenta(clienteId, ventaId);
        if (dto.contactoClienteId)
            await this.validarContacto(clienteId, dto.contactoClienteId);
        Object.assign(venta, dto, { usuarioModificacion: usuarioId, transaccion: constants_1.Transacccion.ACTUALIZAR });
        return this.ventaRepo.save(venta);
    }
    async obtenerHojaRuta(clienteId, ventaId) {
        await this.obtenerVenta(clienteId, ventaId);
        return this.hojaRepo.findOne({ where: { clienteId, ventaId, estado: constants_1.Status.ACTIVE } });
    }
    async guardarHojaRuta(clienteId, ventaId, dto, usuarioId) {
        const venta = await this.obtenerVenta(clienteId, ventaId);
        if (venta.estadoVenta === venta_entity_1.EstadoVenta.ANULADA)
            throw new common_1.BadRequestException('La venta está anulada');
        const existente = await this.hojaRepo.findOne({ where: { clienteId, ventaId, estado: constants_1.Status.ACTIVE } });
        if (existente) {
            Object.assign(existente, dto, { usuarioModificacion: usuarioId, transaccion: constants_1.Transacccion.ACTUALIZAR });
            return this.hojaRepo.save(existente);
        }
        return this.ds.transaction(async (manager) => {
            await manager.query('SELECT pg_advisory_xact_lock($1)', [Number(clienteId) + 7100000]);
            const [{ max }] = await manager.query(`SELECT COALESCE(MAX(nro_hoja_ruta), 0) AS max FROM ${this.schema}.venta_hoja_ruta WHERE cliente_id = $1`, [clienteId]);
            return manager.save(venta_hoja_ruta_entity_1.VentaHojaRuta, manager.create(venta_hoja_ruta_entity_1.VentaHojaRuta, {
                ...dto, clienteId, ventaId, nroHojaRuta: Number(max) + 1,
                estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioId,
            }));
        });
    }
    async listarComisiones(clienteId, ventaId) {
        await this.obtenerVenta(clienteId, ventaId);
        return this.ds.query(`SELECT c.id, c.representante_id AS "representanteId", c.contacto_cliente_id AS "contactoClienteId",
              c.beneficiario_nombre AS "beneficiarioNombre", c.beneficiario_cargo AS "beneficiarioCargo",
              c.monto::float AS monto, c.fecha::text AS fecha, c.observaciones, c.fuente_id AS "fuenteId", f.nombre AS "fuenteNombre"
       FROM ${this.schema}.venta_comision c
       LEFT JOIN ${this.schema}.fuente f ON f.id = c.fuente_id
       WHERE c.cliente_id = $1 AND c.venta_id = $2 AND c._estado = $3
       ORDER BY c.fecha ASC, c._fecha_creacion ASC`, [clienteId, ventaId, constants_1.Status.ACTIVE]);
    }
    async crearComision(clienteId, ventaId, dto, usuarioId) {
        const venta = await this.obtenerVenta(clienteId, ventaId);
        if (venta.estadoVenta === venta_entity_1.EstadoVenta.ANULADA)
            throw new common_1.BadRequestException('No se puede pagar comisión de una venta anulada');
        const [rep] = await this.ds.query(`SELECT id, entidad_id AS "entidadId", nombre, cargo FROM ${this.schema}.representante
       WHERE id = $1 AND cliente_id = $2 AND tipo = 'CLIENTE' AND _estado = $3`, [dto.representanteId, clienteId, constants_1.Status.ACTIVE]);
        if (!rep)
            throw new common_1.NotFoundException('Representante no encontrado');
        if (venta.contactoClienteId && venta.contactoClienteId !== rep.entidadId) {
            throw new common_1.BadRequestException('El representante no pertenece al cliente de esta venta');
        }
        const id = (0, crypto_1.randomUUID)();
        return this.ds.transaction(async (manager) => {
            const comision = await manager.save(venta_comision_entity_1.VentaComision, manager.create(venta_comision_entity_1.VentaComision, {
                id, clienteId, ventaId,
                contactoClienteId: rep.entidadId, representanteId: rep.id,
                beneficiarioNombre: rep.nombre, beneficiarioCargo: rep.cargo || null,
                monto: dto.monto, fuenteId: dto.fuenteId, fecha: dto.fecha, observaciones: dto.observaciones || undefined,
                estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioId,
            }));
            await this.movimientosSvc.registrarExterno(clienteId, dto.fuenteId, 'EGRESO', `Comisión venta ${venta.nroVenta} - ${rep.nombre}${rep.cargo ? ` (${rep.cargo})` : ''}`, Number(dto.monto), undefined, 1, dto.fecha, 'COMISION_VENTA', exports.ORIGEN_COMISION, id, usuarioId);
            return comision;
        });
    }
    async eliminarComision(clienteId, ventaId, comisionId, usuarioId) {
        await this.obtenerVenta(clienteId, ventaId);
        const comision = await this.comisionRepo.findOne({ where: { id: comisionId, clienteId, ventaId, estado: constants_1.Status.ACTIVE } });
        if (!comision)
            throw new common_1.NotFoundException('Comisión no encontrada');
        Object.assign(comision, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion: usuarioId });
        await this.comisionRepo.save(comision);
        await this.movimientosSvc.cancelarPorOrigen(clienteId, exports.ORIGEN_COMISION, comisionId, usuarioId);
    }
    async cancelarComisionesDeVenta(clienteId, ventaId, usuarioId) {
        const comisiones = await this.comisionRepo.find({ where: { clienteId, ventaId, estado: constants_1.Status.ACTIVE } });
        for (const c of comisiones)
            await this.eliminarComision(clienteId, ventaId, c.id, usuarioId);
    }
    async totalComisionesPorVenta(clienteId, ventaIds) {
        const mapa = new Map();
        if (!ventaIds.length)
            return mapa;
        const rows = await this.comisionRepo.createQueryBuilder('c')
            .select('c.ventaId', 'ventaId').addSelect('SUM(c.monto)', 'total')
            .where('c.clienteId = :clienteId', { clienteId })
            .andWhere('c.ventaId IN (:...ventaIds)', { ventaIds })
            .andWhere('c.estado = :est', { est: constants_1.Status.ACTIVE })
            .groupBy('c.ventaId').getRawMany();
        for (const r of rows)
            mapa.set(r.ventaId, Number(r.total));
        return mapa;
    }
    async cotizacionDeVenta(clienteId, cotizacionId) {
        if (!cotizacionId)
            return null;
        const [c] = await this.ds.query(`SELECT id, nro_cotizacion AS "nroCotizacion", fecha::text AS fecha FROM ${this.schema}.cotizacion WHERE id = $1 AND cliente_id = $2`, [cotizacionId, clienteId]);
        return c || null;
    }
    async datosImpresion(clienteId, ventaId) {
        const venta = await this.obtenerVenta(clienteId, ventaId);
        const detalles = await this.detalleRepo.find({ where: { ventaId, clienteId, estado: constants_1.Status.ACTIVE }, order: { fechaCreacion: 'ASC' } });
        const productoIds = [...new Set(detalles.map(d => d.productoId))];
        const productos = productoIds.length
            ? await this.ds.query(`SELECT p.id, p.nombre, p.unidad_medida AS "unidadMedida", p.porcentaje_factura::float AS "porcentajeFactura",
                s.nombre AS subcategoria, c.nombre AS categoria
         FROM ${this.schema}.producto p
         LEFT JOIN ${this.schema}.subcategoria_producto s ON s.id = p.subcategoria_id
         LEFT JOIN ${this.schema}.categoria_producto c ON c.id = s.categoria_id
         WHERE p.id = ANY($1)`, [productoIds])
            : [];
        const prodMap = new Map(productos.map((p) => [p.id, p]));
        const lineas = [];
        for (const d of detalles) {
            const prod = prodMap.get(d.productoId) || {};
            const precio = Number(d.precioUnitario);
            let linea = lineas.find(l => l.productoId === d.productoId && l.precioUnitario === precio);
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
                };
                lineas.push(linea);
            }
            linea.cantidad += Number(d.cantidad);
            linea.subtotal += Number(d.subtotal);
        }
        const [empresa] = await this.ds.query(`SELECT nombre, logo_url AS "logoUrl", telefono, correo_contacto AS correo, metadatos FROM ${this.schema}.cliente WHERE id = $1`, [clienteId]);
        const [vendedor] = await this.ds.query(`SELECT nombres, apellidos, telefono FROM ${this.schema}.usuario WHERE id = $1`, [venta.usuarioId]);
        let contacto = null;
        let representante = null;
        if (venta.contactoClienteId) {
            ;
            [contacto] = await this.ds.query(`SELECT id, nombre, empresa, direccion FROM ${this.schema}.contacto_cliente WHERE id = $1 AND cliente_id = $2`, [venta.contactoClienteId, clienteId]);
            [representante] = await this.ds.query(`SELECT nombre, cargo, telefono FROM ${this.schema}.representante
         WHERE cliente_id = $1 AND tipo = 'CLIENTE' AND entidad_id = $2 AND activo = true AND _estado = $3
         ORDER BY fecha_inicio DESC NULLS LAST LIMIT 1`, [clienteId, venta.contactoClienteId, constants_1.Status.ACTIVE]);
        }
        const hojaRuta = await this.hojaRepo.findOne({ where: { clienteId, ventaId, estado: constants_1.Status.ACTIVE } });
        return { venta, lineas, empresa: empresa || null, vendedor: vendedor || null, contacto: contacto || null, representante: representante || null, hojaRuta };
    }
    async validarContacto(clienteId, contactoId) {
        const [c] = await this.ds.query(`SELECT id FROM ${this.schema}.contacto_cliente WHERE id = $1 AND cliente_id = $2 AND _estado = $3`, [contactoId, clienteId, constants_1.Status.ACTIVE]);
        if (!c)
            throw new common_1.NotFoundException('Cliente (contacto) no encontrado');
    }
};
VentaExtrasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(venta_entity_1.Venta)),
    __param(1, (0, typeorm_1.InjectRepository)(detalle_venta_entity_1.DetalleVenta)),
    __param(2, (0, typeorm_1.InjectRepository)(venta_hoja_ruta_entity_1.VentaHojaRuta)),
    __param(3, (0, typeorm_1.InjectRepository)(venta_comision_entity_1.VentaComision)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        movimientos_fuente_service_1.MovimientosFuenteService,
        typeorm_2.DataSource])
], VentaExtrasService);
exports.VentaExtrasService = VentaExtrasService;
//# sourceMappingURL=venta-extras.service.js.map