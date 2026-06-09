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
exports.Caja = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let Caja = class Caja extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], Caja.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Caja.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'uuid' }),
    __metadata("design:type", String)
], Caja.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 100 }),
    __metadata("design:type", String)
], Caja.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', length: 200, nullable: true }),
    __metadata("design:type", String)
], Caja.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Caja.prototype, "activo", void 0);
Caja = __decorate([
    (0, typeorm_1.Entity)({ name: 'caja', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Caja);
exports.Caja = Caja;
//# sourceMappingURL=caja.entity.js.map