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
exports.CotizacionesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const cotizaciones_service_1 = require("../service/cotizaciones.service");
const cotizacion_dto_1 = require("../dto/cotizacion.dto");
let CotizacionesController = class CotizacionesController {
    constructor(svc) {
        this.svc = svc;
    }
    async listar(req, sucursalId, fechaDesde, fechaHasta, estado, nombreCliente) {
        const datos = await this.svc.listar(req.user.clienteId, { sucursalId, fechaDesde, fechaHasta, estado, nombreCliente });
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async crear(req, dto) {
        const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id);
        return { finalizado: true, mensaje: 'Cotización registrada', datos };
    }
    async obtener(req, id) {
        const datos = await this.svc.obtener(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async impresion(req, id) {
        const datos = await this.svc.datosImpresion(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async anular(req, id, dto) {
        const datos = await this.svc.anular(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: 'Cotización anulada', datos };
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('sucursalId')),
    __param(2, (0, common_1.Query)('fechaDesde')),
    __param(3, (0, common_1.Query)('fechaHasta')),
    __param(4, (0, common_1.Query)('estado')),
    __param(5, (0, common_1.Query)('nombreCliente')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CotizacionesController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, cotizacion_dto_1.CrearCotizacionDto]),
    __metadata("design:returntype", Promise)
], CotizacionesController.prototype, "crear", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CotizacionesController.prototype, "obtener", null);
__decorate([
    (0, common_1.Get)(':id/impresion'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CotizacionesController.prototype, "impresion", null);
__decorate([
    (0, common_1.Put)(':id/anular'),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, cotizacion_dto_1.AnularCotizacionDto]),
    __metadata("design:returntype", Promise)
], CotizacionesController.prototype, "anular", null);
CotizacionesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR'),
    (0, common_1.Controller)('cotizaciones'),
    __metadata("design:paramtypes", [cotizaciones_service_1.CotizacionesService])
], CotizacionesController);
exports.CotizacionesController = CotizacionesController;
//# sourceMappingURL=cotizaciones.controller.js.map