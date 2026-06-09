import { Type, Transform } from 'class-transformer'
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator'

export class DetalleVentaDto {
  @IsUUID() @IsNotEmpty()
  productoId: string

  @IsNumber() @Min(0.0001)
  cantidad: number

  @IsNumber() @Min(0)
  precioUnitario: number

  @IsOptional() @IsNumber() @Min(0)
  descuento?: number
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

export class AnularVentaDto {
  @IsOptional() @IsString()
  motivo?: string
}
