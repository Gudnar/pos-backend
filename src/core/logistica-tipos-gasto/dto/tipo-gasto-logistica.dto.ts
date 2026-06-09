import { IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateTipoGastoLogisticaDto {
  @IsString() @MaxLength(200)
  nombre: string

  @IsOptional() @IsString()
  descripcion?: string

  @IsOptional() @IsString()
  estado?: string
}

export class UpdateTipoGastoLogisticaDto {
  @IsOptional() @IsString() @MaxLength(200)
  nombre?: string

  @IsOptional() @IsString()
  descripcion?: string

  @IsOptional() @IsString()
  estado?: string
}
