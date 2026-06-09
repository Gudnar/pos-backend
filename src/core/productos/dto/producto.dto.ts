import { IsString, IsOptional, MaxLength, IsUUID, IsBoolean, IsInt, IsNumber, Min, IsIn } from 'class-validator'
import { Transform, Type } from 'class-transformer'

export class CreateProductoDto {
  @IsUUID()
  subcategoriaId: string

  @IsOptional() @Transform(({ value }) => value || undefined) @IsUUID()
  unidadBaseId?: string

  @IsString() @MaxLength(200)
  nombre: string

  @IsOptional() @IsString()
  descripcion?: string

  @IsOptional() @IsString() @MaxLength(100)
  codigoProveedor?: string

  @IsOptional() @IsString() @MaxLength(100)
  codigoBarras?: string

  @IsOptional() @IsString() @MaxLength(100)
  codigoTienda?: string

  @IsOptional() @IsString() @MaxLength(50)
  unidadMedida?: string

  @IsOptional() @IsBoolean()
  requiereLote?: boolean

  @IsOptional() @IsString() @IsIn(['FIFO', 'FEFO', 'LIFO'])
  metodoPicking?: string

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  alertaVencimientoDias?: number

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  porcentajeFactura?: number

  @IsOptional() @IsString()
  estado?: string
}

export class UpdateProductoDto {
  @IsOptional() @IsUUID()
  subcategoriaId?: string

  @IsOptional() @Transform(({ value }) => value || undefined) @IsUUID()
  unidadBaseId?: string

  @IsOptional() @IsString() @MaxLength(200)
  nombre?: string

  @IsOptional() @IsString()
  descripcion?: string

  @IsOptional() @IsString() @MaxLength(100)
  codigoProveedor?: string

  @IsOptional() @IsString() @MaxLength(100)
  codigoBarras?: string

  @IsOptional() @IsString() @MaxLength(100)
  codigoTienda?: string

  @IsOptional() @IsString() @MaxLength(50)
  unidadMedida?: string

  @IsOptional() @IsBoolean()
  requiereLote?: boolean

  @IsOptional() @IsString() @IsIn(['FIFO', 'FEFO', 'LIFO'])
  metodoPicking?: string

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  alertaVencimientoDias?: number

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  porcentajeFactura?: number

  @IsOptional() @IsString()
  estado?: string
}
