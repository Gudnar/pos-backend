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
exports.Consulta = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let Consulta = class Consulta extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], Consulta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Consulta.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paciente_id', type: 'uuid' }),
    __metadata("design:type", String)
], Consulta.prototype, "pacienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cita_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Consulta.prototype, "citaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha', length: 10 }),
    __metadata("design:type", String)
], Consulta.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'servicio', length: 200, nullable: true }),
    __metadata("design:type", String)
], Consulta.prototype, "servicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'diagnostico', type: 'text' }),
    __metadata("design:type", String)
], Consulta.prototype, "diagnostico", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tratamiento', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Consulta.prototype, "tratamiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medicamentos', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Consulta.prototype, "medicamentos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'observaciones', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Consulta.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'proxima_cita', length: 10, nullable: true }),
    __metadata("design:type", String)
], Consulta.prototype, "proximaCita", void 0);
Consulta = __decorate([
    (0, typeorm_1.Entity)({ name: 'consulta', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Consulta);
exports.Consulta = Consulta;
//# sourceMappingURL=consulta.entity.js.map