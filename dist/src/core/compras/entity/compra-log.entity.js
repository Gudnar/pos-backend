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
exports.CompraLog = exports.TipoLog = void 0;
const typeorm_1 = require("typeorm");
exports.TipoLog = {
    CREACION: 'CREACION',
    ESTADO: 'ESTADO',
    EDICION: 'EDICION',
    PAGO: 'PAGO',
};
let CompraLog = class CompraLog {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], CompraLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], CompraLog.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compra_id', type: 'uuid' }),
    __metadata("design:type", String)
], CompraLog.prototype, "compraId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo', length: 30 }),
    __metadata("design:type", String)
], CompraLog.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_anterior', length: 30, nullable: true }),
    __metadata("design:type", String)
], CompraLog.prototype, "estadoAnterior", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_nuevo', length: 30, nullable: true }),
    __metadata("design:type", String)
], CompraLog.prototype, "estadoNuevo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', type: 'text' }),
    __metadata("design:type", String)
], CompraLog.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id', nullable: true }),
    __metadata("design:type", String)
], CompraLog.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CompraLog.prototype, "createdAt", void 0);
CompraLog = __decorate([
    (0, typeorm_1.Entity)({ name: 'compra_log', schema: process.env.DB_SCHEMA || 'public' })
], CompraLog);
exports.CompraLog = CompraLog;
//# sourceMappingURL=compra-log.entity.js.map