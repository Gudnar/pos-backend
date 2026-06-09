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
exports.CampanaController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const campana_service_1 = require("../service/campana.service");
const campana_dto_1 = require("../dto/campana.dto");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let CampanaController = class CampanaController {
    constructor(svc) {
        this.svc = svc;
    }
    async listar(req) {
        const datos = await this.svc.listar(req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crear(req, dto) {
        const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, response_messages_1.Messages.SUCCESS_CREATE);
    }
    async actualizar(req, id, dto) {
        const datos = await this.svc.actualizar(id, req.user.clienteId, dto, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, response_messages_1.Messages.SUCCESS_UPDATE);
    }
    async eliminar(req, id) {
        await this.svc.eliminar(id, req.user.clienteId, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, response_messages_1.Messages.SUCCESS_DELETE);
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CampanaController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, campana_dto_1.CreateCampanaDto]),
    __metadata("design:returntype", Promise)
], CampanaController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, campana_dto_1.UpdateCampanaDto]),
    __metadata("design:returntype", Promise)
], CampanaController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CampanaController.prototype, "eliminar", null);
CampanaController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN'),
    (0, common_1.Controller)('campanas'),
    __metadata("design:paramtypes", [campana_service_1.CampanaService])
], CampanaController);
exports.CampanaController = CampanaController;
//# sourceMappingURL=campana.controller.js.map