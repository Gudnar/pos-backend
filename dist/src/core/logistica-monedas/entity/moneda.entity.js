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
exports.Moneda = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let Moneda = class Moneda extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], Moneda.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Moneda.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'codigo', length: 10 }),
    __metadata("design:type", String)
], Moneda.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 100 }),
    __metadata("design:type", String)
], Moneda.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'simbolo', length: 5 }),
    __metadata("design:type", String)
], Moneda.prototype, "simbolo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'es_moneda_base', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Moneda.prototype, "esMonedaBase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Moneda.prototype, "activo", void 0);
Moneda = __decorate([
    (0, typeorm_1.Entity)({ name: 'logistica_moneda', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Moneda);
exports.Moneda = Moneda;
//# sourceMappingURL=moneda.entity.js.map