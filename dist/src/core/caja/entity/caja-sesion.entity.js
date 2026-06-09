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
exports.CajaSesion = exports.EstadoSesion = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
exports.EstadoSesion = {
    ABIERTA: 'ABIERTA',
    CERRADA: 'CERRADA',
};
let CajaSesion = class CajaSesion extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], CajaSesion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], CajaSesion.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'caja_id', type: 'uuid' }),
    __metadata("design:type", String)
], CajaSesion.prototype, "cajaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'uuid' }),
    __metadata("design:type", String)
], CajaSesion.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id', type: 'bigint' }),
    __metadata("design:type", String)
], CajaSesion.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_sesion', length: 20, default: exports.EstadoSesion.ABIERTA }),
    __metadata("design:type", String)
], CajaSesion.prototype, "estadoSesion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto_inicial', type: 'decimal', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CajaSesion.prototype, "montoInicial", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto_final', type: 'decimal', precision: 14, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], CajaSesion.prototype, "montoFinal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_ventas', type: 'decimal', precision: 14, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CajaSesion.prototype, "totalVentas", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nro_ventas', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CajaSesion.prototype, "nroVentas", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_apertura', type: 'timestamp without time zone' }),
    __metadata("design:type", Date)
], CajaSesion.prototype, "fechaApertura", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_cierre', type: 'timestamp without time zone', nullable: true }),
    __metadata("design:type", Date)
], CajaSesion.prototype, "fechaCierre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre_usuario', length: 200, nullable: true }),
    __metadata("design:type", String)
], CajaSesion.prototype, "nombreUsuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'diferencia', type: 'decimal', precision: 14, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], CajaSesion.prototype, "diferencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'observaciones', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CajaSesion.prototype, "observaciones", void 0);
CajaSesion = __decorate([
    (0, typeorm_1.Entity)({ name: 'caja_sesion', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], CajaSesion);
exports.CajaSesion = CajaSesion;
//# sourceMappingURL=caja-sesion.entity.js.map