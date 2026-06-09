import { IsString, IsNotEmpty, IsOptional, IsIn, MaxLength } from 'class-validator'

export class CreateProveedorDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  nombre: string

  @IsOptional() @IsString() @MaxLength(200)
  empresa?: string

  @IsOptional() @IsString() @MaxLength(50)
  nit?: string

  @IsOptional() @IsString() @MaxLength(100)
  categoria?: string

  @IsOptional() @IsString() @MaxLength(300)
  direccion?: string

  @IsOptional() @IsString()
  notas?: string

  @IsOptional() @IsString() @MaxLength(20)
  color?: string

  @IsOptional() @IsIn(['activo', 'inactivo'])
  estado?: string
}

export class UpdateProveedorDto {
  @IsOptional() @IsString() @MaxLength(200)
  nombre?: string

  @IsOptional() @IsString() @MaxLength(200)
  empresa?: string

  @IsOptional() @IsString() @MaxLength(50)
  nit?: string

  @IsOptional() @IsString() @MaxLength(100)
  categoria?: string

  @IsOptional() @IsString() @MaxLength(300)
  direccion?: string

  @IsOptional() @IsString()
  notas?: string

  @IsOptional() @IsString() @MaxLength(20)
  color?: string

  @IsOptional() @IsIn(['activo', 'inactivo'])
  estado?: string
}
