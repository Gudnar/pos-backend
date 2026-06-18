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
exports.CompraDetalle = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let CompraDetalle = class CompraDetalle extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], CompraDetalle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], CompraDetalle.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compra_id', type: 'uuid' }),
    __metadata("design:type", String)
], CompraDetalle.prototype, "compraId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'producto_id', type: 'uuid' }),
    __metadata("design:type", String)
], CompraDetalle.prototype, "productoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unidad_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CompraDetalle.prototype, "unidadId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad', type: 'decimal', precision: 14, scale: 4 }),
    __metadata("design:type", Number)
], CompraDetalle.prototype, "cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'precio_unitario', type: 'decimal', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CompraDetalle.prototype, "precioUnitario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descuento', type: 'decimal', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CompraDetalle.prototype, "descuento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subtotal', type: 'decimal', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CompraDetalle.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_compra', type: 'decimal', precision: 14, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], CompraDetalle.prototype, "totalCompra", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'moneda', length: 10, nullable: true, default: 'BOB' }),
    __metadata("design:type", String)
], CompraDetalle.prototype, "moneda", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nro_lote', length: 100, nullable: true }),
    __metadata("design:type", String)
], CompraDetalle.prototype, "nroLote", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_vencimiento', type: 'date', nullable: true }),
    __metadata("design:type", String)
], CompraDetalle.prototype, "fechaVencimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lote_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CompraDetalle.prototype, "loteId", void 0);
CompraDetalle = __decorate([
    (0, typeorm_1.Entity)({ name: 'compra_detalle', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], CompraDetalle);
exports.CompraDetalle = CompraDetalle;
//# sourceMappingURL=compra-detalle.entity.js.map