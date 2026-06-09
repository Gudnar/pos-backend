import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateCajaDto {
  @IsNotEmpty() @IsString() @MaxLength(100)
  nombre: string

  @IsOptional() @IsString() @MaxLength(200)
  descripcion?: string

  @IsUUID() @IsNotEmpty()
  sucursalId: string

  @IsOptional() @IsBoolean()
  activo?: boolean
}

export class UpdateCajaDto {
  @IsOptional() @IsString() @MaxLength(100)
  nombre?: string

  @IsOptional() @IsString() @MaxLength(200)
  descripcion?: string

  @IsOptional() @IsBoolean()
  activo?: boolean
}

export class AbrirSesionDto {
  @IsUUID() @IsNotEmpty()
  cajaId: string

  @IsNumber() @Min(0)
  montoInicial: number

  @IsOptional() @IsString()
  observaciones?: string
}

export class CerrarSesionDto {
  @IsNumber() @Min(0)
  montoFinal: number

  @IsOptional() @IsString()
  observaciones?: string
}
