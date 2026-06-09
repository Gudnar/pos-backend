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
exports.MovimientoStock = exports.TipoMovimiento = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
exports.TipoMovimiento = {
    INGRESO: 'INGRESO',
    SALIDA: 'SALIDA',
    TRANSFERENCIA_SALIDA: 'TRANSFERENCIA_SALIDA',
    TRANSFERENCIA_ENTRADA: 'TRANSFERENCIA_ENTRADA',
    AJUSTE_POSITIVO: 'AJUSTE_POSITIVO',
    AJUSTE_NEGATIVO: 'AJUSTE_NEGATIVO',
    RETIRO: 'RETIRO',
    DEVOLUCION_PROVEEDOR: 'DEVOLUCION_PROVEEDOR',
    DEVOLUCION_CLIENTE: 'DEVOLUCION_CLIENTE',
};
let MovimientoStock = class MovimientoStock extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], MovimientoStock.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], MovimientoStock.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'uuid' }),
    __metadata("design:type", String)
], MovimientoStock.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'producto_id', type: 'uuid' }),
    __metadata("design:type", String)
], MovimientoStock.prototype, "productoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lote_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], MovimientoStock.prototype, "loteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unidad_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], MovimientoStock.prototype, "unidadId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo', length: 30 }),
    __metadata("design:type", String)
], MovimientoStock.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad', type: 'decimal', precision: 14, scale: 4 }),
    __metadata("design:type", Number)
], MovimientoStock.prototype, "cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad_anterior', type: 'decimal', precision: 14, scale: 4 }),
    __metadata("design:type", Number)
], MovimientoStock.prototype, "cantidadAnterior", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad_posterior', type: 'decimal', precision: 14, scale: 4 }),
    __metadata("design:type", Number)
], MovimientoStock.prototype, "cantidadPosterior", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_destino_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], MovimientoStock.prototype, "sucursalDestinoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lote_destino_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], MovimientoStock.prototype, "loteDestinoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'referencia_documento', length: 100, nullable: true }),
    __metadata("design:type", String)
], MovimientoStock.prototype, "referenciaDocumento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_documento', length: 50, nullable: true }),
    __metadata("design:type", String)
], MovimientoStock.prototype, "tipoDocumento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motivo', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MovimientoStock.prototype, "motivo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], MovimientoStock.prototype, "usuarioId", void 0);
MovimientoStock = __decorate([
    (0, typeorm_1.Entity)({ name: 'movimiento_stock', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], MovimientoStock);
exports.MovimientoStock = MovimientoStock;
//# sourceMappingURL=movimiento-stock.entity.js.map