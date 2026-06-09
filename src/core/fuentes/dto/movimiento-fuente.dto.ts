import { IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator'

const TIPOS = ['INGRESO', 'EGRESO', 'TRANSFERENCIA_SALIDA', 'TRANSFERENCIA_ENTRADA']
const CATEGORIAS = ['PAGO_PROVEEDOR', 'GASTO_LOGISTICA', 'INGRESO_VENTA', 'RETIRO', 'DEPOSITO', 'TRANSFERENCIA', 'OTRO']

export class CreateMovimientoFuenteDto {
  @IsIn(TIPOS)
  tipo: string

  @IsString() @MaxLength(500)
  concepto: string

  @IsOptional() @IsString() @MaxLength(200)
  referencia?: string

  @IsOptional() @IsUUID()
  monedaId?: string

  @IsNumber() @Min(0)
  monto: number

  @IsOptional() @IsNumber() @Min(0)
  tipoCambio?: number

  @IsDateString()
  fecha: string

  @IsOptional() @IsIn(CATEGORIAS)
  categoria?: string

  @IsOptional() @IsString() @MaxLength(100)
  origenTipo?: string

  @IsOptional() @IsUUID()
  origenId?: string

  @IsOptional() @IsUUID()
  fuenteDestinoId?: string
}

export class CreateTransferenciaDto {
  @IsUUID()
  fuenteDestinoId: string

  @IsString() @MaxLength(500)
  concepto: string

  @IsOptional() @IsString() @MaxLength(200)
  referencia?: string

  @IsOptional() @IsUUID()
  monedaId?: string

  @IsNumber() @Min(0)
  monto: number

  @IsOptional() @IsNumber() @Min(0)
  tipoCambio?: number

  @IsOptional() @IsNumber() @Min(0)
  tipoCambioDestino?: number

  @IsDateString()
  fecha: string
}

export class UpdateMovimientoFuenteDto {
  @IsOptional() @IsString() @MaxLength(500)
  concepto?: string

  @IsOptional() @IsString() @MaxLength(200)
  referencia?: string

  @IsOptional() @IsUUID()
  monedaId?: string

  @IsOptional() @IsNumber() @Min(0)
  monto?: number

  @IsOptional() @IsNumber() @Min(0)
  tipoCambio?: number

  @IsOptional() @IsDateString()
  fecha?: string

  @IsOptional() @IsIn(CATEGORIAS)
  categoria?: string
}
