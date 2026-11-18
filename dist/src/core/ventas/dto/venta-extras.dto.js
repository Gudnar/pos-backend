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
exports.CrearComisionDto = exports.HojaRutaDto = exports.DatosNotaVentaDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const vacioANull = () => (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' && value.trim() === '' ? null : value));
class DatosNotaVentaDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    vacioANull(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], DatosNotaVentaDto.prototype, "nombreCliente", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    vacioANull(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], DatosNotaVentaDto.prototype, "nitCi", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    vacioANull(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", String)
], DatosNotaVentaDto.prototype, "telefonoCliente", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    vacioANull(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], DatosNotaVentaDto.prototype, "direccionCliente", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    vacioANull(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], DatosNotaVentaDto.prototype, "nroPesaje", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    vacioANull(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], DatosNotaVentaDto.prototype, "nroFactura", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    vacioANull(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DatosNotaVentaDto.prototype, "observaciones", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value || null),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DatosNotaVentaDto.prototype, "contactoClienteId", void 0);
exports.DatosNotaVentaDto = DatosNotaVentaDto;
class HojaRutaDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    vacioANull(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], HojaRutaDto.prototype, "empresaTransporte", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    vacioANull(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], HojaRutaDto.prototype, "conductor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    vacioANull(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], HojaRutaDto.prototype, "conductorCi", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    vacioANull(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], HojaRutaDto.prototype, "conductorCelular", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    vacioANull(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], HojaRutaDto.prototype, "placa", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    vacioANull(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], HojaRutaDto.prototype, "vehiculo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    vacioANull(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], HojaRutaDto.prototype, "origen", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    vacioANull(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], HojaRutaDto.prototype, "destino", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value || null),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], HojaRutaDto.prototype, "fechaSalida", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    vacioANull(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HojaRutaDto.prototype, "observaciones", void 0);
exports.HojaRutaDto = HojaRutaDto;
class CrearComisionDto {
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CrearComisionDto.prototype, "representanteId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CrearComisionDto.prototype, "monto", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CrearComisionDto.prototype, "fuenteId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CrearComisionDto.prototype, "fecha", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CrearComisionDto.prototype, "observaciones", void 0);
exports.CrearComisionDto = CrearComisionDto;
//# sourceMappingURL=venta-extras.dto.js.map