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
exports.Fuente = exports.TipoFuente = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
const movimiento_fuente_entity_1 = require("./movimiento-fuente.entity");
var TipoFuente;
(function (TipoFuente) {
    TipoFuente["CUENTA_BANCARIA"] = "CUENTA_BANCARIA";
    TipoFuente["CAJA"] = "CAJA";
    TipoFuente["BILLETERA_DIGITAL"] = "BILLETERA_DIGITAL";
    TipoFuente["OTRO"] = "OTRO";
})(TipoFuente = exports.TipoFuente || (exports.TipoFuente = {}));
let Fuente = class Fuente extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], Fuente.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Fuente.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 200 }),
    __metadata("design:type", String)
], Fuente.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo', type: 'varchar', length: 30, default: TipoFuente.CUENTA_BANCARIA }),
    __metadata("design:type", String)
], Fuente.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'banco', length: 100, nullable: true }),
    __metadata("design:type", String)
], Fuente.prototype, "banco", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_cuenta', length: 100, nullable: true }),
    __metadata("design:type", String)
], Fuente.prototype, "numeroCuenta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'moneda_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Fuente.prototype, "monedaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'titular', length: 200, nullable: true }),
    __metadata("design:type", String)
], Fuente.prototype, "titular", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Fuente.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'saldo_inicial', type: 'decimal', precision: 14, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], Fuente.prototype, "saldoInicial", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Fuente.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => movimiento_fuente_entity_1.MovimientoFuente, m => m.fuente),
    __metadata("design:type", Array)
], Fuente.prototype, "movimientos", void 0);
Fuente = __decorate([
    (0, typeorm_1.Entity)({ name: 'fuente', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Fuente);
exports.Fuente = Fuente;
//# sourceMappingURL=fuente.entity.js.map