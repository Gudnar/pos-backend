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
exports.MovimientoFuente = exports.CategoriaMovimiento = exports.TipoMovimiento = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
const fuente_entity_1 = require("./fuente.entity");
var TipoMovimiento;
(function (TipoMovimiento) {
    TipoMovimiento["INGRESO"] = "INGRESO";
    TipoMovimiento["EGRESO"] = "EGRESO";
    TipoMovimiento["TRANSFERENCIA_SALIDA"] = "TRANSFERENCIA_SALIDA";
    TipoMovimiento["TRANSFERENCIA_ENTRADA"] = "TRANSFERENCIA_ENTRADA";
})(TipoMovimiento = exports.TipoMovimiento || (exports.TipoMovimiento = {}));
var CategoriaMovimiento;
(function (CategoriaMovimiento) {
    CategoriaMovimiento["PAGO_PROVEEDOR"] = "PAGO_PROVEEDOR";
    CategoriaMovimiento["GASTO_LOGISTICA"] = "GASTO_LOGISTICA";
    CategoriaMovimiento["INGRESO_VENTA"] = "INGRESO_VENTA";
    CategoriaMovimiento["RETIRO"] = "RETIRO";
    CategoriaMovimiento["DEPOSITO"] = "DEPOSITO";
    CategoriaMovimiento["TRANSFERENCIA"] = "TRANSFERENCIA";
    CategoriaMovimiento["OTRO"] = "OTRO";
})(CategoriaMovimiento = exports.CategoriaMovimiento || (exports.CategoriaMovimiento = {}));
let MovimientoFuente = class MovimientoFuente extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], MovimientoFuente.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], MovimientoFuente.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fuente_id', type: 'uuid' }),
    __metadata("design:type", String)
], MovimientoFuente.prototype, "fuenteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fuente_entity_1.Fuente, f => f.movimientos),
    (0, typeorm_1.JoinColumn)({ name: 'fuente_id' }),
    __metadata("design:type", fuente_entity_1.Fuente)
], MovimientoFuente.prototype, "fuente", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo', type: 'varchar', length: 30 }),
    __metadata("design:type", String)
], MovimientoFuente.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'concepto', length: 500 }),
    __metadata("design:type", String)
], MovimientoFuente.prototype, "concepto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'referencia', length: 200, nullable: true }),
    __metadata("design:type", String)
], MovimientoFuente.prototype, "referencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'moneda_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], MovimientoFuente.prototype, "monedaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto', type: 'decimal', precision: 14, scale: 4 }),
    __metadata("design:type", Number)
], MovimientoFuente.prototype, "monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_cambio', type: 'decimal', precision: 14, scale: 6, default: 1 }),
    __metadata("design:type", Number)
], MovimientoFuente.prototype, "tipoCambio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto_nativo', type: 'decimal', precision: 14, scale: 4 }),
    __metadata("design:type", Number)
], MovimientoFuente.prototype, "montoNativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha', type: 'date' }),
    __metadata("design:type", String)
], MovimientoFuente.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'categoria', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], MovimientoFuente.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'origen_tipo', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], MovimientoFuente.prototype, "origenTipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'origen_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], MovimientoFuente.prototype, "origenId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fuente_destino_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], MovimientoFuente.prototype, "fuenteDestinoId", void 0);
MovimientoFuente = __decorate([
    (0, typeorm_1.Entity)({ name: 'movimiento_fuente', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], MovimientoFuente);
exports.MovimientoFuente = MovimientoFuente;
//# sourceMappingURL=movimiento-fuente.entity.js.map