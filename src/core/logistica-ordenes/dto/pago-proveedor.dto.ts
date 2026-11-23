import { IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator'

export class CreatePagoProveedorDto {
  // Conversión: tipoCambio es el TC del paso 1; opcionalmente un segundo paso vía moneda intermedia
  @IsOptional() @IsIn(['MULTIPLICAR', 'DIVIDIR'])
  tcOperacion?: string

  @IsOptional() @IsUUID()
  monedaIntermediaId?: string | null

  @IsOptional() @IsNumber() @Min(0)
  tcPaso2?: number | null

  @IsOptional() @IsIn(['MULTIPLICAR', 'DIVIDIR'])
  tcPaso2Operacion?: string | null

  @IsUUID()
  monedaId: string

  @IsNumber() @Min(0)
  monto: number

  @IsNumber() @Min(0)
  tipoCambio: number

  @IsDateString()
  fechaPago: string

  @IsOptional() @IsIn(['TRANSFERENCIA', 'CARTA_CREDITO', 'EFECTIVO', 'OTRO'])
  metodoPago?: string

  @IsOptional() @IsString() @MaxLength(200)
  referencia?: string

  @IsOptional() @IsString()
  observaciones?: string

  @IsOptional() @IsUUID()
  fuenteId?: string | null
}

export class UpdatePagoProveedorDto {
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
  monedaId?: string

  @IsOptional() @IsNumber() @Min(0)
  monto?: number

  @IsOptional() @IsNumber() @Min(0)
  tipoCambio?: number

  @IsOptional() @IsDateString()
  fechaPago?: string

  @IsOptional() @IsIn(['TRANSFERENCIA', 'CARTA_CREDITO', 'EFECTIVO', 'OTRO'])
  metodoPago?: string

  @IsOptional() @IsString() @MaxLength(200)
  referencia?: string

  @IsOptional() @IsString()
  observaciones?: string
}
