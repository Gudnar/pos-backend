import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateMonedaDto {
  @IsString() @MaxLength(10)
  codigo: string

  @IsString() @MaxLength(100)
  nombre: string

  @IsString() @MaxLength(5)
  simbolo: string

  @IsOptional() @IsBoolean()
  esMonedaBase?: boolean

  @IsOptional() @IsString()
  estado?: string
}

export class UpdateMonedaDto {
  @IsOptional() @IsString() @MaxLength(10)
  codigo?: string

  @IsOptional() @IsString() @MaxLength(100)
  nombre?: string

  @IsOptional() @IsString() @MaxLength(5)
  simbolo?: string

  @IsOptional() @IsBoolean()
  esMonedaBase?: boolean

  @IsOptional() @IsString()
  estado?: string
}
