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
exports.CerrarOrdenDto = exports.PrecioVentaManualItemDto = exports.ProponerPreciosDto = exports.ComponenteFormulaDto = exports.GastoOverrideDto = exports.FormulaDto = exports.RedondeoFormulaDto = exports.PasoFormulaDto = exports.UpdateOrdenImportacionDto = exports.CreateOrdenImportacionDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateOrdenImportacionDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateOrdenImportacionDto.prototype, "numero", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateOrdenImportacionDto.prototype, "paisOrigen", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateOrdenImportacionDto.prototype, "proveedorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateOrdenImportacionDto.prototype, "monedaCompraId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateOrdenImportacionDto.prototype, "fechaOrden", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateOrdenImportacionDto.prototype, "fechaEstimadaLlegada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateOrdenImportacionDto.prototype, "fechaLlegadaReal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['POR_VALOR', 'POR_CANTIDAD']),
    __metadata("design:type", String)
], CreateOrdenImportacionDto.prototype, "metodoDistribucion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrdenImportacionDto.prototype, "observaciones", void 0);
exports.CreateOrdenImportacionDto = CreateOrdenImportacionDto;
class UpdateOrdenImportacionDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateOrdenImportacionDto.prototype, "numero", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateOrdenImportacionDto.prototype, "paisOrigen", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateOrdenImportacionDto.prototype, "proveedorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateOrdenImportacionDto.prototype, "monedaCompraId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateOrdenImportacionDto.prototype, "fechaOrden", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateOrdenImportacionDto.prototype, "fechaEstimadaLlegada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateOrdenImportacionDto.prototype, "fechaLlegadaReal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['POR_VALOR', 'POR_CANTIDAD']),
    __metadata("design:type", String)
], UpdateOrdenImportacionDto.prototype, "metodoDistribucion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['BORRADOR', 'EN_TRANSITO', 'EN_ADUANA', 'RECIBIDO', 'CERRADO']),
    __metadata("design:type", String)
], UpdateOrdenImportacionDto.prototype, "estadoOrden", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOrdenImportacionDto.prototype, "observaciones", void 0);
exports.UpdateOrdenImportacionDto = UpdateOrdenImportacionDto;
class PasoFormulaDto {
}
__decorate([
    (0, class_validator_1.IsIn)(['multiplicar', 'dividir', 'sumar', 'restar']),
    __metadata("design:type", String)
], PasoFormulaDto.prototype, "operacion", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PasoFormulaDto.prototype, "valor", void 0);
exports.PasoFormulaDto = PasoFormulaDto;
class RedondeoFormulaDto {
}
__decorate([
    (0, class_validator_1.IsIn)(['ninguno', 'entero', 'multiplo']),
    __metadata("design:type", String)
], RedondeoFormulaDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], RedondeoFormulaDto.prototype, "multiplo", void 0);
exports.RedondeoFormulaDto = RedondeoFormulaDto;
class FormulaDto {
}
__decorate([
    (0, class_validator_1.IsIn)(['costoTotal', 'costoProducto']),
    __metadata("design:type", String)
], FormulaDto.prototype, "base", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PasoFormulaDto),
    __metadata("design:type", Array)
], FormulaDto.prototype, "pasos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RedondeoFormulaDto),
    __metadata("design:type", RedondeoFormulaDto)
], FormulaDto.prototype, "redondeo", void 0);
exports.FormulaDto = FormulaDto;
class GastoOverrideDto {
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GastoOverrideDto.prototype, "gastoId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GastoOverrideDto.prototype, "tipoCambio", void 0);
exports.GastoOverrideDto = GastoOverrideDto;
class ComponenteFormulaDto {
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ComponenteFormulaDto.prototype, "multiplicador", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ComponenteFormulaDto.prototype, "sumarFijo", void 0);
exports.ComponenteFormulaDto = ComponenteFormulaDto;
class ProponerPreciosDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ProponerPreciosDto.prototype, "gastosParaPrecio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GastoOverrideDto),
    __metadata("design:type", Array)
], ProponerPreciosDto.prototype, "tiposCambioOverride", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ComponenteFormulaDto),
    __metadata("design:type", ComponenteFormulaDto)
], ProponerPreciosDto.prototype, "componenteCompra", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ComponenteFormulaDto),
    __metadata("design:type", ComponenteFormulaDto)
], ProponerPreciosDto.prototype, "componenteLogistica", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProponerPreciosDto.prototype, "ajusteFijo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RedondeoFormulaDto),
    __metadata("design:type", RedondeoFormulaDto)
], ProponerPreciosDto.prototype, "redondeo", void 0);
exports.ProponerPreciosDto = ProponerPreciosDto;
class PrecioVentaManualItemDto {
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], PrecioVentaManualItemDto.prototype, "itemId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], PrecioVentaManualItemDto.prototype, "precioVenta", void 0);
exports.PrecioVentaManualItemDto = PrecioVentaManualItemDto;
class CerrarOrdenDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CerrarOrdenDto.prototype, "margenPorcentaje", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FormulaDto),
    __metadata("design:type", FormulaDto)
], CerrarOrdenDto.prototype, "formula", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CerrarOrdenDto.prototype, "gastosParaPrecio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GastoOverrideDto),
    __metadata("design:type", Array)
], CerrarOrdenDto.prototype, "tiposCambioOverride", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CerrarOrdenDto.prototype, "ingresarInventario", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CerrarOrdenDto.prototype, "sucursalId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CerrarOrdenDto.prototype, "tasaIva", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PrecioVentaManualItemDto),
    __metadata("design:type", Array)
], CerrarOrdenDto.prototype, "preciosVentaManual", void 0);
exports.CerrarOrdenDto = CerrarOrdenDto;
//# sourceMappingURL=orden-importacion.dto.js.map