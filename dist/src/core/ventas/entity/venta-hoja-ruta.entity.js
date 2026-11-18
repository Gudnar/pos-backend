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
exports.VentaHojaRuta = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let VentaHojaRuta = class VentaHojaRuta extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], VentaHojaRuta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], VentaHojaRuta.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'venta_id', type: 'uuid' }),
    __metadata("design:type", String)
], VentaHojaRuta.prototype, "ventaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nro_hoja_ruta', type: 'int' }),
    __metadata("design:type", Number)
], VentaHojaRuta.prototype, "nroHojaRuta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'empresa_transporte', length: 200, nullable: true }),
    __metadata("design:type", String)
], VentaHojaRuta.prototype, "empresaTransporte", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conductor', length: 200, nullable: true }),
    __metadata("design:type", String)
], VentaHojaRuta.prototype, "conductor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conductor_ci', length: 30, nullable: true }),
    __metadata("design:type", String)
], VentaHojaRuta.prototype, "conductorCi", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conductor_celular', length: 30, nullable: true }),
    __metadata("design:type", String)
], VentaHojaRuta.prototype, "conductorCelular", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'placa', length: 20, nullable: true }),
    __metadata("design:type", String)
], VentaHojaRuta.prototype, "placa", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vehiculo', length: 150, nullable: true }),
    __metadata("design:type", String)
], VentaHojaRuta.prototype, "vehiculo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'origen', length: 300, nullable: true }),
    __metadata("design:type", String)
], VentaHojaRuta.prototype, "origen", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'destino', length: 300, nullable: true }),
    __metadata("design:type", String)
], VentaHojaRuta.prototype, "destino", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_salida', type: 'date', nullable: true }),
    __metadata("design:type", String)
], VentaHojaRuta.prototype, "fechaSalida", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'observaciones', type: 'text', nullable: true }),
    __metadata("design:type", String)
], VentaHojaRuta.prototype, "observaciones", void 0);
VentaHojaRuta = __decorate([
    (0, typeorm_1.Entity)({ name: 'venta_hoja_ruta', schema: process.env.DB_SCHEMA || 'public' }),
    (0, typeorm_1.Index)(['ventaId']),
    __metadata("design:paramtypes", [Object])
], VentaHojaRuta);
exports.VentaHojaRuta = VentaHojaRuta;
//# sourceMappingURL=venta-hoja-ruta.entity.js.map