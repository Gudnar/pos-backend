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
exports.GastoLogistica = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let GastoLogistica = class GastoLogistica extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], GastoLogistica.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], GastoLogistica.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'orden_importacion_id', type: 'uuid' }),
    __metadata("design:type", String)
], GastoLogistica.prototype, "ordenImportacionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_gasto_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], GastoLogistica.prototype, "tipoGastoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', length: 300 }),
    __metadata("design:type", String)
], GastoLogistica.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'moneda_id', type: 'uuid' }),
    __metadata("design:type", String)
], GastoLogistica.prototype, "monedaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], GastoLogistica.prototype, "monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_cambio', type: 'decimal', precision: 15, scale: 6 }),
    __metadata("design:type", Number)
], GastoLogistica.prototype, "tipoCambio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto_moneda_base', type: 'decimal', precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], GastoLogistica.prototype, "montoMonedaBase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_gasto', type: 'date' }),
    __metadata("design:type", String)
], GastoLogistica.prototype, "fechaGasto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pais', length: 100, nullable: true }),
    __metadata("design:type", String)
], GastoLogistica.prototype, "pais", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'comprobante', length: 200, nullable: true }),
    __metadata("design:type", String)
], GastoLogistica.prototype, "comprobante", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'observaciones', type: 'text', nullable: true }),
    __metadata("design:type", String)
], GastoLogistica.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fuente_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], GastoLogistica.prototype, "fuenteId", void 0);
GastoLogistica = __decorate([
    (0, typeorm_1.Entity)({ name: 'logistica_gasto', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], GastoLogistica);
exports.GastoLogistica = GastoLogistica;
//# sourceMappingURL=gasto-logistica.entity.js.map