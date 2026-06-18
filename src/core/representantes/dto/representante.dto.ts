import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, MaxLength, ValidateIf } from 'class-validator'

export class CreateRepresentanteDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  nombre: string

  @IsOptional() @IsString() @MaxLength(150)
  cargo?: string

  @IsOptional() @IsString() @MaxLength(30)
  telefono?: string

  @IsOptional() @ValidateIf(o => !!o.email) @IsEmail() @MaxLength(150)
  email?: string

  @IsOptional() @IsString() @MaxLength(10)
  fechaInicio?: string

  @IsOptional() @IsBoolean()
  reemplazarActual?: boolean

  @IsOptional() @IsString()
  motivoCambio?: string

  @IsOptional() @IsString()
  notas?: string
}

export class UpdateRepresentanteDto {
  @IsOptional() @IsString() @MaxLength(200)
  nombre?: string

  @IsOptional() @IsString() @MaxLength(150)
  cargo?: string

  @IsOptional() @IsString() @MaxLength(30)
  telefono?: string

  @IsOptional() @ValidateIf(o => !!o.email) @IsEmail() @MaxLength(150)
  email?: string

  @IsOptional() @IsString() @MaxLength(10)
  fechaInicio?: string

  @IsOptional() @IsString()
  notas?: string
}

export class DesactivarRepresentanteDto {
  @IsOptional() @IsString() @MaxLength(10)
  fechaFin?: string

  @IsOptional() @IsString()
  motivoCambio?: string
}
