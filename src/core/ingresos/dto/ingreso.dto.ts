import { Transform } from 'class-transformer'
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator'
import { TipoIngreso, CategoriaIngreso } from '../entity/ingreso.entity'

const tiposIngreso = Object.values(TipoIngreso)
const categorias = Object.values(CategoriaIngreso)

export class CreateIngresoDto {
  @IsNotEmpty()
  @IsIn(tiposIngreso)
  tipo: string

  @IsNotEmpty()
  @IsIn(categorias)
  categoria: string

  @IsNumber()
  @Min(0.01)
  monto: number

  @IsNotEmpty()
  @IsDateString()
  fecha: string

  @IsOptional()
  @IsString()
  descripcion?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  referencia?: string

  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @IsUUID()
  contactoClienteId?: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombreContacto?: string

  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @IsUUID()
  sucursalId?: string
}

export class UpdateIngresoDto {
  @IsOptional()
  @IsString()
  descripcion?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  referencia?: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombreContacto?: string
}
