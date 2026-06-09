import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, MaxLength } from 'class-validator'

export class CreateEspecialistaDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  nombre: string

  @IsArray()
  especialidades: string[]

  @IsOptional() @IsString()
  descripcion?: string

  @IsOptional() @IsString() @MaxLength(500)
  foto?: string

  @IsOptional() @IsArray()
  horarios?: Array<{ dia: string; franjas: Array<{ inicio: string; fin: string }> }>
}

export class UpdateEspecialistaDto {
  @IsOptional() @IsString() @MaxLength(200)
  nombre?: string

  @IsOptional() @IsArray()
  especialidades?: string[]

  @IsOptional() @IsString()
  descripcion?: string

  @IsOptional() @IsString() @MaxLength(500)
  foto?: string

  @IsOptional() @IsArray()
  horarios?: Array<{ dia: string; franjas: Array<{ inicio: string; fin: string }> }>

  @IsOptional() @IsBoolean()
  activo?: boolean
}
