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
exports.Representante = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let Representante = class Representante extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], Representante.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Representante.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo', length: 20 }),
    __metadata("design:type", String)
], Representante.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entidad_id', type: 'uuid' }),
    __metadata("design:type", String)
], Representante.prototype, "entidadId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 200 }),
    __metadata("design:type", String)
], Representante.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cargo', length: 150, nullable: true }),
    __metadata("design:type", String)
], Representante.prototype, "cargo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'telefono', length: 30, nullable: true }),
    __metadata("design:type", String)
], Representante.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email', length: 150, nullable: true }),
    __metadata("design:type", String)
], Representante.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Representante.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_inicio', length: 10, nullable: true }),
    __metadata("design:type", String)
], Representante.prototype, "fechaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_fin', length: 10, nullable: true }),
    __metadata("design:type", String)
], Representante.prototype, "fechaFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motivo_cambio', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Representante.prototype, "motivoCambio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notas', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Representante.prototype, "notas", void 0);
Representante = __decorate([
    (0, typeorm_1.Entity)({ name: 'representante', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Representante);
exports.Representante = Representante;
//# sourceMappingURL=representante.entity.js.map