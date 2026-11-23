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
exports.Cotizacion = exports.EstadoCotizacion = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
exports.EstadoCotizacion = {
    VIGENTE: 'VIGENTE',
    CONVERTIDA: 'CONVERTIDA',
    ANULADA: 'ANULADA',
};
let Cotizacion = class Cotizacion extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], Cotizacion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Cotizacion.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'uuid' }),
    __metadata("design:type", String)
], Cotizacion.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id', type: 'bigint' }),
    __metadata("design:type", String)
], Cotizacion.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nro_cotizacion', length: 50 }),
    __metadata("design:type", String)
], Cotizacion.prototype, "nroCotizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha', type: 'date' }),
    __metadata("design:type", String)
], Cotizacion.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valido_hasta', type: 'date', nullable: true }),
    __metadata("design:type", String)
], Cotizacion.prototype, "validoHasta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_cotizacion', length: 20, default: exports.EstadoCotizacion.VIGENTE }),
    __metadata("design:type", String)
], Cotizacion.prototype, "estadoCotizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_precio', length: 10, nullable: true }),
    __metadata("design:type", String)
], Cotizacion.prototype, "tipoPrecio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contacto_cliente_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Cotizacion.prototype, "contactoClienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre_cliente', length: 200, nullable: true }),
    __metadata("design:type", String)
], Cotizacion.prototype, "nombreCliente", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nit_ci', length: 30, nullable: true }),
    __metadata("design:type", String)
], Cotizacion.prototype, "nitCi", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'telefono_cliente', length: 60, nullable: true }),
    __metadata("design:type", String)
], Cotizacion.prototype, "telefonoCliente", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'observaciones', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Cotizacion.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total', type: 'decimal', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], Cotizacion.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'venta_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Cotizacion.prototype, "ventaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_conversion', type: 'timestamp without time zone', nullable: true }),
    __metadata("design:type", Object)
], Cotizacion.prototype, "fechaConversion", void 0);
Cotizacion = __decorate([
    (0, typeorm_1.Entity)({ name: 'cotizacion', schema: process.env.DB_SCHEMA || 'public' }),
    (0, typeorm_1.Index)(['clienteId', 'nroCotizacion']),
    __metadata("design:paramtypes", [Object])
], Cotizacion);
exports.Cotizacion = Cotizacion;
//# sourceMappingURL=cotizacion.entity.js.map