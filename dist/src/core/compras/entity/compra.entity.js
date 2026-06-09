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
exports.Compra = exports.CondicionMercancia = exports.EstadoPagoCompra = exports.EstadoCompra = exports.TipoCompra = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
exports.TipoCompra = {
    INICIAL: 'INICIAL',
    COMPRA: 'COMPRA',
};
exports.EstadoCompra = {
    EN_TRANSITO: 'EN_TRANSITO',
    PENDIENTE: 'PENDIENTE',
    FINALIZADO: 'FINALIZADO',
    ANULADA: 'ANULADA',
};
exports.EstadoPagoCompra = {
    PENDIENTE: 'PENDIENTE',
    PARCIAL: 'PARCIAL',
    PAGADO: 'PAGADO',
};
exports.CondicionMercancia = {
    BUENA: 'BUENA',
    DAÑADA: 'DAÑADA',
    PARCIAL: 'PARCIAL',
};
let Compra = class Compra extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], Compra.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Compra.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'uuid' }),
    __metadata("design:type", String)
], Compra.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'proveedor_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Compra.prototype, "proveedorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nro_compra', length: 30 }),
    __metadata("design:type", String)
], Compra.prototype, "nroCompra", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_compra', length: 20, default: exports.TipoCompra.COMPRA }),
    __metadata("design:type", String)
], Compra.prototype, "tipoCompra", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_compra', length: 20, default: exports.EstadoCompra.EN_TRANSITO }),
    __metadata("design:type", String)
], Compra.prototype, "estadoCompra", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha', type: 'date' }),
    __metadata("design:type", String)
], Compra.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nro_factura', length: 100, nullable: true }),
    __metadata("design:type", String)
], Compra.prototype, "nroFactura", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_envio', type: 'date', nullable: true }),
    __metadata("design:type", String)
], Compra.prototype, "fechaEnvio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_estimada_llegada', type: 'date', nullable: true }),
    __metadata("design:type", String)
], Compra.prototype, "fechaEstimadaLlegada", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nro_guia_remision', length: 100, nullable: true }),
    __metadata("design:type", String)
], Compra.prototype, "nroGuiaRemision", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transportista', length: 150, nullable: true }),
    __metadata("design:type", String)
], Compra.prototype, "transportista", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_recepcion', type: 'date', nullable: true }),
    __metadata("design:type", String)
], Compra.prototype, "fechaRecepcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_recepcion', nullable: true }),
    __metadata("design:type", String)
], Compra.prototype, "usuarioRecepcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'condicion_mercancia', length: 20, nullable: true }),
    __metadata("design:type", String)
], Compra.prototype, "condicionMercancia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'observaciones_recepcion', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Compra.prototype, "observacionesRecepcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_finalizacion', type: 'date', nullable: true }),
    __metadata("design:type", String)
], Compra.prototype, "fechaFinalizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_finalizacion', nullable: true }),
    __metadata("design:type", String)
], Compra.prototype, "usuarioFinalizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'observaciones_finalizacion', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Compra.prototype, "observacionesFinalizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subtotal', type: 'decimal', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Compra.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descuento', type: 'decimal', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Compra.prototype, "descuento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total', type: 'decimal', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Compra.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto_pagado', type: 'decimal', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Compra.prototype, "montoPagado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_pago', length: 20, default: exports.EstadoPagoCompra.PENDIENTE }),
    __metadata("design:type", String)
], Compra.prototype, "estadoPago", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'observaciones', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Compra.prototype, "observaciones", void 0);
Compra = __decorate([
    (0, typeorm_1.Entity)({ name: 'compra', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Compra);
exports.Compra = Compra;
//# sourceMappingURL=compra.entity.js.map