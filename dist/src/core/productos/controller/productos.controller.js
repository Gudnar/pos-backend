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
exports.ProductosController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const productos_service_1 = require("../service/productos.service");
const precios_service_1 = require("../service/precios.service");
const importexport_service_1 = require("../service/importexport.service");
const producto_dto_1 = require("../dto/producto.dto");
const precio_dto_1 = require("../dto/precio.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let ProductosController = class ProductosController {
    constructor(svc, preciosSvc, importExportSvc) {
        this.svc = svc;
        this.preciosSvc = preciosSvc;
        this.importExportSvc = importExportSvc;
    }
    async listar(req, subcategoriaId, q, soloActivos) {
        const datos = await this.svc.listar(req.user.clienteId, subcategoriaId, q, soloActivos === 'true');
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async listarParaPOS(req, q) {
        const datos = await this.svc.listarParaPOS(req.user.clienteId, q);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async exportar(req, res) {
        const buffer = await this.importExportSvc.exportar(req.user.clienteId);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="productos_${Date.now()}.xlsx"`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
    async importar(req, file) {
        if (!file)
            throw new Error('Archivo requerido');
        const datos = await this.importExportSvc.importar(req.user.clienteId, req.user.id, file.buffer);
        return { finalizado: true, mensaje: `${datos.importados} producto(s) importados`, datos };
    }
    async obtener(req, id) {
        const datos = await this.svc.obtener(req.user.clienteId, id);
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
    async listarPrecios(req, id) {
        const datos = await this.preciosSvc.listarPrecios(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async agregarPrecio(req, id, dto) {
        const datos = await this.preciosSvc.agregarEscalaPrecio(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async listarPromociones(req, id) {
        const datos = await this.preciosSvc.listarPromociones(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async crearPromocion(req, id, dto) {
        const datos = await this.preciosSvc.crearPromocion(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async actualizarPromocion(req, promoId, dto) {
        const datos = await this.preciosSvc.actualizarPromocion(req.user.clienteId, promoId, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
    async togglePromocion(req, promoId) {
        const datos = await this.preciosSvc.togglePromocion(req.user.clienteId, promoId, req.user.id);
        return { finalizado: true, mensaje: 'Promoción actualizada', datos };
    }
    async eliminarPromocion(req, promoId) {
        await this.preciosSvc.eliminarPromocion(req.user.clienteId, promoId, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_DELETE, datos: null };
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('subcategoriaId')),
    __param(2, (0, common_1.Query)('q')),
    __param(3, (0, common_1.Query)('soloActivos')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('pos'),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "listarParaPOS", null);
__decorate([
    (0, common_1.Get)('exportar'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "exportar", null);
__decorate([
    (0, common_1.Post)('importar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "importar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, producto_dto_1.CreateProductoDto]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, producto_dto_1.UpdateProductoDto]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Get)(':id/precios'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "listarPrecios", null);
__decorate([
    (0, common_1.Post)(':id/precios'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, precio_dto_1.CreatePrecioProductoDto]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "agregarPrecio", null);
__decorate([
    (0, common_1.Get)(':id/promociones'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "listarPromociones", null);
__decorate([
    (0, common_1.Post)(':id/promociones'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, precio_dto_1.CreatePrecioPromocionalDto]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "crearPromocion", null);
__decorate([
    (0, common_1.Put)(':id/promociones/:promoId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('promoId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, precio_dto_1.UpdatePrecioPromocionalDto]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "actualizarPromocion", null);
__decorate([
    (0, common_1.Patch)(':id/promociones/:promoId/toggle'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('promoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "togglePromocion", null);
__decorate([
    (0, common_1.Delete)(':id/promociones/:promoId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('promoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductosController.prototype, "eliminarPromocion", null);
ProductosController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN'),
    (0, common_1.Controller)('productos'),
    __metadata("design:paramtypes", [productos_service_1.ProductosService,
        precios_service_1.PreciosService,
        importexport_service_1.ImportExportService])
], ProductosController);
exports.ProductosController = ProductosController;
//# sourceMappingURL=productos.controller.js.map