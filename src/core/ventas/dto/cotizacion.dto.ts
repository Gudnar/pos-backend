import { Type, Transform } from 'class-transformer'
import { ArrayMinSize, IsArray, IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'
import { DetalleVentaDto } from './venta.dto'

export class CrearCotizacionDto {
  @IsUUID() @IsNotEmpty()
  sucursalId: string

  @IsOptional() @Transform(({ value }) => value || undefined) @IsDateString()
  fecha?: string

  @IsOptional() @Transform(({ value }) => value || undefined) @IsDateString()
  validoHasta?: string

  @IsOptional() @IsIn(['SF', 'CF', 'OFERTA'])
  tipoPrecio?: string

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

  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => DetalleVentaDto)
  detalles: DetalleVentaDto[]
}

export class AnularCotizacionDto {
  @IsOptional() @IsString()
  motivo?: string
}
