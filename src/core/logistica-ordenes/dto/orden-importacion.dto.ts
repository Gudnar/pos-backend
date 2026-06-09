import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min, ValidateNested } from 'class-validator'

export class CreateOrdenImportacionDto {
  @IsOptional() @IsString() @MaxLength(50)
  numero?: string

  @IsString() @MaxLength(100)
  paisOrigen: string

  @IsOptional() @IsUUID()
  proveedorId?: string

  @IsOptional() @IsUUID()
  monedaCompraId?: string

  @IsDateString()
  fechaOrden: string

  @IsOptional() @IsDateString()
  fechaEstimadaLlegada?: string

  @IsOptional() @IsDateString()
  fechaLlegadaReal?: string

  @IsOptional() @IsIn(['POR_VALOR', 'POR_CANTIDAD'])
  metodoDistribucion?: string

  @IsOptional() @IsString()
  observaciones?: string
}

export class UpdateOrdenImportacionDto {
  @IsOptional() @IsString() @MaxLength(50)
  numero?: string

  @IsOptional() @IsString() @MaxLength(100)
  paisOrigen?: string

  @IsOptional() @IsUUID()
  proveedorId?: string

  @IsOptional() @IsUUID()
  monedaCompraId?: string

  @IsOptional() @IsDateString()
  fechaOrden?: string

  @IsOptional() @IsDateString()
  fechaEstimadaLlegada?: string

  @IsOptional() @IsDateString()
  fechaLlegadaReal?: string

  @IsOptional() @IsIn(['POR_VALOR', 'POR_CANTIDAD'])
  metodoDistribucion?: string

  @IsOptional() @IsIn(['BORRADOR', 'EN_TRANSITO', 'EN_ADUANA', 'RECIBIDO', 'CERRADO'])
  estadoOrden?: string

  @IsOptional() @IsString()
  observaciones?: string
}

export class PasoFormulaDto {
  @IsIn(['multiplicar', 'dividir', 'sumar', 'restar'])
  operacion: string

  @IsNumber() @Min(0)
  valor: number
}

export class RedondeoFormulaDto {
  @IsIn(['ninguno', 'entero', 'multiplo'])
  tipo: string

  @IsOptional() @IsNumber() @Min(0.01)
  multiplo?: number
}

export class FormulaDto {
  @IsIn(['costoTotal', 'costoProducto'])
  base: string

  @IsArray() @ValidateNested({ each: true }) @Type(() => PasoFormulaDto)
  pasos: PasoFormulaDto[]

  @IsOptional() @ValidateNested() @Type(() => RedondeoFormulaDto)
  redondeo?: RedondeoFormulaDto
}

export class GastoOverrideDto {
  @IsUUID()
  gastoId: string

  @IsNumber() @Min(0)
  tipoCambio: number
}

export class ComponenteFormulaDto {
  @IsNumber() @Min(0)
  multiplicador: number

  @IsOptional() @IsNumber()
  sumarFijo?: number
}

export class ProponerPreciosDto {
  @IsOptional() @IsArray() @IsString({ each: true })
  gastosParaPrecio?: string[]

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => GastoOverrideDto)
  tiposCambioOverride?: GastoOverrideDto[]

  @ValidateNested() @Type(() => ComponenteFormulaDto)
  componenteCompra: ComponenteFormulaDto

  @ValidateNested() @Type(() => ComponenteFormulaDto)
  componenteLogistica: ComponenteFormulaDto

  @IsOptional() @IsNumber()
  ajusteFijo?: number

  @IsOptional() @ValidateNested() @Type(() => RedondeoFormulaDto)
  redondeo?: RedondeoFormulaDto
}

export class CerrarOrdenDto {
  @IsOptional() @IsNumber() @Min(0)
  margenPorcentaje?: number

  @IsOptional() @ValidateNested() @Type(() => FormulaDto)
  formula?: FormulaDto

  @IsOptional() @IsArray() @IsString({ each: true })
  gastosParaPrecio?: string[]

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => GastoOverrideDto)
  tiposCambioOverride?: GastoOverrideDto[]

  @IsOptional() @IsBoolean()
  ingresarInventario?: boolean

  @IsOptional() @IsUUID()
  sucursalId?: string
}
