import { IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator'

export class CreateGastoLogisticaDto {
  // Conversión: tipoCambio es el TC del paso 1; opcionalmente un segundo paso vía moneda intermedia
  @IsOptional() @IsIn(['MULTIPLICAR', 'DIVIDIR'])
  tcOperacion?: string

  @IsOptional() @IsUUID()
  monedaIntermediaId?: string | null

  @IsOptional() @IsNumber() @Min(0)
  tcPaso2?: number | null

  @IsOptional() @IsIn(['MULTIPLICAR', 'DIVIDIR'])
  tcPaso2Operacion?: string | null

  @IsOptional() @IsUUID()
  tipoGastoId?: string

  @IsString() @MaxLength(300)
  descripcion: string

  @IsUUID()
  monedaId: string

  @IsNumber() @Min(0)
  monto: number

  @IsOptional() @IsNumber() @Min(1)
  cantidad?: number

  @IsNumber() @Min(0)
  tipoCambio: number

  @IsDateString()
  fechaGasto: string

  @IsOptional() @IsString() @MaxLength(100)
  pais?: string

  @IsOptional() @IsString() @MaxLength(200)
  comprobante?: string

  @IsOptional() @IsString()
  observaciones?: string

  @IsOptional() @IsUUID()
  fuenteId?: string | null
}

export class UpdateGastoLogisticaDto {
  // Conversión: tipoCambio es el TC del paso 1; opcionalmente un segundo paso vía moneda intermedia
  @IsOptional() @IsIn(['MULTIPLICAR', 'DIVIDIR'])
  tcOperacion?: string

  @IsOptional() @IsUUID()
  monedaIntermediaId?: string | null

  @IsOptional() @IsNumber() @Min(0)
  tcPaso2?: number | null

  @IsOptional() @IsIn(['MULTIPLICAR', 'DIVIDIR'])
  tcPaso2Operacion?: string | null

  @IsOptional() @IsUUID()
  fuenteId?: string | null

  @IsOptional() @IsUUID()
  tipoGastoId?: string

  @IsOptional() @IsString() @MaxLength(300)
  descripcion?: string

  @IsOptional() @IsUUID()
  monedaId?: string

  @IsOptional() @IsNumber() @Min(0)
  monto?: number

  @IsOptional() @IsNumber() @Min(1)
  cantidad?: number

  @IsOptional() @IsNumber() @Min(0)
  tipoCambio?: number

  @IsOptional() @IsDateString()
  fechaGasto?: string

  @IsOptional() @IsString() @MaxLength(100)
  pais?: string

  @IsOptional() @IsString() @MaxLength(200)
  comprobante?: string

  @IsOptional() @IsString()
  observaciones?: string
}
