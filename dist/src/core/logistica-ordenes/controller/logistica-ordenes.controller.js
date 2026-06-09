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
exports.LogisticaOrdenesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const ordenes_importacion_service_1 = require("../service/ordenes-importacion.service");
const items_orden_service_1 = require("../service/items-orden.service");
const pagos_proveedor_service_1 = require("../service/pagos-proveedor.service");
const gastos_logistica_service_1 = require("../service/gastos-logistica.service");
const orden_importacion_dto_1 = require("../dto/orden-importacion.dto");
const item_orden_dto_1 = require("../dto/item-orden.dto");
const pago_proveedor_dto_1 = require("../dto/pago-proveedor.dto");
const gasto_logistica_dto_1 = require("../dto/gasto-logistica.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let LogisticaOrdenesController = class LogisticaOrdenesController {
    constructor(ordenesSvc, itemsSvc, pagosSvc, gastosSvc) {
        this.ordenesSvc = ordenesSvc;
        this.itemsSvc = itemsSvc;
        this.pagosSvc = pagosSvc;
        this.gastosSvc = gastosSvc;
    }
    async listar(req, q) {
        const datos = await this.ordenesSvc.listar(req.user.clienteId, q);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async trazabilidad(req, id) {
        const datos = await this.ordenesSvc.trazabilidad(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async obtener(req, id) {
        const datos = await this.ordenesSvc.obtenerDetalle(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async crear(req, dto) {
        const datos = await this.ordenesSvc.crear(req.user.clienteId, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async actualizar(req, id, dto) {
        const datos = await this.ordenesSvc.actualizar(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
    async eliminar(req, id) {
        await this.ordenesSvc.eliminar(req.user.clienteId, id, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_DELETE, datos: null };
    }
    async calcular(req, id) {
        const datos = await this.ordenesSvc.calcularCostos(req.user.clienteId, id, req.user.id);
        return { finalizado: true, mensaje: 'Costos calculados correctamente.', datos };
    }
    async proponerPrecios(req, id, dto) {
        const datos = await this.ordenesSvc.proponerPrecios(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: 'Precios LOGÍSTICA asignados correctamente.', datos };
    }
    async cerrar(req, id, dto) {
        const datos = await this.ordenesSvc.cerrarOrden(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: 'Orden cerrada y precios propuestos.', datos };
    }
    async listarItems(req, id) {
        const datos = await this.itemsSvc.listar(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async crearItem(req, id, dto) {
        const datos = await this.itemsSvc.crear(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async actualizarItem(req, id, itemId, dto) {
        const datos = await this.itemsSvc.actualizar(req.user.clienteId, id, itemId, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
    async eliminarItem(req, id, itemId) {
        await this.itemsSvc.eliminar(req.user.clienteId, id, itemId, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_DELETE, datos: null };
    }
    async listarPagos(req, id) {
        const datos = await this.pagosSvc.listar(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async crearPago(req, id, dto) {
        const datos = await this.pagosSvc.crear(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async actualizarPago(req, id, pagoId, dto) {
        const datos = await this.pagosSvc.actualizar(req.user.clienteId, id, pagoId, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
    async eliminarPago(req, id, pagoId) {
        await this.pagosSvc.eliminar(req.user.clienteId, id, pagoId, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_DELETE, datos: null };
    }
    async listarGastos(req, id) {
        const datos = await this.gastosSvc.listar(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async crearGasto(req, id, dto) {
        const datos = await this.gastosSvc.crear(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async actualizarGasto(req, id, gastoId, dto) {
        const datos = await this.gastosSvc.actualizar(req.user.clienteId, id, gastoId, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
    async eliminarGasto(req, id, gastoId) {
        await this.gastosSvc.eliminar(req.user.clienteId, id, gastoId, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_DELETE, datos: null };
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id/trazabilidad'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "trazabilidad", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, orden_importacion_dto_1.CreateOrdenImportacionDto]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, orden_importacion_dto_1.UpdateOrdenImportacionDto]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Post)(':id/calcular'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "calcular", null);
__decorate([
    (0, common_1.Post)(':id/proponer-precios'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, orden_importacion_dto_1.ProponerPreciosDto]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "proponerPrecios", null);
__decorate([
    (0, common_1.Post)(':id/cerrar'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, orden_importacion_dto_1.CerrarOrdenDto]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "cerrar", null);
__decorate([
    (0, common_1.Get)(':id/items'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "listarItems", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, item_orden_dto_1.CreateItemOrdenDto]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "crearItem", null);
__decorate([
    (0, common_1.Put)(':id/items/:itemId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, item_orden_dto_1.UpdateItemOrdenDto]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "actualizarItem", null);
__decorate([
    (0, common_1.Delete)(':id/items/:itemId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "eliminarItem", null);
__decorate([
    (0, common_1.Get)(':id/pagos'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "listarPagos", null);
__decorate([
    (0, common_1.Post)(':id/pagos'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, pago_proveedor_dto_1.CreatePagoProveedorDto]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "crearPago", null);
__decorate([
    (0, common_1.Put)(':id/pagos/:pagoId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('pagoId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, pago_proveedor_dto_1.UpdatePagoProveedorDto]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "actualizarPago", null);
__decorate([
    (0, common_1.Delete)(':id/pagos/:pagoId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('pagoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "eliminarPago", null);
__decorate([
    (0, common_1.Get)(':id/gastos'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "listarGastos", null);
__decorate([
    (0, common_1.Post)(':id/gastos'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, gasto_logistica_dto_1.CreateGastoLogisticaDto]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "crearGasto", null);
__decorate([
    (0, common_1.Put)(':id/gastos/:gastoId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('gastoId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, gasto_logistica_dto_1.UpdateGastoLogisticaDto]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "actualizarGasto", null);
__decorate([
    (0, common_1.Delete)(':id/gastos/:gastoId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('gastoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LogisticaOrdenesController.prototype, "eliminarGasto", null);
LogisticaOrdenesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN'),
    (0, common_1.Controller)('logistica-ordenes'),
    __metadata("design:paramtypes", [ordenes_importacion_service_1.OrdenesImportacionService,
        items_orden_service_1.ItemsOrdenService,
        pagos_proveedor_service_1.PagosProveedorService,
        gastos_logistica_service_1.GastosLogisticaService])
], LogisticaOrdenesController);
exports.LogisticaOrdenesController = LogisticaOrdenesController;
//# sourceMappingURL=logistica-ordenes.controller.js.map