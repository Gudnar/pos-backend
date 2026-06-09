import { IsString, IsNotEmpty, IsOptional, IsIn, IsEmail, MaxLength } from 'class-validator'

export class CreatePacienteDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  nombre: string

  @IsString() @IsNotEmpty() @MaxLength(30)
  telefono: string

  @IsOptional() @IsEmail() @MaxLength(150)
  email?: string
}

export class CreateCitaDto {
  @IsString() @IsNotEmpty()
  fecha: string

  @IsString() @IsNotEmpty()
  horaInicio: string

  @IsString() @IsNotEmpty()
  horaFin: string

  @IsString() @IsNotEmpty() @MaxLength(200)
  servicio: string

  @IsString() @IsNotEmpty() @MaxLength(200)
  pacienteNombre: string

  @IsString() @IsNotEmpty() @MaxLength(30)
  pacienteTelefono: string

  @IsOptional() @IsString() @MaxLength(150)
  pacienteEmail?: string

  @IsOptional() @IsString()
  notas?: string

  @IsOptional() @IsIn(['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'])
  estadoCita?: string

  @IsOptional() @IsString()
  origenRegistro?: string

  @IsOptional() @IsString()
  agenteId?: string

  @IsOptional() @IsString()
  especialistaId?: string

  @IsOptional() @IsString() @MaxLength(200)
  especialistaNombre?: string
}

export class UpdateCitaDto {
  @IsOptional() @IsString()
  fecha?: string

  @IsOptional() @IsString()
  horaInicio?: string

  @IsOptional() @IsString()
  horaFin?: string

  @IsOptional() @IsString() @MaxLength(200)
  servicio?: string

  @IsOptional() @IsString() @MaxLength(200)
  pacienteNombre?: string

  @IsOptional() @IsString() @MaxLength(30)
  pacienteTelefono?: string

  @IsOptional() @IsString() @MaxLength(150)
  pacienteEmail?: string

  @IsOptional() @IsString()
  notas?: string

  @IsOptional() @IsIn(['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'])
  estadoCita?: string

  @IsOptional() @IsString()
  especialistaId?: string

  @IsOptional() @IsString() @MaxLength(200)
  especialistaNombre?: string
}
