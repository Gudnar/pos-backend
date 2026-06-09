import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator'

const TIPOS = ['CUENTA_BANCARIA', 'CAJA', 'BILLETERA_DIGITAL', 'OTRO']

export class CreateFuenteDto {
  @IsString() @MaxLength(200)
  nombre: string

  @IsOptional() @IsIn(TIPOS)
  tipo?: string

  @IsOptional() @IsString() @MaxLength(100)
  banco?: string

  @IsOptional() @IsString() @MaxLength(100)
  numeroCuenta?: string

  @IsOptional() @IsUUID()
  monedaId?: string

  @IsOptional() @IsString() @MaxLength(200)
  titular?: string

  @IsOptional() @IsString()
  descripcion?: string

  @IsOptional() @IsNumber() @Min(0)
  saldoInicial?: number

  @IsOptional() @IsBoolean()
  activo?: boolean
}

export class UpdateFuenteDto {
  @IsOptional() @IsString() @MaxLength(200)
  nombre?: string

  @IsOptional() @IsIn(TIPOS)
  tipo?: string

  @IsOptional() @IsString() @MaxLength(100)
  banco?: string

  @IsOptional() @IsString() @MaxLength(100)
  numeroCuenta?: string

  @IsOptional() @IsUUID()
  monedaId?: string

  @IsOptional() @IsString() @MaxLength(200)
  titular?: string

  @IsOptional() @IsString()
  descripcion?: string

  @IsOptional() @IsNumber() @Min(0)
  saldoInicial?: number

  @IsOptional() @IsBoolean()
  activo?: boolean
}
