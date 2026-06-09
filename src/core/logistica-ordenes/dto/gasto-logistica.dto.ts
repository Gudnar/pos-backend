import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator'

export class CreateGastoLogisticaDto {
  @IsOptional() @IsUUID()
  tipoGastoId?: string

  @IsString() @MaxLength(300)
  descripcion: string

  @IsUUID()
  monedaId: string

  @IsNumber() @Min(0)
  monto: number

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
  fuenteId?: string
}

export class UpdateGastoLogisticaDto {
  @IsOptional() @IsUUID()
  fuenteId?: string

  @IsOptional() @IsUUID()
  tipoGastoId?: string

  @IsOptional() @IsString() @MaxLength(300)
  descripcion?: string

  @IsOptional() @IsUUID()
  monedaId?: string

  @IsOptional() @IsNumber() @Min(0)
  monto?: number

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
