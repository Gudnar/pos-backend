import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, IsUUID, MaxLength, ValidateNested, Min } from 'class-validator'
import { Type, Transform } from 'class-transformer'

export class EscalaPrecioDto {
  @Type(() => Number) @IsNumber() @Min(1)
  cantidadMin: number

  @IsOptional() @Type(() => Number) @IsNumber()
  cantidadMax?: number

  @Type(() => Number) @IsNumber() @Min(0)
  precio: number
}

export class CreatePrecioProductoDto {
  @IsOptional() @IsString() @MaxLength(30)
  tipo?: string

  @IsOptional() @Transform(({ value }) => value || undefined) @IsUUID()
  unidadId?: string

  @IsOptional() @IsString() @MaxLength(10)
  moneda?: string

  @IsOptional() @IsString()
  fechaVigencia?: string

  @IsOptional() @IsString()
  notas?: string

  @IsArray() @ValidateNested({ each: true }) @Type(() => EscalaPrecioDto)
  escala: EscalaPrecioDto[]
}

export class CreatePrecioPromocionalDto {
  @IsString() @MaxLength(200)
  nombre: string

  @Type(() => Number) @IsNumber()
  precio: number

  @IsOptional() @IsString() @MaxLength(10)
  moneda?: string

  @IsOptional() @IsString()
  fechaInicio?: string

  @IsOptional() @IsString()
  fechaFin?: string

  @IsOptional() @IsBoolean()
  habilitado?: boolean

  @IsOptional() @IsString()
  notas?: string
}

export class UpdatePrecioPromocionalDto {
  @IsOptional() @IsString() @MaxLength(200)
  nombre?: string

  @IsOptional() @Type(() => Number) @IsNumber()
  precio?: number

  @IsOptional() @IsString() @MaxLength(10)
  moneda?: string

  @IsOptional() @IsString()
  fechaInicio?: string

  @IsOptional() @IsString()
  fechaFin?: string

  @IsOptional() @IsBoolean()
  habilitado?: boolean

  @IsOptional() @IsString()
  notas?: string
}
