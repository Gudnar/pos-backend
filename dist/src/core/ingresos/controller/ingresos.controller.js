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
exports.IngresosController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const ingresos_service_1 = require("../service/ingresos.service");
const ingreso_dto_1 = require("../dto/ingreso.dto");
let IngresosController = class IngresosController {
    constructor(svc) {
        this.svc = svc;
    }
    async listar(req, tipo, categoria) {
        const datos = await this.svc.listar(req.user.clienteId, tipo, categoria);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async listarAdelantos(req, contactoClienteId) {
        const datos = await this.svc.listarAdelantos(req.user.clienteId, contactoClienteId);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async obtener(req, id) {
        const datos = await this.svc.obtener(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async crear(req, dto) {
        const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id);
        return { finalizado: true, mensaje: 'Ingreso registrado correctamente', datos };
    }
    async actualizar(req, id, dto) {
        const datos = await this.svc.actualizar(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: 'Ingreso actualizado correctamente', datos };
    }
    async anular(req, id) {
        await this.svc.anular(req.user.clienteId, id, req.user.id);
        return { finalizado: true, mensaje: 'Ingreso anulado correctamente', datos: null };
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('tipo')),
    __param(2, (0, common_1.Query)('categoria')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], IngresosController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('adelantos'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('contactoClienteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IngresosController.prototype, "listarAdelantos", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IngresosController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ingreso_dto_1.CreateIngresoDto]),
    __metadata("design:returntype", Promise)
], IngresosController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, ingreso_dto_1.UpdateIngresoDto]),
    __metadata("design:returntype", Promise)
], IngresosController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Put)(':id/anular'),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IngresosController.prototype, "anular", null);
IngresosController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR'),
    (0, common_1.Controller)('ingresos'),
    __metadata("design:paramtypes", [ingresos_service_1.IngresosService])
], IngresosController);
exports.IngresosController = IngresosController;
//# sourceMappingURL=ingresos.controller.js.map