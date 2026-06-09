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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cita = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let Cita = class Cita extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], Cita.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Cita.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha', length: 10 }),
    __metadata("design:type", String)
], Cita.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hora_inicio', length: 5 }),
    __metadata("design:type", String)
], Cita.prototype, "horaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hora_fin', length: 5 }),
    __metadata("design:type", String)
], Cita.prototype, "horaFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'servicio', length: 200 }),
    __metadata("design:type", String)
], Cita.prototype, "servicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paciente_nombre', length: 200 }),
    __metadata("design:type", String)
], Cita.prototype, "pacienteNombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paciente_telefono', length: 30 }),
    __metadata("design:type", String)
], Cita.prototype, "pacienteTelefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paciente_email', length: 150, nullable: true }),
    __metadata("design:type", String)
], Cita.prototype, "pacienteEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notas', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Cita.prototype, "notas", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_cita', length: 20, default: 'PENDIENTE' }),
    __metadata("design:type", String)
], Cita.prototype, "estadoCita", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'origen_registro', length: 20, default: 'STAFF' }),
    __metadata("design:type", String)
], Cita.prototype, "origenRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agente_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], Cita.prototype, "agenteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'especialista_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], Cita.prototype, "especialistaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'especialista_nombre', length: 200, nullable: true }),
    __metadata("design:type", String)
], Cita.prototype, "especialistaNombre", void 0);
Cita = __decorate([
    (0, typeorm_1.Entity)({ name: 'cita', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Cita);
exports.Cita = Cita;
//# sourceMappingURL=cita.entity.js.map