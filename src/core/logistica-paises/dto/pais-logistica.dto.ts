import { IsOptional, IsString, MaxLength } from 'class-validator'

export class CreatePaisLogisticaDto {
  @IsString() @MaxLength(150)
  nombre: string

  @IsOptional() @IsString() @MaxLength(5)
  codigo?: string

  @IsOptional() @IsString()
  estado?: string
}

export class UpdatePaisLogisticaDto {
  @IsOptional() @IsString() @MaxLength(150)
  nombre?: string

  @IsOptional() @IsString() @MaxLength(5)
  codigo?: string

  @IsOptional() @IsString()
  estado?: string
}
