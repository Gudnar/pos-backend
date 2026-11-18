import { Type, Transform } from 'class-transformer'
import { ArrayMinSize, IsArray, IsBoolean, IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator'

export class DetalleVentaDto {
  @IsUUID() @IsNotEmpty()
  productoId: string

  @IsNumber() @Min(0.0001)
  cantidad: number

  @IsNumber() @Min(0)
  precioUnitario: number

  @IsOptional() @IsNumber() @Min(0)
  descuento?: number

  // Lote elegido en el POS; si no se envía se aplica el método de picking del producto
  @IsOptional() @Transform(({ value }) => value || undefined) @IsUUID()
  loteId?: string
}

export class CrearVentaDto {
  @IsUUID() @IsNotEmpty()
  sucursalId: string

  @IsOptional() @Transform(({ value }) => value || undefined) @IsUUID()
  cajaId?: string

  @IsOptional() @Transform(({ value }) => value || undefined) @IsUUID()
  cajaSesionId?: string

  @IsOptional() @IsIn(['EFECTIVO', 'TARJETA', 'QR', 'TRANSFERENCIA', 'CREDITO', 'MIXTO'])
  metodoPago?: string

  @IsOptional() @IsNumber() @Min(0)
  descuento?: number

  @IsOptional() @IsNumber() @Min(0)
  impuesto?: number

  @IsOptional() @IsNumber() @Min(0)
  montoPagado?: number

  @IsOptional() @Transform(({ value }) => value || undefined) @IsUUID()
  contactoClienteId?: string

  @IsOptional() @IsString()
  nombreCliente?: string

  @IsOptional() @IsString()
  observaciones?: string

  @IsOptional() @Transform(({ value }) => value || undefined) @IsUUID()
  adelantoId?: string

  @IsOptional() @IsNumber() @Min(0)
  montoAdelanto?: number

  @IsArray() @ValidateNested({ each: true }) @Type(() => DetalleVentaDto)
  detalles: DetalleVentaDto[]
}

export const METODOS_PAGO_POS = ['EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'QR', 'TARJETA', 'ADELANTO']

export class PagoVentaDto {
  @IsIn(METODOS_PAGO_POS)
  metodoPago: string

  @IsNumber() @Min(0)
  monto: number

  @IsOptional() @IsString()
  referencia?: string

  @IsOptional() @Transform(({ value }) => value || undefined) @IsUUID()
  adelantoId?: string
}

/** Venta registrada desde el POS: con cobro (uno o varios métodos) o sin cobro (deuda). */
export class VentaPosDto {
  @IsUUID() @IsNotEmpty()
  sucursalId: string

  @IsOptional() @IsIn(['VENTA', 'COTIZACION'])
  tipoOperacion?: string

  @IsOptional() @Transform(({ value }) => value || undefined) @IsDateString()
  fecha?: string

  @IsOptional() @Transform(({ value }) => value || undefined) @IsUUID()
  contactoClienteId?: string

  @IsOptional() @IsString()
  nombreCliente?: string

  @IsOptional() @IsString()
  nitCi?: string

  @IsOptional() @IsString()
  telefonoCliente?: string

  @IsOptional() @IsString()
  observaciones?: string

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PagoVentaDto)
  pagos?: PagoVentaDto[]

  @IsOptional() @IsBoolean()
  registrarDeuda?: boolean

  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => DetalleVentaDto)
  detalles: DetalleVentaDto[]
}

export class AnularVentaDto {
  @IsOptional() @IsString()
  motivo?: string
}
