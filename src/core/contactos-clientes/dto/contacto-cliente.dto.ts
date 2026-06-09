import { IsString, IsNotEmpty, IsOptional, IsIn, MaxLength } from 'class-validator'

export class CreateContactoClienteDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  nombre: string

  @IsOptional() @IsString() @MaxLength(200)
  empresa?: string

  @IsOptional() @IsString() @MaxLength(100)
  grupo?: string

  @IsOptional() @IsString() @MaxLength(300)
  direccion?: string

  @IsOptional() @IsString() @MaxLength(300)
  web?: string

  @IsOptional() @IsString()
  notas?: string

  @IsOptional() @IsIn(['activo', 'inactivo'])
  estado?: string
}

export class UpdateContactoClienteDto {
  @IsOptional() @IsString() @MaxLength(200)
  nombre?: string

  @IsOptional() @IsString() @MaxLength(200)
  empresa?: string

  @IsOptional() @IsString() @MaxLength(100)
  grupo?: string

  @IsOptional() @IsString() @MaxLength(300)
  direccion?: string

  @IsOptional() @IsString() @MaxLength(300)
  web?: string

  @IsOptional() @IsString()
  notas?: string

  @IsOptional() @IsIn(['activo', 'inactivo'])
  estado?: string
}
