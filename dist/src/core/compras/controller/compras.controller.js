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
exports.ComprasController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const compras_service_1 = require("../service/compras.service");
const compra_dto_1 = require("../dto/compra.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let ComprasController = class ComprasController {
    constructor(svc) {
        this.svc = svc;
    }
    async listar(req, tipo, estado, proveedorId, fechaDesde, fechaHasta) {
        const datos = await this.svc.listar(req.user.clienteId, { tipo, estado, proveedorId, fechaDesde, fechaHasta });
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async resumenPagosProveedores(req) {
        const datos = await this.svc.resumenPagosProveedores(req.user.clienteId);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async historialPagos(req, proveedorId, fechaDesde, fechaHasta) {
        const datos = await this.svc.historialPagos(req.user.clienteId, { proveedorId, fechaDesde, fechaHasta });
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async exportarExcel(req, res, tipo, estado, proveedorId, fechaDesde, fechaHasta) {
        const buffer = await this.svc.exportarExcel(req.user.clienteId, { tipo, estado, proveedorId, fechaDesde, fechaHasta });
        const filename = `ordenes-compra-${new Date().toISOString().split('T')[0]}.xlsx`;
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}"`,
        });
        return new common_1.StreamableFile(Buffer.from(buffer));
    }
    async exportarPdf(req, id, res) {
        const buffer = await this.svc.generarPdf(req.user.clienteId, id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="orden-${id}.pdf"`,
        });
        return new common_1.StreamableFile(Buffer.from(buffer));
    }
    async obtener(req, id) {
        const datos = await this.svc.obtener(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async obtenerLogs(req, id) {
        const datos = await this.svc.obtenerLogs(req.user.clienteId, id);
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
    async editarOrden(req, id, dto) {
        const datos = await this.svc.editarOrden(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
    async editarIngreso(req, id, dto) {
        const datos = await this.svc.editarIngreso(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
    async eliminarIngreso(req, id) {
        await this.svc.eliminarIngreso(req.user.clienteId, id, req.user.id);
        return { finalizado: true, mensaje: 'Ingreso eliminado', datos: null };
    }
    async anular(req, id, dto) {
        await this.svc.anular(req.user.clienteId, id, dto.motivo, req.user.id);
        return { finalizado: true, mensaje: 'Compra anulada', datos: null };
    }
    async marcarPendiente(req, id, dto) {
        const datos = await this.svc.marcarPendiente(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: 'Compra marcada como recibida en almacén', datos };
    }
    async finalizar(req, id, dto) {
        const datos = await this.svc.finalizar(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: 'Compra finalizada. Inventario actualizado.', datos };
    }
    async listarPagos(req, id) {
        const datos = await this.svc.listarPagos(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async registrarPago(req, id, dto) {
        const datos = await this.svc.registrarPago(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: 'Pago registrado', datos };
    }
    async eliminarPago(req, id, pagoId) {
        await this.svc.eliminarPago(req.user.clienteId, id, pagoId, req.user.id);
        return { finalizado: true, mensaje: 'Pago eliminado', datos: null };
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('tipo')),
    __param(2, (0, common_1.Query)('estado')),
    __param(3, (0, common_1.Query)('proveedorId')),
    __param(4, (0, common_1.Query)('fechaDesde')),
    __param(5, (0, common_1.Query)('fechaHasta')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('pagos/resumen-proveedores'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "resumenPagosProveedores", null);
__decorate([
    (0, common_1.Get)('pagos/historial'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('proveedorId')),
    __param(2, (0, common_1.Query)('fechaDesde')),
    __param(3, (0, common_1.Query)('fechaHasta')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "historialPagos", null);
__decorate([
    (0, common_1.Get)('reporte/excel'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Query)('tipo')),
    __param(3, (0, common_1.Query)('estado')),
    __param(4, (0, common_1.Query)('proveedorId')),
    __param(5, (0, common_1.Query)('fechaDesde')),
    __param(6, (0, common_1.Query)('fechaHasta')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "exportarExcel", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "exportarPdf", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "obtener", null);
__decorate([
    (0, common_1.Get)(':id/logs'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "obtenerLogs", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, compra_dto_1.CreateCompraDto]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, compra_dto_1.UpdateCompraDto]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Put)(':id/editar'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, compra_dto_1.EditarOrdenDto]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "editarOrden", null);
__decorate([
    (0, common_1.Put)(':id/ingreso'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, compra_dto_1.UpdateIngresoDto]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "editarIngreso", null);
__decorate([
    (0, common_1.Delete)(':id/ingreso'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "eliminarIngreso", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, compra_dto_1.AnularCompraDto]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "anular", null);
__decorate([
    (0, common_1.Post)(':id/recibir'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, compra_dto_1.MarcarPendienteDto]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "marcarPendiente", null);
__decorate([
    (0, common_1.Post)(':id/finalizar'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, compra_dto_1.FinalizarCompraDto]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "finalizar", null);
__decorate([
    (0, common_1.Get)(':id/pagos'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "listarPagos", null);
__decorate([
    (0, common_1.Post)(':id/pagos'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, compra_dto_1.CreatePagoProveedorDto]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "registrarPago", null);
__decorate([
    (0, common_1.Delete)(':id/pagos/:pagoId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('pagoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ComprasController.prototype, "eliminarPago", null);
ComprasController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN'),
    (0, common_1.Controller)('compras'),
    __metadata("design:paramtypes", [compras_service_1.ComprasService])
], ComprasController);
exports.ComprasController = ComprasController;
//# sourceMappingURL=compras.controller.js.map