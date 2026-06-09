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
exports.PagoProveedorImportacion = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let PagoProveedorImportacion = class PagoProveedorImportacion extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], PagoProveedorImportacion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], PagoProveedorImportacion.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'orden_importacion_id', type: 'uuid' }),
    __metadata("design:type", String)
], PagoProveedorImportacion.prototype, "ordenImportacionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'moneda_id', type: 'uuid' }),
    __metadata("design:type", String)
], PagoProveedorImportacion.prototype, "monedaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], PagoProveedorImportacion.prototype, "monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_cambio', type: 'decimal', precision: 15, scale: 6 }),
    __metadata("design:type", Number)
], PagoProveedorImportacion.prototype, "tipoCambio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto_moneda_base', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PagoProveedorImportacion.prototype, "montoMonedaBase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_pago', type: 'date' }),
    __metadata("design:type", String)
], PagoProveedorImportacion.prototype, "fechaPago", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metodo_pago', length: 50, default: 'TRANSFERENCIA' }),
    __metadata("design:type", String)
], PagoProveedorImportacion.prototype, "metodoPago", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'referencia', length: 200, nullable: true }),
    __metadata("design:type", String)
], PagoProveedorImportacion.prototype, "referencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'observaciones', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PagoProveedorImportacion.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fuente_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PagoProveedorImportacion.prototype, "fuenteId", void 0);
PagoProveedorImportacion = __decorate([
    (0, typeorm_1.Entity)({ name: 'logistica_pago_proveedor', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], PagoProveedorImportacion);
exports.PagoProveedorImportacion = PagoProveedorImportacion;
//# sourceMappingURL=pago-proveedor-importacion.entity.js.map