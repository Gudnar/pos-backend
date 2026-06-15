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
exports.SubcategoriasProductoController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const subcategorias_producto_service_1 = require("../service/subcategorias-producto.service");
const subcategoria_producto_dto_1 = require("../dto/subcategoria-producto.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let SubcategoriasProductoController = class SubcategoriasProductoController {
    constructor(svc) {
        this.svc = svc;
    }
    async listar(req, categoriaId, soloActivos) {
        const datos = await this.svc.listar(req.user.clienteId, categoriaId, soloActivos === 'true');
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
    async actualizar(req, id, dto) {
        const datos = await this.svc.actualizar(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
    async eliminar(req, id) {
        await this.svc.eliminar(req.user.clienteId, id, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_DELETE, datos: null };
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('categoriaId')),
    __param(2, (0, common_1.Query)('soloActivos')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], SubcategoriasProductoController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SubcategoriasProductoController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, subcategoria_producto_dto_1.CreateSubcategoriaProductoDto]),
    __metadata("design:returntype", Promise)
], SubcategoriasProductoController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, subcategoria_producto_dto_1.UpdateSubcategoriaProductoDto]),
    __metadata("design:returntype", Promise)
], SubcategoriasProductoController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SubcategoriasProductoController.prototype, "eliminar", null);
SubcategoriasProductoController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN'),
    (0, common_1.Controller)('subcategorias-producto'),
    __metadata("design:paramtypes", [subcategorias_producto_service_1.SubcategoriasProductoService])
], SubcategoriasProductoController);
exports.SubcategoriasProductoController = SubcategoriasProductoController;
//# sourceMappingURL=subcategorias-producto.controller.js.map