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
exports.Paciente = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let Paciente = class Paciente extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], Paciente.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Paciente.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 200 }),
    __metadata("design:type", String)
], Paciente.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'telefono', length: 30 }),
    __metadata("design:type", String)
], Paciente.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email', length: 150, nullable: true }),
    __metadata("design:type", String)
], Paciente.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ci', length: 30, nullable: true }),
    __metadata("design:type", String)
], Paciente.prototype, "ci", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_nacimiento', length: 10, nullable: true }),
    __metadata("design:type", String)
], Paciente.prototype, "fechaNacimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'genero', length: 1, nullable: true }),
    __metadata("design:type", String)
], Paciente.prototype, "genero", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'grupo_sanguineo', length: 5, nullable: true }),
    __metadata("design:type", String)
], Paciente.prototype, "grupoSanguineo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'direccion', length: 300, nullable: true }),
    __metadata("design:type", String)
], Paciente.prototype, "direccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alergias', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Paciente.prototype, "alergias", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enfermedades_cronicas', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Paciente.prototype, "enfermedadesCronicas", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cirugias_previas', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Paciente.prototype, "cirugiasPrevias", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'medicamentos_actuales', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Paciente.prototype, "medicamentosActuales", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'observaciones', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Paciente.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contacto_emergencia_nombre', length: 200, nullable: true }),
    __metadata("design:type", String)
], Paciente.prototype, "contactoEmergenciaNombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contacto_emergencia_telefono', length: 30, nullable: true }),
    __metadata("design:type", String)
], Paciente.prototype, "contactoEmergenciaTelefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'origen_registro', length: 20, default: 'STAFF' }),
    __metadata("design:type", String)
], Paciente.prototype, "origenRegistro", void 0);
Paciente = __decorate([
    (0, typeorm_1.Entity)({ name: 'paciente', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Paciente);
exports.Paciente = Paciente;
//# sourceMappingURL=paciente.entity.js.map