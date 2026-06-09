import { IsString, IsNotEmpty, IsOptional, IsEmail, IsIn, MaxLength } from 'class-validator'

export class CreatePacienteDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  nombre: string

  @IsString() @IsNotEmpty() @MaxLength(30)
  telefono: string

  @IsOptional() @IsEmail() @MaxLength(150)
  email?: string

  @IsOptional() @IsString() @MaxLength(30)
  ci?: string

  @IsOptional() @IsString()
  fechaNacimiento?: string

  @IsOptional() @IsIn(['M', 'F', 'O'])
  genero?: string

  @IsOptional() @IsIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  grupoSanguineo?: string

  @IsOptional() @IsString() @MaxLength(300)
  direccion?: string

  @IsOptional() @IsString()
  alergias?: string

  @IsOptional() @IsString()
  enfermedadesCronicas?: string

  @IsOptional() @IsString()
  cirugiasPrevias?: string

  @IsOptional() @IsString()
  medicamentosActuales?: string

  @IsOptional() @IsString()
  observaciones?: string

  @IsOptional() @IsString() @MaxLength(200)
  contactoEmergenciaNombre?: string

  @IsOptional() @IsString() @MaxLength(30)
  contactoEmergenciaTelefono?: string
}

export class UpdatePacienteDto {
  @IsOptional() @IsString() @MaxLength(200)
  nombre?: string

  @IsOptional() @IsString() @MaxLength(30)
  telefono?: string

  @IsOptional() @IsEmail() @MaxLength(150)
  email?: string

  @IsOptional() @IsString() @MaxLength(30)
  ci?: string

  @IsOptional() @IsString()
  fechaNacimiento?: string

  @IsOptional() @IsIn(['M', 'F', 'O'])
  genero?: string

  @IsOptional() @IsIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  grupoSanguineo?: string

  @IsOptional() @IsString() @MaxLength(300)
  direccion?: string

  @IsOptional() @IsString()
  alergias?: string

  @IsOptional() @IsString()
  enfermedadesCronicas?: string

  @IsOptional() @IsString()
  cirugiasPrevias?: string

  @IsOptional() @IsString()
  medicamentosActuales?: string

  @IsOptional() @IsString()
  observaciones?: string

  @IsOptional() @IsString() @MaxLength(200)
  contactoEmergenciaNombre?: string

  @IsOptional() @IsString() @MaxLength(30)
  contactoEmergenciaTelefono?: string
}

export class CreateConsultaDto {
  @IsString() @IsNotEmpty()
  fecha: string

  @IsString() @IsNotEmpty()
  diagnostico: string

  @IsOptional() @IsString() @MaxLength(200)
  servicio?: string

  @IsOptional() @IsString()
  tratamiento?: string

  @IsOptional() @IsString()
  medicamentos?: string

  @IsOptional() @IsString()
  observaciones?: string

  @IsOptional() @IsString()
  proximaCita?: string

  @IsOptional() @IsString()
  citaId?: string
}

export class UpdateConsultaDto {
  @IsOptional() @IsString()
  fecha?: string

  @IsOptional() @IsString()
  diagnostico?: string

  @IsOptional() @IsString() @MaxLength(200)
  servicio?: string

  @IsOptional() @IsString()
  tratamiento?: string

  @IsOptional() @IsString()
  medicamentos?: string

  @IsOptional() @IsString()
  observaciones?: string

  @IsOptional() @IsString()
  proximaCita?: string
}
