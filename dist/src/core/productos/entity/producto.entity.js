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
exports.Producto = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let Producto = class Producto extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], Producto.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Producto.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subcategoria_id', type: 'uuid' }),
    __metadata("design:type", String)
], Producto.prototype, "subcategoriaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 200 }),
    __metadata("design:type", String)
], Producto.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Producto.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'codigo_proveedor', length: 100, nullable: true }),
    __metadata("design:type", String)
], Producto.prototype, "codigoProveedor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'codigo_barras', length: 100, nullable: true }),
    __metadata("design:type", String)
], Producto.prototype, "codigoBarras", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'codigo_tienda', length: 100, nullable: true }),
    __metadata("design:type", String)
], Producto.prototype, "codigoTienda", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unidad_medida', length: 50, nullable: true, default: 'UNIDAD' }),
    __metadata("design:type", String)
], Producto.prototype, "unidadMedida", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unidad_base_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Producto.prototype, "unidadBaseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Producto.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requiere_lote', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Producto.prototype, "requiereLote", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metodo_picking', length: 10, default: 'FEFO' }),
    __metadata("design:type", String)
], Producto.prototype, "metodoPicking", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alerta_vencimiento_dias', type: 'int', default: 30 }),
    __metadata("design:type", Number)
], Producto.prototype, "alertaVencimientoDias", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'porcentaje_factura', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Producto.prototype, "porcentajeFactura", void 0);
Producto = __decorate([
    (0, typeorm_1.Entity)({ name: 'producto', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Producto);
exports.Producto = Producto;
//# sourceMappingURL=producto.entity.js.map