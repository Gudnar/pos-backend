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
exports.PagosProveedorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pago_proveedor_importacion_entity_1 = require("../entity/pago-proveedor-importacion.entity");
const orden_importacion_entity_1 = require("../entity/orden-importacion.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
const movimientos_fuente_service_1 = require("../../fuentes/service/movimientos-fuente.service");
const conversion_moneda_1 = require("../../../common/lib/conversion-moneda");
const ORIGEN = 'logistica_pago';
const baseDePago = (p) => p.montoMonedaBase != null ? Number(p.montoMonedaBase) : Number(p.monto) * Number(p.tipoCambio);
let PagosProveedorService = class PagosProveedorService {
    constructor(repo, ordenRepo, movimientosSvc) {
        this.repo = repo;
        this.ordenRepo = ordenRepo;
        this.movimientosSvc = movimientosSvc;
    }
    async validarLimite(clienteId, ordenId, nuevoMontoBase, excluirId) {
        const orden = await this.ordenRepo.findOne({ where: { id: ordenId, clienteId } });
        if (!orden)
            throw new common_1.NotFoundException('Orden no encontrada');
        const totalProductos = Number(orden.totalProductosMonedaBase ?? 0);
        const totalGastos = Number(orden.totalGastosMonedaBase ?? 0);
        const montoTotal = totalProductos + totalGastos;
        if (montoTotal === 0)
            return orden;
        const pagos = await this.repo.find({ where: { ordenImportacionId: ordenId, clienteId, estado: constants_1.Status.ACTIVE } });
        const totalExistente = pagos.filter(p => p.id !== excluirId).reduce((s, p) => s + baseDePago(p), 0);
        const nuevoTotal = totalExistente + nuevoMontoBase;
        if (nuevoTotal > montoTotal + 0.01) {
            const pendiente = Math.max(0, montoTotal - totalExistente);
            throw new common_1.BadRequestException(`El pago excede el monto pendiente. Total adeudado: ${montoTotal.toFixed(2)}, Pagado: ${totalExistente.toFixed(2)}, Pendiente: ${pendiente.toFixed(2)} — Intenta pagar: ${nuevoMontoBase.toFixed(2)}`);
        }
        return orden;
    }
    async sincronizarEgreso(clienteId, pago, conv, orden, usuario, manager) {
        await this.movimientosSvc.reemplazarExterno(clienteId, ORIGEN, pago.id, pago.fuenteId
            ? {
                fuenteId: pago.fuenteId,
                tipo: 'EGRESO',
                concepto: `Pago proveedor — Orden ${orden.numero || 'logística'}${pago.referencia ? ' · ' + pago.referencia : ''}`,
                fecha: pago.fechaPago,
                categoria: 'PAGO_PROVEEDOR',
                monedaPagoId: pago.monedaId,
                total: Number(pago.monto),
                conversion: conv,
            }
            : null, usuario, manager);
    }
    async listar(clienteId, ordenId) {
        return this.repo.find({
            where: { ordenImportacionId: ordenId, clienteId, estado: constants_1.Status.ACTIVE },
            order: { fechaCreacion: 'ASC' },
        });
    }
    async obtener(clienteId, ordenId, id) {
        const p = await this.repo.findOne({ where: { id, ordenImportacionId: ordenId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!p)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return p;
    }
    async crear(clienteId, ordenId, dto, usuarioCreacion) {
        const conv = (0, conversion_moneda_1.calcularConversion)(Number(dto.monto), dto);
        const orden = await this.validarLimite(clienteId, ordenId, conv.montoBase);
        const { fuenteId, tcOperacion, monedaIntermediaId, tcPaso2, tcPaso2Operacion, ...pagoData } = dto;
        return this.repo.manager.transaction(async (m) => {
            const repo = m.getRepository(pago_proveedor_importacion_entity_1.PagoProveedorImportacion);
            const pago = await repo.save(repo.create({
                ...pagoData,
                ...(0, conversion_moneda_1.camposConversion)(conv),
                clienteId,
                ordenImportacionId: ordenId,
                montoMonedaBase: conv.montoBase,
                metodoPago: dto.metodoPago ?? 'TRANSFERENCIA',
                fuenteId: fuenteId || undefined,
                estado: constants_1.Status.ACTIVE,
                transaccion: constants_1.Transacccion.CREAR,
                usuarioCreacion,
            }));
            if (pago.fuenteId)
                await this.sincronizarEgreso(clienteId, pago, conv, orden, usuarioCreacion, m);
            return pago;
        });
    }
    async actualizar(clienteId, ordenId, id, dto, usuarioModificacion) {
        const p = await this.obtener(clienteId, ordenId, id);
        const { fuenteId, tcOperacion, monedaIntermediaId, tcPaso2, tcPaso2Operacion, ...rest } = dto;
        const monto = Number(dto.monto ?? p.monto);
        const conv = (0, conversion_moneda_1.calcularConversion)(monto, {
            tipoCambio: dto.tipoCambio ?? (p.tcPaso1 != null ? Number(p.tcPaso1) : Number(p.tipoCambio)),
            tcOperacion: tcOperacion ?? p.tcOperacion,
            monedaIntermediaId: monedaIntermediaId !== undefined ? monedaIntermediaId : p.monedaIntermediaId,
            tcPaso2: tcPaso2 !== undefined ? tcPaso2 : p.tcPaso2,
            tcPaso2Operacion: tcPaso2Operacion !== undefined ? tcPaso2Operacion : p.tcPaso2Operacion,
        });
        const orden = await this.validarLimite(clienteId, ordenId, conv.montoBase, id);
        const teniaFuente = !!p.fuenteId;
        Object.assign(p, rest, (0, conversion_moneda_1.camposConversion)(conv), { monto, montoMonedaBase: conv.montoBase });
        if (fuenteId !== undefined)
            p.fuenteId = fuenteId || null;
        Object.assign(p, { transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.manager.transaction(async (m) => {
            const saved = await m.getRepository(pago_proveedor_importacion_entity_1.PagoProveedorImportacion).save(p);
            if (saved.fuenteId || teniaFuente)
                await this.sincronizarEgreso(clienteId, saved, conv, orden, usuarioModificacion, m);
            return saved;
        });
    }
    async eliminar(clienteId, ordenId, id, usuarioModificacion) {
        const p = await this.obtener(clienteId, ordenId, id);
        Object.assign(p, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.repo.save(p);
        await this.movimientosSvc.cancelarPorOrigen(clienteId, ORIGEN, id, usuarioModificacion);
    }
};
PagosProveedorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pago_proveedor_importacion_entity_1.PagoProveedorImportacion)),
    __param(1, (0, typeorm_1.InjectRepository)(orden_importacion_entity_1.OrdenImportacion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        movimientos_fuente_service_1.MovimientosFuenteService])
], PagosProveedorService);
exports.PagosProveedorService = PagosProveedorService;
//# sourceMappingURL=pagos-proveedor.service.js.map