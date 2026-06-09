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
exports.MovimientosStockController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const movimientos_stock_service_1 = require("../service/movimientos-stock.service");
const movimiento_stock_dto_1 = require("../dto/movimiento-stock.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let MovimientosStockController = class MovimientosStockController {
    constructor(svc) {
        this.svc = svc;
    }
    async kardex(req, sucursalId, productoId, fechaDesde, fechaHasta, tipo) {
        const datos = await this.svc.kardex(req.user.clienteId, { sucursalId, productoId, fechaDesde, fechaHasta, tipo });
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async sinMovimiento(req, sucursalId, dias) {
        const datos = await this.svc.sinMovimiento(req.user.clienteId, { sucursalId, dias: dias ? Number(dias) : undefined });
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async reporteRotacion(req, sucursalId, fechaDesde, fechaHasta) {
        const datos = await this.svc.reporteRotacion(req.user.clienteId, { sucursalId, fechaDesde, fechaHasta });
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async listar(req, sucursalId, productoId) {
        const datos = await this.svc.listarPorSucursal(req.user.clienteId, sucursalId, productoId);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async registrar(req, dto) {
        const datos = await this.svc.registrar(req.user.clienteId, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async transferir(req, dto) {
        const datos = await this.svc.transferir(req.user.clienteId, dto, req.user.id);
        return { finalizado: true, mensaje: 'Transferencia registrada', datos };
    }
};
__decorate([
    (0, common_1.Get)('kardex'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('sucursalId')),
    __param(2, (0, common_1.Query)('productoId')),
    __param(3, (0, common_1.Query)('fechaDesde')),
    __param(4, (0, common_1.Query)('fechaHasta')),
    __param(5, (0, common_1.Query)('tipo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MovimientosStockController.prototype, "kardex", null);
__decorate([
    (0, common_1.Get)('sin-movimiento'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('sucursalId')),
    __param(2, (0, common_1.Query)('dias')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MovimientosStockController.prototype, "sinMovimiento", null);
__decorate([
    (0, common_1.Get)('reporte-rotacion'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('sucursalId')),
    __param(2, (0, common_1.Query)('fechaDesde')),
    __param(3, (0, common_1.Query)('fechaHasta')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], MovimientosStockController.prototype, "reporteRotacion", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('sucursalId')),
    __param(2, (0, common_1.Query)('productoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MovimientosStockController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, movimiento_stock_dto_1.RegistrarMovimientoDto]),
    __metadata("design:returntype", Promise)
], MovimientosStockController.prototype, "registrar", null);
__decorate([
    (0, common_1.Post)('transferir'),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, movimiento_stock_dto_1.TransferirStockDto]),
    __metadata("design:returntype", Promise)
], MovimientosStockController.prototype, "transferir", null);
MovimientosStockController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR'),
    (0, common_1.Controller)('movimientos-stock'),
    __metadata("design:paramtypes", [movimientos_stock_service_1.MovimientosStockService])
], MovimientosStockController);
exports.MovimientosStockController = MovimientosStockController;
//# sourceMappingURL=movimientos-stock.controller.js.map