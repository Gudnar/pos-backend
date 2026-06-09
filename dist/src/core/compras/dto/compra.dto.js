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
exports.CreatePagoProveedorDto = exports.AnularCompraDto = exports.FinalizarCompraDto = exports.EditarOrdenDto = exports.DetalleFinalizarDto = exports.MarcarPendienteDto = exports.UpdateIngresoDto = exports.UpdateCompraDto = exports.CreateCompraDto = exports.DetalleCompraDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class DetalleCompraDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DetalleCompraDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DetalleCompraDto.prototype, "productoId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DetalleCompraDto.prototype, "unidadId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.0001),
    __metadata("design:type", Number)
], DetalleCompraDto.prototype, "cantidad", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DetalleCompraDto.prototype, "precioUnitario", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DetalleCompraDto.prototype, "descuento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DetalleCompraDto.prototype, "nroLote", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DetalleCompraDto.prototype, "fechaVencimiento", void 0);
exports.DetalleCompraDto = DetalleCompraDto;
class CreateCompraDto {
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCompraDto.prototype, "sucursalId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCompraDto.prototype, "proveedorId", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['INICIAL', 'COMPRA']),
    __metadata("design:type", String)
], CreateCompraDto.prototype, "tipoCompra", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCompraDto.prototype, "fecha", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCompraDto.prototype, "nroFactura", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCompraDto.prototype, "fechaEnvio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCompraDto.prototype, "fechaEstimadaLlegada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCompraDto.prototype, "nroGuiaRemision", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCompraDto.prototype, "transportista", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCompraDto.prototype, "observaciones", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DetalleCompraDto),
    __metadata("design:type", Array)
], CreateCompraDto.prototype, "detalles", void 0);
exports.CreateCompraDto = CreateCompraDto;
class UpdateCompraDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateCompraDto.prototype, "proveedorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateCompraDto.prototype, "fecha", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompraDto.prototype, "nroFactura", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateCompraDto.prototype, "fechaEnvio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateCompraDto.prototype, "fechaEstimadaLlegada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompraDto.prototype, "nroGuiaRemision", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompraDto.prototype, "transportista", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompraDto.prototype, "observaciones", void 0);
exports.UpdateCompraDto = UpdateCompraDto;
class UpdateIngresoDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateIngresoDto.prototype, "sucursalId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateIngresoDto.prototype, "fecha", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateIngresoDto.prototype, "observaciones", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DetalleCompraDto),
    __metadata("design:type", Array)
], UpdateIngresoDto.prototype, "detalles", void 0);
exports.UpdateIngresoDto = UpdateIngresoDto;
class MarcarPendienteDto {
}
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], MarcarPendienteDto.prototype, "fechaRecepcion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['BUENA', 'DAÑADA', 'PARCIAL']),
    __metadata("design:type", String)
], MarcarPendienteDto.prototype, "condicionMercancia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MarcarPendienteDto.prototype, "observacionesRecepcion", void 0);
exports.MarcarPendienteDto = MarcarPendienteDto;
class DetalleFinalizarDto {
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DetalleFinalizarDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DetalleFinalizarDto.prototype, "nroLote", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DetalleFinalizarDto.prototype, "fechaVencimiento", void 0);
exports.DetalleFinalizarDto = DetalleFinalizarDto;
class EditarOrdenDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], EditarOrdenDto.prototype, "proveedorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], EditarOrdenDto.prototype, "sucursalId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], EditarOrdenDto.prototype, "fecha", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EditarOrdenDto.prototype, "nroFactura", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], EditarOrdenDto.prototype, "fechaEnvio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], EditarOrdenDto.prototype, "fechaEstimadaLlegada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EditarOrdenDto.prototype, "nroGuiaRemision", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EditarOrdenDto.prototype, "transportista", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EditarOrdenDto.prototype, "observaciones", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DetalleCompraDto),
    __metadata("design:type", Array)
], EditarOrdenDto.prototype, "detalles", void 0);
exports.EditarOrdenDto = EditarOrdenDto;
class FinalizarCompraDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinalizarCompraDto.prototype, "observacionesFinalizacion", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DetalleFinalizarDto),
    __metadata("design:type", Array)
], FinalizarCompraDto.prototype, "detalles", void 0);
exports.FinalizarCompraDto = FinalizarCompraDto;
class AnularCompraDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnularCompraDto.prototype, "motivo", void 0);
exports.AnularCompraDto = AnularCompraDto;
class CreatePagoProveedorDto {
}
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePagoProveedorDto.prototype, "fecha", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreatePagoProveedorDto.prototype, "monto", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'QR', 'TARJETA']),
    __metadata("design:type", String)
], CreatePagoProveedorDto.prototype, "metodoPago", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePagoProveedorDto.prototype, "referencia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePagoProveedorDto.prototype, "notas", void 0);
exports.CreatePagoProveedorDto = CreatePagoProveedorDto;
//# sourceMappingURL=compra.dto.js.map