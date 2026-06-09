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
exports.UnidadMedida = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let UnidadMedida = class UnidadMedida extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], UnidadMedida.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], UnidadMedida.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 100 }),
    __metadata("design:type", String)
], UnidadMedida.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'abreviacion', length: 20, nullable: true }),
    __metadata("design:type", String)
], UnidadMedida.prototype, "abreviacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'es_base', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], UnidadMedida.prototype, "esBase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unidad_base_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], UnidadMedida.prototype, "unidadBaseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'factor_conversion', type: 'decimal', precision: 10, scale: 4, default: 1 }),
    __metadata("design:type", Number)
], UnidadMedida.prototype, "factorConversion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], UnidadMedida.prototype, "activo", void 0);
UnidadMedida = __decorate([
    (0, typeorm_1.Entity)({ name: 'unidad_medida', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], UnidadMedida);
exports.UnidadMedida = UnidadMedida;
//# sourceMappingURL=unidad-medida.entity.js.map