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
exports.LotesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const lotes_service_1 = require("../service/lotes.service");
const lote_dto_1 = require("../dto/lote.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let LotesController = class LotesController {
    constructor(svc) {
        this.svc = svc;
    }
    async stockResumen(req, sucursalId) {
        const datos = await this.svc.stockResumen(req.user.clienteId, sucursalId);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async listarTodos(req, sucursalId, estadoLote, search) {
        const datos = await this.svc.listarTodos(req.user.clienteId, { sucursalId, estadoLote, search });
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async reporteGeneral(req, sucursalId) {
        const datos = await this.svc.reporteGeneral(req.user.clienteId, { sucursalId });
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async historialPrecios(req, productoId) {
        const datos = await this.svc.historialPrecios(req.user.clienteId, { productoId });
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async listarPorProducto(req, sucursalId, productoId) {
        const datos = await this.svc.listarPorProducto(req.user.clienteId, sucursalId, productoId);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async proximosAVencer(req, sucursalId) {
        const datos = await this.svc.proximosAVencer(req.user.clienteId, sucursalId);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async obtener(req, id) {
        const datos = await this.svc.obtener(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async trazabilidad(req, id) {
        const datos = await this.svc.trazabilidad(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async ingresar(req, dto) {
        const datos = await this.svc.ingresar(req.user.clienteId, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async cambiarEstado(req, id, dto) {
        const datos = await this.svc.cambiarEstado(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
};
__decorate([
    (0, common_1.Get)('stock'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('sucursalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "stockResumen", null);
__decorate([
    (0, common_1.Get)('todos'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('sucursalId')),
    __param(2, (0, common_1.Query)('estadoLote')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "listarTodos", null);
__decorate([
    (0, common_1.Get)('reporte-general'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('sucursalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "reporteGeneral", null);
__decorate([
    (0, common_1.Get)('historial-precios'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('productoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "historialPrecios", null);
__decorate([
    (0, common_1.Get)('por-producto'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('sucursalId')),
    __param(2, (0, common_1.Query)('productoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "listarPorProducto", null);
__decorate([
    (0, common_1.Get)('proximos-vencer'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('sucursalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "proximosAVencer", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "obtener", null);
__decorate([
    (0, common_1.Get)(':id/trazabilidad'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "trazabilidad", null);
__decorate([
    (0, common_1.Post)('ingresar'),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, lote_dto_1.IngresoLoteDto]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "ingresar", null);
__decorate([
    (0, common_1.Put)(':id/estado'),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, lote_dto_1.CambiarEstadoLoteDto]),
    __metadata("design:returntype", Promise)
], LotesController.prototype, "cambiarEstado", null);
LotesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR'),
    (0, common_1.Controller)('lotes'),
    __metadata("design:paramtypes", [lotes_service_1.LotesService])
], LotesController);
exports.LotesController = LotesController;
//# sourceMappingURL=lotes.controller.js.map