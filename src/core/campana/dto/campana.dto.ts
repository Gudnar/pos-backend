import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateCampanaDto {
  @IsNotEmpty()
  @IsString()
  nombre: string

  @IsNotEmpty()
  @IsString()
  canal: string

  @IsOptional()
  @IsString()
  origen?: string

  @IsOptional()
  @IsString()
  descripcion?: string

  @IsNotEmpty()
  @IsString()
  agenteId: string

  @IsOptional()
  @IsBoolean()
  activa?: boolean
}

export class UpdateCampanaDto {
  @IsOptional() @IsString()  nombre?:      string
  @IsOptional() @IsString()  canal?:       string
  @IsOptional() @IsString()  origen?:      string
  @IsOptional() @IsString()  descripcion?: string
  @IsOptional() @IsString()  agenteId?:   string
  @IsOptional() @IsBoolean() activa?:      boolean
}
