import { IsString, IsOptional, IsNumber, IsUUID, Min, IsIn } from 'class-validator'
import { Type, Transform } from 'class-transformer'

export class IngresoLoteDto {
  @IsUUID()
  productoId: string

  @IsUUID()
  sucursalId: string

  // Identificación
  @IsOptional() @IsString()
  nroLote?: string

  @IsOptional() @IsString()
  nroSerie?: string

  // Fechas
  @IsOptional() @IsString()
  fechaFabricacion?: string

  @IsOptional() @IsString()
  fechaVencimiento?: string

  @IsOptional() @IsString()
  fechaVencimientoGarantia?: string

  // Origen
  @IsOptional() @Transform(({ value }) => value || undefined) @IsUUID()
  proveedorId?: string

  @IsOptional() @IsString()
  nroFacturaProveedor?: string

  @IsOptional() @IsString()
  nroPedidoCompra?: string

  @IsOptional() @IsString()
  nroRemision?: string

  @IsOptional() @IsString()
  paisOrigen?: string

  @IsOptional() @IsString()
  certificadoCalidad?: string

  // Cantidad
  @Type(() => Number) @IsNumber() @Min(0.0001)
  cantidad: number

  @IsOptional() @Transform(({ value }) => value || undefined) @IsUUID()
  unidadId?: string

  @IsOptional() @IsString()
  referenciaDocumento?: string

  @IsOptional() @IsString()
  notas?: string
}

export class CambiarEstadoLoteDto {
  @IsString() @IsIn(['ACTIVO', 'CUARENTENA', 'RETIRADO'])
  estadoLote: string

  @IsOptional() @IsString()
  motivoCuarentena?: string
}
