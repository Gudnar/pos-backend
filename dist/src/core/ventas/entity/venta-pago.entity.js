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
exports.VentaPago = exports.OrigenPagoVenta = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
exports.OrigenPagoVenta = {
    POS: 'POS',
    ABONO: 'ABONO',
};
let VentaPago = class VentaPago extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], VentaPago.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], VentaPago.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'venta_id', type: 'uuid' }),
    __metadata("design:type", String)
], VentaPago.prototype, "ventaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'origen', length: 10 }),
    __metadata("design:type", String)
], VentaPago.prototype, "origen", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha', type: 'date' }),
    __metadata("design:type", String)
], VentaPago.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metodo_pago', length: 20 }),
    __metadata("design:type", String)
], VentaPago.prototype, "metodoPago", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto', type: 'decimal', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], VentaPago.prototype, "monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'referencia', length: 200, nullable: true }),
    __metadata("design:type", String)
], VentaPago.prototype, "referencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fuente_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], VentaPago.prototype, "fuenteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'observaciones', type: 'text', nullable: true }),
    __metadata("design:type", String)
], VentaPago.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'comprobante_nombre', length: 255, nullable: true }),
    __metadata("design:type", String)
], VentaPago.prototype, "comprobanteNombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'comprobante_mime', length: 100, nullable: true }),
    __metadata("design:type", String)
], VentaPago.prototype, "comprobanteMime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'comprobante_tamano', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], VentaPago.prototype, "comprobanteTamano", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'comprobante_ruta', length: 500, nullable: true, select: false }),
    __metadata("design:type", String)
], VentaPago.prototype, "comprobanteRuta", void 0);
VentaPago = __decorate([
    (0, typeorm_1.Entity)({ name: 'venta_pago', schema: process.env.DB_SCHEMA || 'public' }),
    (0, typeorm_1.Index)(['ventaId']),
    __metadata("design:paramtypes", [Object])
], VentaPago);
exports.VentaPago = VentaPago;
//# sourceMappingURL=venta-pago.entity.js.map