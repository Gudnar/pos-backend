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
exports.VentaPagosService = exports.ORIGEN_MOV_PAGO = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const venta_entity_1 = require("../entity/venta.entity");
const venta_pago_entity_1 = require("../entity/venta-pago.entity");
const venta_documentos_service_1 = require("./venta-documentos.service");
const movimientos_fuente_service_1 = require("../../fuentes/service/movimientos-fuente.service");
const constants_1 = require("../../../common/constants");
exports.ORIGEN_MOV_PAGO = 'venta_pago';
const r2 = (n) => Math.round(n * 100) / 100;
const pagadoDe = (v) => r2(Math.min(Number(v.total || 0), Number(v.montoPagado || 0)));
let VentaPagosService = class VentaPagosService {
    constructor(ventaRepo, pagoRepo, docsSvc, movimientosSvc, ds) {
        this.ventaRepo = ventaRepo;
        this.pagoRepo = pagoRepo;
        this.docsSvc = docsSvc;
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
    async listar(clienteId, ventaId) {
        const venta = await this.obtenerVenta(clienteId, ventaId);
        const pagos = await this.ds.query(`SELECT p.id, p.origen, p.fecha::text AS fecha, p.metodo_pago AS "metodoPago", p.monto::float AS monto,
              p.referencia, p.observaciones, p.fuente_id AS "fuenteId", f.nombre AS "fuenteNombre",
              p.comprobante_nombre AS "comprobanteNombre", p.comprobante_mime AS "comprobanteMime",
              p.comprobante_tamano AS "comprobanteTamano"
       FROM ${this.schema}.venta_pago p
       LEFT JOIN ${this.schema}.fuente f ON f.id = p.fuente_id
       WHERE p.cliente_id = $1 AND p.venta_id = $2 AND p._estado = $3
       ORDER BY p.fecha ASC, p._fecha_creacion ASC`, [clienteId, ventaId, constants_1.Status.ACTIVE]);
        const total = r2(Number(venta.total || 0));
        const pagado = pagadoDe(venta);
        const conDetalle = r2(pagos.reduce((s, p) => s + Number(p.monto), 0));
        return {
            total,
            pagado,
            saldo: r2(Math.max(0, total - pagado)),
            pagoInicialSinDetalle: r2(Math.max(0, pagado - conDetalle)),
            pagos,
        };
    }
    async registrarAbono(clienteId, ventaId, dto, usuarioId) {
        const [fuente] = await this.ds.query(`SELECT id FROM ${this.schema}.fuente WHERE id = $1 AND cliente_id = $2 AND _estado = $3`, [dto.fuenteId, clienteId, constants_1.Status.ACTIVE]);
        if (!fuente)
            throw new common_1.NotFoundException('Fuente de fondos no encontrada');
        return this.ds.transaction(async (manager) => {
            const venta = await manager.findOne(venta_entity_1.Venta, {
                where: { id: ventaId, clienteId, estado: constants_1.Status.ACTIVE },
                lock: { mode: 'pessimistic_write' },
            });
            if (!venta)
                throw new common_1.NotFoundException('Venta no encontrada');
            if (venta.estadoVenta === venta_entity_1.EstadoVenta.ANULADA)
                throw new common_1.BadRequestException('La venta está anulada');
            const total = r2(Number(venta.total || 0));
            const pagado = pagadoDe(venta);
            const saldo = r2(total - pagado);
            const monto = r2(Number(dto.monto));
            if (saldo <= 0)
                throw new common_1.BadRequestException('La venta no tiene saldo pendiente');
            if (monto > saldo + 0.009)
                throw new common_1.BadRequestException(`El pago supera el saldo pendiente (Bs ${saldo.toFixed(2)})`);
            const pago = await manager.save(venta_pago_entity_1.VentaPago, manager.create(venta_pago_entity_1.VentaPago, {
                clienteId, ventaId, origen: venta_pago_entity_1.OrigenPagoVenta.ABONO,
                fecha: dto.fecha, metodoPago: dto.metodoPago, monto,
                referencia: dto.referencia || undefined, fuenteId: dto.fuenteId, observaciones: dto.observaciones || undefined,
                estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioId,
            }));
            const nuevoPagado = r2(pagado + monto);
            await manager.update(venta_entity_1.Venta, { id: ventaId }, {
                montoPagado: nuevoPagado,
                estadoVenta: nuevoPagado >= total - 0.009 ? venta_entity_1.EstadoVenta.PAGADA : venta_entity_1.EstadoVenta.PENDIENTE,
                usuarioModificacion: usuarioId,
                transaccion: constants_1.Transacccion.ACTUALIZAR,
            });
            await this.movimientosSvc.registrarExterno(clienteId, dto.fuenteId, 'INGRESO', `Cobro venta ${venta.nroVenta}${venta.nombreCliente ? ` - ${venta.nombreCliente}` : ''}${dto.referencia ? ` (ref. ${dto.referencia})` : ''}`, monto, undefined, 1, dto.fecha, 'INGRESO_VENTA', exports.ORIGEN_MOV_PAGO, pago.id, usuarioId);
            return pago;
        });
    }
    async eliminarAbono(clienteId, ventaId, pagoId, usuarioId) {
        await this.ds.transaction(async (manager) => {
            const venta = await manager.findOne(venta_entity_1.Venta, {
                where: { id: ventaId, clienteId, estado: constants_1.Status.ACTIVE },
                lock: { mode: 'pessimistic_write' },
            });
            if (!venta)
                throw new common_1.NotFoundException('Venta no encontrada');
            const pago = await this.buscarPago(clienteId, ventaId, pagoId);
            if (pago.origen !== venta_pago_entity_1.OrigenPagoVenta.ABONO) {
                throw new common_1.BadRequestException('Los pagos cobrados en el POS no se eliminan aquí; anula la venta si corresponde');
            }
            await manager.update(venta_pago_entity_1.VentaPago, { id: pago.id }, {
                estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion: usuarioId,
            });
            if (venta.estadoVenta !== venta_entity_1.EstadoVenta.ANULADA) {
                const total = r2(Number(venta.total || 0));
                const nuevoPagado = r2(Math.max(0, pagadoDe(venta) - Number(pago.monto)));
                await manager.update(venta_entity_1.Venta, { id: ventaId }, {
                    montoPagado: nuevoPagado,
                    estadoVenta: nuevoPagado >= total - 0.009 ? venta_entity_1.EstadoVenta.PAGADA : venta_entity_1.EstadoVenta.PENDIENTE,
                    usuarioModificacion: usuarioId,
                    transaccion: constants_1.Transacccion.ACTUALIZAR,
                });
            }
            await this.movimientosSvc.cancelarPorOrigen(clienteId, exports.ORIGEN_MOV_PAGO, pago.id, usuarioId);
            await this.docsSvc.borrarArchivo(pago.comprobanteRuta);
        });
    }
    async cancelarMovimientosDeVenta(clienteId, ventaId, usuarioId) {
        const abonos = await this.pagoRepo.find({ where: { clienteId, ventaId, origen: venta_pago_entity_1.OrigenPagoVenta.ABONO, estado: constants_1.Status.ACTIVE } });
        for (const p of abonos)
            await this.movimientosSvc.cancelarPorOrigen(clienteId, exports.ORIGEN_MOV_PAGO, p.id, usuarioId);
    }
    async detallarPagoInicialConComprobante(clienteId, ventaId, file, usuarioId) {
        await this.obtenerVenta(clienteId, ventaId);
        const archivo = await this.docsSvc.guardarArchivo(clienteId, ventaId, 'comprobante-pago', file);
        try {
            return await this.ds.transaction(async (manager) => {
                const venta = await manager.findOne(venta_entity_1.Venta, {
                    where: { id: ventaId, clienteId, estado: constants_1.Status.ACTIVE },
                    lock: { mode: 'pessimistic_write' },
                });
                if (!venta)
                    throw new common_1.NotFoundException('Venta no encontrada');
                const [{ suma }] = await manager.query(`SELECT COALESCE(SUM(monto), 0)::float AS suma FROM ${this.schema}.venta_pago
           WHERE cliente_id = $1 AND venta_id = $2 AND _estado = $3`, [clienteId, ventaId, constants_1.Status.ACTIVE]);
                const sinDetalle = r2(pagadoDe(venta) - Number(suma));
                if (sinDetalle <= 0)
                    throw new common_1.BadRequestException('Esta venta no tiene un pago inicial sin detalle');
                return manager.save(venta_pago_entity_1.VentaPago, manager.create(venta_pago_entity_1.VentaPago, {
                    clienteId, ventaId, origen: venta_pago_entity_1.OrigenPagoVenta.POS,
                    fecha: venta.fecha, metodoPago: venta.metodoPago || 'EFECTIVO', monto: sinDetalle,
                    comprobanteNombre: archivo.nombreOriginal, comprobanteMime: archivo.mimeType,
                    comprobanteTamano: archivo.tamano, comprobanteRuta: archivo.rutaRelativa,
                    estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioId,
                }));
            });
        }
        catch (e) {
            await this.docsSvc.borrarArchivo(archivo.rutaRelativa);
            throw e;
        }
    }
    async subirComprobante(clienteId, ventaId, pagoId, file, usuarioId) {
        await this.obtenerVenta(clienteId, ventaId);
        const pago = await this.buscarPago(clienteId, ventaId, pagoId);
        const archivo = await this.docsSvc.guardarArchivo(clienteId, ventaId, 'comprobante-pago', file);
        const anterior = pago.comprobanteRuta;
        await this.pagoRepo.update({ id: pago.id }, {
            comprobanteNombre: archivo.nombreOriginal, comprobanteMime: archivo.mimeType,
            comprobanteTamano: archivo.tamano, comprobanteRuta: archivo.rutaRelativa,
            usuarioModificacion: usuarioId, transaccion: constants_1.Transacccion.ACTUALIZAR,
        });
        await this.docsSvc.borrarArchivo(anterior);
        return { id: pago.id, comprobanteNombre: archivo.nombreOriginal, comprobanteMime: archivo.mimeType, comprobanteTamano: archivo.tamano };
    }
    async obtenerComprobante(clienteId, ventaId, pagoId) {
        await this.obtenerVenta(clienteId, ventaId);
        const pago = await this.buscarPago(clienteId, ventaId, pagoId);
        if (!pago.comprobanteRuta)
            throw new common_1.NotFoundException('El pago no tiene comprobante');
        return { nombre: pago.comprobanteNombre || 'comprobante', mime: pago.comprobanteMime || 'application/octet-stream', rutaAbsoluta: await this.docsSvc.rutaExistente(pago.comprobanteRuta) };
    }
    async eliminarComprobante(clienteId, ventaId, pagoId, usuarioId) {
        await this.obtenerVenta(clienteId, ventaId);
        const pago = await this.buscarPago(clienteId, ventaId, pagoId);
        if (!pago.comprobanteRuta)
            throw new common_1.NotFoundException('El pago no tiene comprobante');
        await this.pagoRepo.update({ id: pago.id }, {
            comprobanteNombre: null, comprobanteMime: null, comprobanteTamano: null, comprobanteRuta: null,
            usuarioModificacion: usuarioId, transaccion: constants_1.Transacccion.ACTUALIZAR,
        });
        await this.docsSvc.borrarArchivo(pago.comprobanteRuta);
    }
    async buscarPago(clienteId, ventaId, pagoId) {
        const pago = await this.pagoRepo.createQueryBuilder('p')
            .addSelect('p.comprobanteRuta')
            .where('p.id = :pagoId AND p.clienteId = :clienteId AND p.ventaId = :ventaId AND p.estado = :est', { pagoId, clienteId, ventaId, est: constants_1.Status.ACTIVE })
            .getOne();
        if (!pago)
            throw new common_1.NotFoundException('Pago no encontrado');
        return pago;
    }
};
VentaPagosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(venta_entity_1.Venta)),
    __param(1, (0, typeorm_1.InjectRepository)(venta_pago_entity_1.VentaPago)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        venta_documentos_service_1.VentaDocumentosService,
        movimientos_fuente_service_1.MovimientosFuenteService,
        typeorm_2.DataSource])
], VentaPagosService);
exports.VentaPagosService = VentaPagosService;
//# sourceMappingURL=venta-pagos.service.js.map