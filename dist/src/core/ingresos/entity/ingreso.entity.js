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
exports.Ingreso = exports.EstadoIngreso = exports.CategoriaIngreso = exports.TipoIngreso = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
exports.TipoIngreso = {
    ADELANTO: 'ADELANTO',
    CAMBIO: 'CAMBIO',
    PAGO_SERVICIO: 'PAGO_SERVICIO',
    SUELDO: 'SUELDO',
};
exports.CategoriaIngreso = {
    PERSONAL: 'PERSONAL',
    TRABAJO: 'TRABAJO',
};
exports.EstadoIngreso = {
    DISPONIBLE: 'DISPONIBLE',
    PARCIAL: 'PARCIAL',
    UTILIZADO: 'UTILIZADO',
    ANULADO: 'ANULADO',
};
let Ingreso = class Ingreso extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], Ingreso.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Ingreso.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Ingreso.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo', length: 20 }),
    __metadata("design:type", String)
], Ingreso.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'categoria', length: 20 }),
    __metadata("design:type", String)
], Ingreso.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto', type: 'decimal', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], Ingreso.prototype, "monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto_disponible', type: 'decimal', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Ingreso.prototype, "montoDisponible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_ingreso', length: 20, default: exports.EstadoIngreso.DISPONIBLE }),
    __metadata("design:type", String)
], Ingreso.prototype, "estadoIngreso", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha', type: 'date' }),
    __metadata("design:type", String)
], Ingreso.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Ingreso.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'referencia', length: 100, nullable: true }),
    __metadata("design:type", String)
], Ingreso.prototype, "referencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contacto_cliente_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Ingreso.prototype, "contactoClienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre_contacto', length: 200, nullable: true }),
    __metadata("design:type", String)
], Ingreso.prototype, "nombreContacto", void 0);
Ingreso = __decorate([
    (0, typeorm_1.Entity)({ name: 'ingreso', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Ingreso);
exports.Ingreso = Ingreso;
//# sourceMappingURL=ingreso.entity.js.map