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
exports.OrdenImportacion = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let OrdenImportacion = class OrdenImportacion extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], OrdenImportacion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], OrdenImportacion.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero', length: 50 }),
    __metadata("design:type", String)
], OrdenImportacion.prototype, "numero", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pais_origen', length: 100 }),
    __metadata("design:type", String)
], OrdenImportacion.prototype, "paisOrigen", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'proveedor_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], OrdenImportacion.prototype, "proveedorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'moneda_compra_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], OrdenImportacion.prototype, "monedaCompraId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_orden', type: 'date' }),
    __metadata("design:type", String)
], OrdenImportacion.prototype, "fechaOrden", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_estimada_llegada', type: 'date', nullable: true }),
    __metadata("design:type", String)
], OrdenImportacion.prototype, "fechaEstimadaLlegada", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_llegada_real', type: 'date', nullable: true }),
    __metadata("design:type", String)
], OrdenImportacion.prototype, "fechaLlegadaReal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metodo_distribucion', length: 20, default: 'POR_VALOR' }),
    __metadata("design:type", String)
], OrdenImportacion.prototype, "metodoDistribucion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado', length: 20, default: 'BORRADOR' }),
    __metadata("design:type", String)
], OrdenImportacion.prototype, "estadoOrden", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'observaciones', type: 'text', nullable: true }),
    __metadata("design:type", String)
], OrdenImportacion.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_productos_moneda_compra', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], OrdenImportacion.prototype, "totalProductosMonedaCompra", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_productos_moneda_base', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], OrdenImportacion.prototype, "totalProductosMonedaBase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_gastos_moneda_base', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], OrdenImportacion.prototype, "totalGastosMonedaBase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'costo_total_moneda_base', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], OrdenImportacion.prototype, "costoTotalMonedaBase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unidades_totales', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], OrdenImportacion.prototype, "unidadesTotales", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tasa_iva', type: 'decimal', precision: 5, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], OrdenImportacion.prototype, "tasaIva", void 0);
OrdenImportacion = __decorate([
    (0, typeorm_1.Entity)({ name: 'logistica_orden_importacion', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], OrdenImportacion);
exports.OrdenImportacion = OrdenImportacion;
//# sourceMappingURL=orden-importacion.entity.js.map