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
exports.CajaController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const caja_service_1 = require("../service/caja.service");
const caja_dto_1 = require("../dto/caja.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let CajaController = class CajaController {
    constructor(svc) {
        this.svc = svc;
    }
    async listar(req, sucursalId) {
        const datos = await this.svc.listar(req.user.clienteId, sucursalId);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async crear(req, dto) {
        const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async actualizar(req, id, dto) {
        const datos = await this.svc.actualizar(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
    async eliminar(req, id) {
        await this.svc.eliminar(req.user.clienteId, id, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_DELETE, datos: null };
    }
    async sesionActiva(req) {
        const datos = await this.svc.sesionActiva(req.user.clienteId, req.user.id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async sesionesDia(req, fecha, sucursalId) {
        const datos = await this.svc.sesionesDia(req.user.clienteId, fecha, sucursalId);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async ultimasSesiones(req, cajaId) {
        const datos = await this.svc.ultimasSesiones(req.user.clienteId, cajaId);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async abrirSesion(req, dto) {
        const datos = await this.svc.abrirSesion(req.user.clienteId, dto, req.user.id);
        return { finalizado: true, mensaje: 'Sesión abierta', datos };
    }
    async cerrarSesion(req, id, dto) {
        const datos = await this.svc.cerrarSesion(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: 'Sesión cerrada', datos };
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('sucursalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CajaController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, caja_dto_1.CreateCajaDto]),
    __metadata("design:returntype", Promise)
], CajaController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, caja_dto_1.UpdateCajaDto]),
    __metadata("design:returntype", Promise)
], CajaController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CajaController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Get)('sesion/activa'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CajaController.prototype, "sesionActiva", null);
__decorate([
    (0, common_1.Get)('sesiones/dia'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('fecha')),
    __param(2, (0, common_1.Query)('sucursalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CajaController.prototype, "sesionesDia", null);
__decorate([
    (0, common_1.Get)('sesiones'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('cajaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CajaController.prototype, "ultimasSesiones", null);
__decorate([
    (0, common_1.Post)('sesion/abrir'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, caja_dto_1.AbrirSesionDto]),
    __metadata("design:returntype", Promise)
], CajaController.prototype, "abrirSesion", null);
__decorate([
    (0, common_1.Put)('sesion/:id/cerrar'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, caja_dto_1.CerrarSesionDto]),
    __metadata("design:returntype", Promise)
], CajaController.prototype, "cerrarSesion", null);
CajaController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR'),
    (0, common_1.Controller)('caja'),
    __metadata("design:paramtypes", [caja_service_1.CajaService])
], CajaController);
exports.CajaController = CajaController;
//# sourceMappingURL=caja.controller.js.map