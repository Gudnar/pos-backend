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
exports.ItemOrdenImportacion = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let ItemOrdenImportacion = class ItemOrdenImportacion extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], ItemOrdenImportacion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], ItemOrdenImportacion.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'orden_importacion_id', type: 'uuid' }),
    __metadata("design:type", String)
], ItemOrdenImportacion.prototype, "ordenImportacionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'producto_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ItemOrdenImportacion.prototype, "productoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion_producto', length: 300 }),
    __metadata("design:type", String)
], ItemOrdenImportacion.prototype, "descripcionProducto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad_unidades', type: 'int' }),
    __metadata("design:type", Number)
], ItemOrdenImportacion.prototype, "cantidadUnidades", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'precio_unitario_moneda_compra', type: 'decimal', precision: 15, scale: 4 }),
    __metadata("design:type", Number)
], ItemOrdenImportacion.prototype, "precioUnitarioMonedaCompra", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_cambio', type: 'decimal', precision: 15, scale: 6 }),
    __metadata("design:type", Number)
], ItemOrdenImportacion.prototype, "tipoCambio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'moneda_compra_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ItemOrdenImportacion.prototype, "monedaCompraId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'precio_unitario_moneda_base', type: 'decimal', precision: 15, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], ItemOrdenImportacion.prototype, "precioUnitarioMonedaBase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subtotal_moneda_compra', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ItemOrdenImportacion.prototype, "subtotalMonedaCompra", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subtotal_moneda_base', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ItemOrdenImportacion.prototype, "subtotalMonedaBase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'costo_logistica_asignado', type: 'decimal', precision: 15, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], ItemOrdenImportacion.prototype, "costoLogisticaAsignado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'costo_total_unitario', type: 'decimal', precision: 15, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], ItemOrdenImportacion.prototype, "costoTotalUnitario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'margen_aplicado', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ItemOrdenImportacion.prototype, "margenAplicado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'precio_venta_sugerido', type: 'decimal', precision: 15, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], ItemOrdenImportacion.prototype, "precioVentaSugerido", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'precio_venta_manual', type: 'decimal', precision: 15, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], ItemOrdenImportacion.prototype, "precioVentaManual", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'precio_venta_con_iva', type: 'decimal', precision: 15, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], ItemOrdenImportacion.prototype, "precioVentaConIva", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'utilidad_tonelada', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ItemOrdenImportacion.prototype, "utilidadTonelada", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'utilidad_tonelada_con_iva', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ItemOrdenImportacion.prototype, "utilidadToneladaConIva", void 0);
ItemOrdenImportacion = __decorate([
    (0, typeorm_1.Entity)({ name: 'logistica_item_orden', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], ItemOrdenImportacion);
exports.ItemOrdenImportacion = ItemOrdenImportacion;
//# sourceMappingURL=item-orden-importacion.entity.js.map