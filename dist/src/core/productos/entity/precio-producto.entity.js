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
exports.PrecioProducto = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let PrecioProducto = class PrecioProducto extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], PrecioProducto.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], PrecioProducto.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'producto_id', type: 'uuid' }),
    __metadata("design:type", String)
], PrecioProducto.prototype, "productoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo', length: 30, default: 'VENTA' }),
    __metadata("design:type", String)
], PrecioProducto.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'precio', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PrecioProducto.prototype, "precio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'moneda', length: 10, default: 'BOB' }),
    __metadata("design:type", String)
], PrecioProducto.prototype, "moneda", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_vigencia', type: 'date', nullable: true }),
    __metadata("design:type", String)
], PrecioProducto.prototype, "fechaVigencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_fin', type: 'date', nullable: true }),
    __metadata("design:type", String)
], PrecioProducto.prototype, "fechaFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unidad_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PrecioProducto.prototype, "unidadId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad_min', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PrecioProducto.prototype, "cantidadMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad_max', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], PrecioProducto.prototype, "cantidadMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PrecioProducto.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notas', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PrecioProducto.prototype, "notas", void 0);
PrecioProducto = __decorate([
    (0, typeorm_1.Entity)({ name: 'precio_producto', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], PrecioProducto);
exports.PrecioProducto = PrecioProducto;
//# sourceMappingURL=precio-producto.entity.js.map