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
exports.Proveedor = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let Proveedor = class Proveedor extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], Proveedor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Proveedor.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 200 }),
    __metadata("design:type", String)
], Proveedor.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'empresa', length: 200, nullable: true }),
    __metadata("design:type", String)
], Proveedor.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nit', length: 50, nullable: true }),
    __metadata("design:type", String)
], Proveedor.prototype, "nit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'categoria', length: 100, nullable: true }),
    __metadata("design:type", String)
], Proveedor.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'direccion', length: 300, nullable: true }),
    __metadata("design:type", String)
], Proveedor.prototype, "direccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notas', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Proveedor.prototype, "notas", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'color', length: 20, nullable: true, default: '#6366f1' }),
    __metadata("design:type", String)
], Proveedor.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Proveedor.prototype, "activo", void 0);
Proveedor = __decorate([
    (0, typeorm_1.Entity)({ name: 'proveedor', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Proveedor);
exports.Proveedor = Proveedor;
//# sourceMappingURL=proveedor.entity.js.map