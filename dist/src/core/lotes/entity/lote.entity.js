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
exports.Lote = exports.EstadoLote = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
exports.EstadoLote = {
    ACTIVO: 'ACTIVO',
    AGOTADO: 'AGOTADO',
    VENCIDO: 'VENCIDO',
    CUARENTENA: 'CUARENTENA',
    RETIRADO: 'RETIRADO',
};
let Lote = class Lote extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], Lote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Lote.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'uuid' }),
    __metadata("design:type", String)
], Lote.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'producto_id', type: 'uuid' }),
    __metadata("design:type", String)
], Lote.prototype, "productoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nro_lote', length: 100, nullable: true }),
    __metadata("design:type", String)
], Lote.prototype, "nroLote", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nro_serie', length: 100, nullable: true }),
    __metadata("design:type", String)
], Lote.prototype, "nroSerie", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lote_interno', length: 50, nullable: true }),
    __metadata("design:type", String)
], Lote.prototype, "loteInterno", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_fabricacion', type: 'date', nullable: true }),
    __metadata("design:type", String)
], Lote.prototype, "fechaFabricacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_vencimiento', type: 'date', nullable: true }),
    __metadata("design:type", String)
], Lote.prototype, "fechaVencimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_ingreso', type: 'date' }),
    __metadata("design:type", String)
], Lote.prototype, "fechaIngreso", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_vencimiento_garantia', type: 'date', nullable: true }),
    __metadata("design:type", String)
], Lote.prototype, "fechaVencimientoGarantia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'proveedor_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Lote.prototype, "proveedorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nro_factura_proveedor', length: 100, nullable: true }),
    __metadata("design:type", String)
], Lote.prototype, "nroFacturaProveedor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nro_pedido_compra', length: 100, nullable: true }),
    __metadata("design:type", String)
], Lote.prototype, "nroPedidoCompra", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nro_remision', length: 100, nullable: true }),
    __metadata("design:type", String)
], Lote.prototype, "nroRemision", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pais_origen', length: 100, nullable: true }),
    __metadata("design:type", String)
], Lote.prototype, "paisOrigen", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'certificado_calidad', length: 200, nullable: true }),
    __metadata("design:type", String)
], Lote.prototype, "certificadoCalidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad_inicial', type: 'decimal', precision: 14, scale: 4 }),
    __metadata("design:type", Number)
], Lote.prototype, "cantidadInicial", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad_actual', type: 'decimal', precision: 14, scale: 4 }),
    __metadata("design:type", Number)
], Lote.prototype, "cantidadActual", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unidad_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Lote.prototype, "unidadId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_lote', length: 20, default: exports.EstadoLote.ACTIVO }),
    __metadata("design:type", String)
], Lote.prototype, "estadoLote", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motivo_cuarentena', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Lote.prototype, "motivoCuarentena", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notas', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Lote.prototype, "notas", void 0);
Lote = __decorate([
    (0, typeorm_1.Entity)({ name: 'lote', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Lote);
exports.Lote = Lote;
//# sourceMappingURL=lote.entity.js.map