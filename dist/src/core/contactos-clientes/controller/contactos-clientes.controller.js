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
exports.ContactosClientesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const contactos_clientes_service_1 = require("../service/contactos-clientes.service");
const contacto_cliente_dto_1 = require("../dto/contacto-cliente.dto");
const representantes_service_1 = require("../../representantes/service/representantes.service");
const representante_dto_1 = require("../../representantes/dto/representante.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
const TIPO = 'CLIENTE';
let ContactosClientesController = class ContactosClientesController {
    constructor(svc, repSvc) {
        this.svc = svc;
        this.repSvc = repSvc;
    }
    async listar(req, q) {
        const datos = await this.svc.listar(req.user.clienteId, q);
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
], ContactosClientesController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContactosClientesController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, contacto_cliente_dto_1.CreateContactoClienteDto]),
    __metadata("design:returntype", Promise)
], ContactosClientesController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, contacto_cliente_dto_1.UpdateContactoClienteDto]),
    __metadata("design:returntype", Promise)
], ContactosClientesController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContactosClientesController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Get)(':id/representantes'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContactosClientesController.prototype, "listarReps", null);
__decorate([
    (0, common_1.Post)(':id/representantes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, representante_dto_1.CreateRepresentanteDto]),
    __metadata("design:returntype", Promise)
], ContactosClientesController.prototype, "crearRep", null);
__decorate([
    (0, common_1.Put)(':id/representantes/:repId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('repId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, representante_dto_1.UpdateRepresentanteDto]),
    __metadata("design:returntype", Promise)
], ContactosClientesController.prototype, "actualizarRep", null);
__decorate([
    (0, common_1.Patch)(':id/representantes/:repId/desactivar'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('repId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, representante_dto_1.DesactivarRepresentanteDto]),
    __metadata("design:returntype", Promise)
], ContactosClientesController.prototype, "desactivarRep", null);
__decorate([
    (0, common_1.Delete)(':id/representantes/:repId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('repId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContactosClientesController.prototype, "eliminarRep", null);
ContactosClientesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR'),
    (0, common_1.Controller)('contactos-clientes'),
    __metadata("design:paramtypes", [contactos_clientes_service_1.ContactosClientesService,
        representantes_service_1.RepresentantesService])
], ContactosClientesController);
exports.ContactosClientesController = ContactosClientesController;
//# sourceMappingURL=contactos-clientes.controller.js.map