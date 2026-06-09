import { IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator'

export class CreatePagoProveedorDto {
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
  fuenteId?: string
}

export class UpdatePagoProveedorDto {
  @IsOptional() @IsUUID()
  fuenteId?: string

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
