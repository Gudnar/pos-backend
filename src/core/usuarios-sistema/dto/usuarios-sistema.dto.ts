import { IsString, IsOptional, MaxLength, IsArray, IsUUID, IsIn } from 'class-validator'

const ROLES_PERMITIDOS = ['ADMIN_CLIENTE', 'ENCARGADO', 'CAJERO', 'VENDEDOR', 'COLABORADOR']

export class CreateUsuarioSistemaDto {
  @IsString() @MaxLength(100)
  usuario: string

  @IsString()
  contrasena: string

  @IsString() @MaxLength(150)
  nombres: string

  @IsOptional() @IsString() @MaxLength(150)
  apellidos?: string

  @IsOptional() @IsString() @MaxLength(150)
  correoElectronico?: string

  @IsString() @IsIn(ROLES_PERMITIDOS)
  rol: string

  @IsOptional() @IsArray() @IsUUID('all', { each: true })
  sucursales?: string[]

  @IsOptional() @IsString()
  estado?: string
}

export class UpdateUsuarioSistemaDto {
  @IsOptional() @IsString() @MaxLength(150)
  nombres?: string

  @IsOptional() @IsString() @MaxLength(150)
  apellidos?: string

  @IsOptional() @IsString() @MaxLength(150)
  correoElectronico?: string

  @IsOptional() @IsString() @IsIn([...ROLES_PERMITIDOS])
  rol?: string

  @IsOptional() @IsArray() @IsUUID('all', { each: true })
  sucursales?: string[]

  @IsOptional() @IsString()
  estado?: string

  @IsOptional() @IsString()
  nuevaContrasena?: string
}
