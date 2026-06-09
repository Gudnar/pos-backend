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
exports.PagoProveedor = exports.MetodoPagoProveedor = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
exports.MetodoPagoProveedor = {
    EFECTIVO: 'EFECTIVO',
    TRANSFERENCIA: 'TRANSFERENCIA',
    CHEQUE: 'CHEQUE',
    QR: 'QR',
    TARJETA: 'TARJETA',
};
let PagoProveedor = class PagoProveedor extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], PagoProveedor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], PagoProveedor.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compra_id', type: 'uuid' }),
    __metadata("design:type", String)
], PagoProveedor.prototype, "compraId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'proveedor_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PagoProveedor.prototype, "proveedorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha', type: 'date' }),
    __metadata("design:type", String)
], PagoProveedor.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto', type: 'decimal', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], PagoProveedor.prototype, "monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metodo_pago', length: 20, default: exports.MetodoPagoProveedor.EFECTIVO }),
    __metadata("design:type", String)
], PagoProveedor.prototype, "metodoPago", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'referencia', length: 200, nullable: true }),
    __metadata("design:type", String)
], PagoProveedor.prototype, "referencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notas', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PagoProveedor.prototype, "notas", void 0);
PagoProveedor = __decorate([
    (0, typeorm_1.Entity)({ name: 'pago_proveedor', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], PagoProveedor);
exports.PagoProveedor = PagoProveedor;
//# sourceMappingURL=pago-proveedor.entity.js.map