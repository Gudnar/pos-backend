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
exports.ProveedoresController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const proveedores_service_1 = require("../service/proveedores.service");
const proveedor_dto_1 = require("../dto/proveedor.dto");
const representantes_service_1 = require("../../representantes/service/representantes.service");
const representante_dto_1 = require("../../representantes/dto/representante.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
const TIPO = 'PROVEEDOR';
let ProveedoresController = class ProveedoresController {
    constructor(svc, repSvc) {
        this.svc = svc;
        this.repSvc = repSvc;
    }
    clienteIdOf(req) {
        const id = req.user.clienteId ?? req.headers['x-cliente-id'] ?? null;
        if (!id)
            throw new common_1.BadRequestException('Se requiere un contexto de cliente');
        return id;
    }
    async listar(req, q) {
        const datos = await this.svc.listar(this.clienteIdOf(req), q);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async obtener(req, id) {
        const datos = await this.svc.obtener(this.clienteIdOf(req), id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async crear(req, dto) {
        const datos = await this.svc.crear(this.clienteIdOf(req), dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async actualizar(req, id, dto) {
        const datos = await this.svc.actualizar(this.clienteIdOf(req), id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
    async eliminar(req, id) {
        await this.svc.eliminar(this.clienteIdOf(req), id, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_DELETE, datos: null };
    }
    async listarReps(req, id) {
        const datos = await this.repSvc.listar(req.user.clienteId, TIPO, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async crearRep(req, id, dto) {
        const datos = await this.repSvc.crear(req.user.clienteId, TIPO, id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async actualizarRep(req, repId, dto) {
        const datos = await this.repSvc.actualizar(req.user.clienteId, repId, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
    async desactivarRep(req, repId, dto) {
        const datos = await this.repSvc.desactivar(req.user.clienteId, repId, dto, req.user.id);
        return { finalizado: true, mensaje: 'Representante dado de baja', datos };
    }
    async eliminarRep(req, repId) {
        await this.repSvc.eliminar(req.user.clienteId, repId, req.user.id);
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
], ProveedoresController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProveedoresController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, proveedor_dto_1.CreateProveedorDto]),
    __metadata("design:returntype", Promise)
], ProveedoresController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, proveedor_dto_1.UpdateProveedorDto]),
    __metadata("design:returntype", Promise)
], ProveedoresController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProveedoresController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Get)(':id/representantes'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProveedoresController.prototype, "listarReps", null);
__decorate([
    (0, common_1.Post)(':id/representantes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, representante_dto_1.CreateRepresentanteDto]),
    __metadata("design:returntype", Promise)
], ProveedoresController.prototype, "crearRep", null);
__decorate([
    (0, common_1.Put)(':id/representantes/:repId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('repId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, representante_dto_1.UpdateRepresentanteDto]),
    __metadata("design:returntype", Promise)
], ProveedoresController.prototype, "actualizarRep", null);
__decorate([
    (0, common_1.Patch)(':id/representantes/:repId/desactivar'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('repId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, representante_dto_1.DesactivarRepresentanteDto]),
    __metadata("design:returntype", Promise)
], ProveedoresController.prototype, "desactivarRep", null);
__decorate([
    (0, common_1.Delete)(':id/representantes/:repId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('repId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProveedoresController.prototype, "eliminarRep", null);
ProveedoresController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR'),
    (0, common_1.Controller)('proveedores'),
    __metadata("design:paramtypes", [proveedores_service_1.ProveedoresService,
        representantes_service_1.RepresentantesService])
], ProveedoresController);
exports.ProveedoresController = ProveedoresController;
//# sourceMappingURL=proveedores.controller.js.map