import { IsString, IsOptional, MaxLength, IsBoolean, IsEmail } from 'class-validator'

export class CreateSucursalDto {
  @IsString() @MaxLength(200)
  nombre: string

  @IsOptional() @IsString() @MaxLength(20)
  codigo?: string

  @IsOptional() @IsString() @MaxLength(300)
  direccion?: string

  @IsOptional() @IsString() @MaxLength(100)
  ciudad?: string

  @IsOptional() @IsString() @MaxLength(50)
  telefono?: string

  @IsOptional() @IsEmail() @MaxLength(150)
  email?: string

  @IsOptional() @IsBoolean()
  esPrincipal?: boolean

  @IsOptional() @IsString()
  estado?: string
}

export class UpdateSucursalDto {
  @IsOptional() @IsString() @MaxLength(200)
  nombre?: string

  @IsOptional() @IsString() @MaxLength(20)
  codigo?: string

  @IsOptional() @IsString() @MaxLength(300)
  direccion?: string

  @IsOptional() @IsString() @MaxLength(100)
  ciudad?: string

  @IsOptional() @IsString() @MaxLength(50)
  telefono?: string

  @IsOptional() @IsEmail() @MaxLength(150)
  email?: string

  @IsOptional() @IsBoolean()
  esPrincipal?: boolean

  @IsOptional() @IsString()
  estado?: string
}
