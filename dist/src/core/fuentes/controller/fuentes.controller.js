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
exports.FuentesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const fuentes_service_1 = require("../service/fuentes.service");
const movimientos_fuente_service_1 = require("../service/movimientos-fuente.service");
const fuente_dto_1 = require("../dto/fuente.dto");
const movimiento_fuente_dto_1 = require("../dto/movimiento-fuente.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let FuentesController = class FuentesController {
    constructor(fuentesSvc, movimientosSvc) {
        this.fuentesSvc = fuentesSvc;
        this.movimientosSvc = movimientosSvc;
    }
    async listar(req) {
        const datos = await this.fuentesSvc.listar(req.user.clienteId);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async resumen(req) {
        const datos = await this.fuentesSvc.resumen(req.user.clienteId);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async obtener(req, id) {
        const datos = await this.fuentesSvc.obtener(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async crear(req, dto) {
        const datos = await this.fuentesSvc.crear(req.user.clienteId, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async actualizar(req, id, dto) {
        const datos = await this.fuentesSvc.actualizar(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
    async eliminar(req, id) {
        await this.fuentesSvc.eliminar(req.user.clienteId, id, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_DELETE, datos: null };
    }
    async listarMovimientos(req, id, desde, hasta, tipo, categoria) {
        const datos = await this.movimientosSvc.listar(req.user.clienteId, id, { desde, hasta, tipo, categoria });
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async registrarMovimiento(req, id, dto) {
        const datos = await this.movimientosSvc.registrar(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async registrarTransferencia(req, id, dto) {
        const datos = await this.movimientosSvc.registrarTransferencia(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: 'Transferencia registrada.', datos };
    }
    async actualizarMovimiento(req, id, movId, dto) {
        const datos = await this.movimientosSvc.actualizar(req.user.clienteId, id, movId, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
    async eliminarMovimiento(req, id, movId) {
        await this.movimientosSvc.eliminar(req.user.clienteId, id, movId, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_DELETE, datos: null };
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FuentesController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('resumen'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FuentesController.prototype, "resumen", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FuentesController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, fuente_dto_1.CreateFuenteDto]),
    __metadata("design:returntype", Promise)
], FuentesController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, fuente_dto_1.UpdateFuenteDto]),
    __metadata("design:returntype", Promise)
], FuentesController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FuentesController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Get)(':id/movimientos'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('desde')),
    __param(3, (0, common_1.Query)('hasta')),
    __param(4, (0, common_1.Query)('tipo')),
    __param(5, (0, common_1.Query)('categoria')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FuentesController.prototype, "listarMovimientos", null);
__decorate([
    (0, common_1.Post)(':id/movimientos'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, movimiento_fuente_dto_1.CreateMovimientoFuenteDto]),
    __metadata("design:returntype", Promise)
], FuentesController.prototype, "registrarMovimiento", null);
__decorate([
    (0, common_1.Post)(':id/transferencia'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, movimiento_fuente_dto_1.CreateTransferenciaDto]),
    __metadata("design:returntype", Promise)
], FuentesController.prototype, "registrarTransferencia", null);
__decorate([
    (0, common_1.Put)(':id/movimientos/:movId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('movId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, movimiento_fuente_dto_1.UpdateMovimientoFuenteDto]),
    __metadata("design:returntype", Promise)
], FuentesController.prototype, "actualizarMovimiento", null);
__decorate([
    (0, common_1.Delete)(':id/movimientos/:movId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('movId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], FuentesController.prototype, "eliminarMovimiento", null);
FuentesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN'),
    (0, common_1.Controller)('fuentes'),
    __metadata("design:paramtypes", [fuentes_service_1.FuentesService,
        movimientos_fuente_service_1.MovimientosFuenteService])
], FuentesController);
exports.FuentesController = FuentesController;
//# sourceMappingURL=fuentes.controller.js.map