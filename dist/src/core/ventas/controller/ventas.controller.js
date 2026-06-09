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
exports.VentasController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const ventas_service_1 = require("../service/ventas.service");
const venta_dto_1 = require("../dto/venta.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let VentasController = class VentasController {
    constructor(svc) {
        this.svc = svc;
    }
    async listar(req, sucursalId, fecha, estadoVenta) {
        const datos = await this.svc.listar(req.user.clienteId, sucursalId, fecha, estadoVenta);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async obtener(req, id) {
        const datos = await this.svc.obtener(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async crear(req, dto) {
        const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async anular(req, id, dto) {
        const datos = await this.svc.anular(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: 'Venta anulada', datos };
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('sucursalId')),
    __param(2, (0, common_1.Query)('fecha')),
    __param(3, (0, common_1.Query)('estadoVenta')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, venta_dto_1.CrearVentaDto]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id/anular'),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, venta_dto_1.AnularVentaDto]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "anular", null);
VentasController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR'),
    (0, common_1.Controller)('ventas'),
    __metadata("design:paramtypes", [ventas_service_1.VentasService])
], VentasController);
exports.VentasController = VentasController;
//# sourceMappingURL=ventas.controller.js.map