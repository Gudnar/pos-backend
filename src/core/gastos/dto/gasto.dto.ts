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
import { TipoGasto, CategoriaGasto } from '../entity/gasto.entity'

const tiposGasto = Object.values(TipoGasto)
const categorias = Object.values(CategoriaGasto)

export class CreateGastoDto {
  @IsNotEmpty()
  @IsIn(tiposGasto)
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

  @IsNotEmpty()
  @IsString()
  descripcion: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  referencia?: string

  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @IsUUID()
  sucursalId?: string
}

export class UpdateGastoDto {
  @IsOptional()
  @IsIn(tiposGasto)
  tipo?: string

  @IsOptional()
  @IsIn(categorias)
  categoria?: string

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  monto?: number

  @IsOptional()
  @IsDateString()
  fecha?: string

  @IsOptional()
  @IsString()
  descripcion?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  referencia?: string
}
