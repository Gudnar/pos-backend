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
exports.Sucursal = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let Sucursal = class Sucursal extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], Sucursal.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Sucursal.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 200 }),
    __metadata("design:type", String)
], Sucursal.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'codigo', length: 20, nullable: true }),
    __metadata("design:type", String)
], Sucursal.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'direccion', length: 300, nullable: true }),
    __metadata("design:type", String)
], Sucursal.prototype, "direccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ciudad', length: 100, nullable: true }),
    __metadata("design:type", String)
], Sucursal.prototype, "ciudad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'telefono', length: 50, nullable: true }),
    __metadata("design:type", String)
], Sucursal.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email', length: 150, nullable: true }),
    __metadata("design:type", String)
], Sucursal.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'es_principal', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Sucursal.prototype, "esPrincipal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Sucursal.prototype, "activo", void 0);
Sucursal = __decorate([
    (0, typeorm_1.Entity)({ name: 'sucursal', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Sucursal);
exports.Sucursal = Sucursal;
//# sourceMappingURL=sucursal.entity.js.map