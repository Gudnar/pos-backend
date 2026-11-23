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
exports.GastosLogisticaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const gasto_logistica_entity_1 = require("../entity/gasto-logistica.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
const movimientos_fuente_service_1 = require("../../fuentes/service/movimientos-fuente.service");
const conversion_moneda_1 = require("../../../common/lib/conversion-moneda");
const ORIGEN = 'logistica_gasto';
let GastosLogisticaService = class GastosLogisticaService {
    constructor(repo, movimientosSvc) {
        this.repo = repo;
        this.movimientosSvc = movimientosSvc;
    }
    async sincronizarEgreso(clienteId, g, total, conv, usuario, manager) {
        await this.movimientosSvc.reemplazarExterno(clienteId, ORIGEN, g.id, g.fuenteId
            ? {
                fuenteId: g.fuenteId,
                tipo: 'EGRESO',
                concepto: g.descripcion || 'Gasto logístico',
                fecha: g.fechaGasto,
                categoria: 'GASTO_LOGISTICA',
                monedaPagoId: g.monedaId,
                total,
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
        const g = await this.repo.findOne({ where: { id, ordenImportacionId: ordenId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!g)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return g;
    }
    async crear(clienteId, ordenId, dto, usuarioCreacion) {
        const { fuenteId, tcOperacion, monedaIntermediaId, tcPaso2, tcPaso2Operacion, ...gastoData } = dto;
        const cantidad = Number(dto.cantidad) || 1;
        const total = Number(dto.monto) * cantidad;
        const conv = (0, conversion_moneda_1.calcularConversion)(total, dto);
        return this.repo.manager.transaction(async (m) => {
            const repo = m.getRepository(gasto_logistica_entity_1.GastoLogistica);
            const gasto = await repo.save(repo.create({
                ...gastoData,
                ...(0, conversion_moneda_1.camposConversion)(conv),
                clienteId,
                ordenImportacionId: ordenId,
                cantidad,
                montoMonedaBase: conv.montoBase,
                fuenteId: fuenteId || undefined,
                estado: constants_1.Status.ACTIVE,
                transaccion: constants_1.Transacccion.CREAR,
                usuarioCreacion,
            }));
            if (gasto.fuenteId)
                await this.sincronizarEgreso(clienteId, gasto, total, conv, usuarioCreacion, m);
            return gasto;
        });
    }
    async actualizar(clienteId, ordenId, id, dto, usuarioModificacion) {
        const g = await this.obtener(clienteId, ordenId, id);
        const { fuenteId, tcOperacion, monedaIntermediaId, tcPaso2, tcPaso2Operacion, ...rest } = dto;
        const teniaFuente = !!g.fuenteId;
        Object.assign(g, rest);
        const cantidad = Number(g.cantidad) || 1;
        const total = Number(g.monto) * cantidad;
        const conv = (0, conversion_moneda_1.calcularConversion)(total, {
            tipoCambio: dto.tipoCambio ?? (g.tcPaso1 != null ? Number(g.tcPaso1) : Number(g.tipoCambio)),
            tcOperacion: tcOperacion ?? g.tcOperacion,
            monedaIntermediaId: monedaIntermediaId !== undefined ? monedaIntermediaId : g.monedaIntermediaId,
            tcPaso2: tcPaso2 !== undefined ? tcPaso2 : g.tcPaso2,
            tcPaso2Operacion: tcPaso2Operacion !== undefined ? tcPaso2Operacion : g.tcPaso2Operacion,
        });
        Object.assign(g, (0, conversion_moneda_1.camposConversion)(conv), { cantidad, montoMonedaBase: conv.montoBase });
        if (fuenteId !== undefined)
            g.fuenteId = fuenteId || null;
        Object.assign(g, { transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.manager.transaction(async (m) => {
            const saved = await m.getRepository(gasto_logistica_entity_1.GastoLogistica).save(g);
            if (saved.fuenteId || teniaFuente)
                await this.sincronizarEgreso(clienteId, saved, total, conv, usuarioModificacion, m);
            return saved;
        });
    }
    async eliminar(clienteId, ordenId, id, usuarioModificacion) {
        const g = await this.obtener(clienteId, ordenId, id);
        Object.assign(g, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.repo.save(g);
        await this.movimientosSvc.cancelarPorOrigen(clienteId, ORIGEN, id, usuarioModificacion);
    }
};
GastosLogisticaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gasto_logistica_entity_1.GastoLogistica)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        movimientos_fuente_service_1.MovimientosFuenteService])
], GastosLogisticaService);
exports.GastosLogisticaService = GastosLogisticaService;
//# sourceMappingURL=gastos-logistica.service.js.map