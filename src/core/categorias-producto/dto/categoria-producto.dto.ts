import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator'

export class CreateCategoriaProductoDto {
  @IsString() @MaxLength(200)
  nombre: string

  @IsOptional() @IsString()
  descripcion?: string

  @IsOptional() @IsString() @MaxLength(20)
  color?: string

  @IsOptional() @IsString()
  estado?: string
}

export class UpdateCategoriaProductoDto {
  @IsOptional() @IsString() @MaxLength(200)
  nombre?: string

  @IsOptional() @IsString()
  descripcion?: string

  @IsOptional() @IsString() @MaxLength(20)
  color?: string

  @IsOptional() @IsString()
  estado?: string
}
