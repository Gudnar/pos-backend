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
exports.Venta = exports.MetodoPago = exports.EstadoVenta = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
exports.EstadoVenta = {
    PENDIENTE: 'PENDIENTE',
    PAGADA: 'PAGADA',
    ANULADA: 'ANULADA',
};
exports.MetodoPago = {
    EFECTIVO: 'EFECTIVO',
    TARJETA: 'TARJETA',
    QR: 'QR',
    TRANSFERENCIA: 'TRANSFERENCIA',
    CREDITO: 'CREDITO',
    ADELANTO: 'ADELANTO',
    MIXTO: 'MIXTO',
};
let Venta = class Venta extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], Venta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Venta.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'uuid' }),
    __metadata("design:type", String)
], Venta.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'caja_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Venta.prototype, "cajaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'caja_sesion_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Venta.prototype, "cajaSesionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id', type: 'bigint' }),
    __metadata("design:type", String)
], Venta.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nro_venta', length: 50 }),
    __metadata("design:type", String)
], Venta.prototype, "nroVenta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha', type: 'date' }),
    __metadata("design:type", String)
], Venta.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_venta', length: 20, default: exports.EstadoVenta.PAGADA }),
    __metadata("design:type", String)
], Venta.prototype, "estadoVenta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metodo_pago', length: 20, nullable: true }),
    __metadata("design:type", String)
], Venta.prototype, "metodoPago", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subtotal', type: 'decimal', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Venta.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descuento', type: 'decimal', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Venta.prototype, "descuento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'impuesto', type: 'decimal', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Venta.prototype, "impuesto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total', type: 'decimal', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], Venta.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto_pagado', type: 'decimal', precision: 14, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Venta.prototype, "montoPagado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cambio', type: 'decimal', precision: 14, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Venta.prototype, "cambio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contacto_cliente_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Venta.prototype, "contactoClienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre_cliente', length: 200, nullable: true }),
    __metadata("design:type", String)
], Venta.prototype, "nombreCliente", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'observaciones', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Venta.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adelanto_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Venta.prototype, "adelantoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto_adelanto', type: 'decimal', precision: 14, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Venta.prototype, "montoAdelanto", void 0);
Venta = __decorate([
    (0, typeorm_1.Entity)({ name: 'venta', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Venta);
exports.Venta = Venta;
//# sourceMappingURL=venta.entity.js.map