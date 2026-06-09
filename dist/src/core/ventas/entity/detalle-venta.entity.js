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
exports.DetalleVenta = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let DetalleVenta = class DetalleVenta extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], DetalleVenta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], DetalleVenta.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'venta_id', type: 'uuid' }),
    __metadata("design:type", String)
], DetalleVenta.prototype, "ventaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'producto_id', type: 'uuid' }),
    __metadata("design:type", String)
], DetalleVenta.prototype, "productoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lote_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DetalleVenta.prototype, "loteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre_producto', length: 200 }),
    __metadata("design:type", String)
], DetalleVenta.prototype, "nombreProducto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad', type: 'decimal', precision: 14, scale: 4 }),
    __metadata("design:type", Number)
], DetalleVenta.prototype, "cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'precio_unitario', type: 'decimal', precision: 14, scale: 4 }),
    __metadata("design:type", Number)
], DetalleVenta.prototype, "precioUnitario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descuento', type: 'decimal', precision: 14, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], DetalleVenta.prototype, "descuento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subtotal', type: 'decimal', precision: 14, scale: 4 }),
    __metadata("design:type", Number)
], DetalleVenta.prototype, "subtotal", void 0);
DetalleVenta = __decorate([
    (0, typeorm_1.Entity)({ name: 'detalle_venta', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], DetalleVenta);
exports.DetalleVenta = DetalleVenta;
//# sourceMappingURL=detalle-venta.entity.js.map