import { IsString, IsOptional, MaxLength, IsBoolean, IsNumber, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateUnidadMedidaDto {
  @IsString() @MaxLength(100)
  nombre: string

  @IsOptional() @IsString() @MaxLength(20)
  abreviacion?: string

  @IsOptional() @IsBoolean()
  esBase?: boolean

  @IsOptional() @IsUUID()
  unidadBaseId?: string

  @IsOptional() @Type(() => Number) @IsNumber()
  factorConversion?: number

  @IsOptional() @IsString()
  estado?: string
}

export class UpdateUnidadMedidaDto {
  @IsOptional() @IsString() @MaxLength(100)
  nombre?: string

  @IsOptional() @IsString() @MaxLength(20)
  abreviacion?: string

  @IsOptional() @IsBoolean()
  esBase?: boolean

  @IsOptional() @IsUUID()
  unidadBaseId?: string

  @IsOptional() @Type(() => Number) @IsNumber()
  factorConversion?: number

  @IsOptional() @IsString()
  estado?: string
}
