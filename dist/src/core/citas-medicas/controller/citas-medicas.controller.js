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
exports.CitasMedicasController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const citas_medicas_service_1 = require("../service/citas-medicas.service");
const cita_dto_1 = require("../dto/cita.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let CitasMedicasController = class CitasMedicasController {
    constructor(svc) {
        this.svc = svc;
    }
    async buscarPacientes(req, q) {
        const datos = await this.svc.buscarPacientes(req.user.clienteId, q || '');
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async crearPaciente(req, dto) {
        const datos = await this.svc.crearPaciente(req.user.clienteId, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async estadisticas(req, desde, hasta) {
        const datos = await this.svc.estadisticasConsultas(req.user.clienteId, desde, hasta);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async listar(req, fecha, especialistaId) {
        const datos = await this.svc.listar(req.user.clienteId, fecha, especialistaId);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async disponibilidad(req, fecha, especialistaId) {
        const datos = await this.svc.disponibilidad(req.user.clienteId, fecha, especialistaId);
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
    (0, common_1.Get)('pacientes'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CitasMedicasController.prototype, "buscarPacientes", null);
__decorate([
    (0, common_1.Post)('pacientes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, cita_dto_1.CreatePacienteDto]),
    __metadata("design:returntype", Promise)
], CitasMedicasController.prototype, "crearPaciente", null);
__decorate([
    (0, common_1.Get)('estadisticas'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('desde')),
    __param(2, (0, common_1.Query)('hasta')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CitasMedicasController.prototype, "estadisticas", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('fecha')),
    __param(2, (0, common_1.Query)('especialistaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CitasMedicasController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('disponibilidad'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('fecha')),
    __param(2, (0, common_1.Query)('especialistaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CitasMedicasController.prototype, "disponibilidad", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, cita_dto_1.CreateCitaDto]),
    __metadata("design:returntype", Promise)
], CitasMedicasController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, cita_dto_1.UpdateCitaDto]),
    __metadata("design:returntype", Promise)
], CitasMedicasController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CitasMedicasController.prototype, "eliminar", null);
CitasMedicasController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN'),
    (0, common_1.Controller)('citas-medicas'),
    __metadata("design:paramtypes", [citas_medicas_service_1.CitasMedicasService])
], CitasMedicasController);
exports.CitasMedicasController = CitasMedicasController;
//# sourceMappingURL=citas-medicas.controller.js.map