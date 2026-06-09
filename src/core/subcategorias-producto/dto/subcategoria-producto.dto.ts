import { IsString, IsOptional, MaxLength, IsUUID } from 'class-validator'

export class CreateSubcategoriaProductoDto {
  @IsUUID()
  categoriaId: string

  @IsString() @MaxLength(200)
  nombre: string

  @IsOptional() @IsString()
  descripcion?: string

  @IsOptional() @IsString()
  estado?: string
}

export class UpdateSubcategoriaProductoDto {
  @IsOptional() @IsUUID()
  categoriaId?: string

  @IsOptional() @IsString() @MaxLength(200)
  nombre?: string

  @IsOptional() @IsString()
  descripcion?: string

  @IsOptional() @IsString()
  estado?: string
}
