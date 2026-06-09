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
let GastosLogisticaService = class GastosLogisticaService {
    constructor(repo, movimientosSvc) {
        this.repo = repo;
        this.movimientosSvc = movimientosSvc;
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
        const { fuenteId, ...gastoData } = dto;
        const gasto = await this.repo.save(this.repo.create({
            ...gastoData,
            clienteId,
            ordenImportacionId: ordenId,
            montoMonedaBase: Number(dto.monto) * Number(dto.tipoCambio),
            fuenteId: fuenteId || undefined,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
        if (fuenteId) {
            await this.movimientosSvc.registrarExterno(clienteId, fuenteId, 'EGRESO', dto.descripcion ?? 'Gasto logístico', Number(dto.monto), dto.monedaId, Number(dto.tipoCambio), dto.fechaGasto, 'GASTO_LOGISTICA', 'logistica_gasto', gasto.id, usuarioCreacion);
        }
        return gasto;
    }
    async actualizar(clienteId, ordenId, id, dto, usuarioModificacion) {
        const g = await this.obtener(clienteId, ordenId, id);
        const { fuenteId, ...rest } = dto;
        const nuevaFuente = fuenteId || undefined;
        Object.assign(g, rest);
        g.montoMonedaBase = Number(g.monto) * Number(g.tipoCambio);
        if (nuevaFuente !== undefined)
            g.fuenteId = nuevaFuente;
        Object.assign(g, { transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        const saved = await this.repo.save(g);
        if (nuevaFuente) {
            await this.movimientosSvc.registrarExterno(clienteId, nuevaFuente, 'EGRESO', saved.descripcion ?? 'Gasto logístico actualizado', Number(saved.monto), saved.monedaId, Number(saved.tipoCambio), saved.fechaGasto, 'GASTO_LOGISTICA', 'logistica_gasto', saved.id, usuarioModificacion);
        }
        return saved;
    }
    async eliminar(clienteId, ordenId, id, usuarioModificacion) {
        const g = await this.obtener(clienteId, ordenId, id);
        Object.assign(g, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.repo.save(g);
        if (g.fuenteId) {
            await this.movimientosSvc.cancelarPorOrigen(clienteId, 'logistica_gasto', id, usuarioModificacion);
        }
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