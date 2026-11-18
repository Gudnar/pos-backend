import { Transform } from 'class-transformer'
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator'

const vacioANull = () => Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? null : value))

export class DatosNotaVentaDto {
  @IsOptional() @vacioANull() @IsString() @MaxLength(200) nombreCliente?: string
  @IsOptional() @vacioANull() @IsString() @MaxLength(30) nitCi?: string
  @IsOptional() @vacioANull() @IsString() @MaxLength(60) telefonoCliente?: string
  @IsOptional() @vacioANull() @IsString() @MaxLength(300) direccionCliente?: string
  @IsOptional() @vacioANull() @IsString() @MaxLength(50) nroPesaje?: string
  @IsOptional() @vacioANull() @IsString() @MaxLength(50) nroFactura?: string
  @IsOptional() @vacioANull() @IsString() observaciones?: string
  @IsOptional() @Transform(({ value }) => value || null) @IsUUID() contactoClienteId?: string
}

export class HojaRutaDto {
  @IsOptional() @vacioANull() @IsString() @MaxLength(200) empresaTransporte?: string
  @IsOptional() @vacioANull() @IsString() @MaxLength(200) conductor?: string
  @IsOptional() @vacioANull() @IsString() @MaxLength(30) conductorCi?: string
  @IsOptional() @vacioANull() @IsString() @MaxLength(30) conductorCelular?: string
  @IsOptional() @vacioANull() @IsString() @MaxLength(20) placa?: string
  @IsOptional() @vacioANull() @IsString() @MaxLength(150) vehiculo?: string
  @IsOptional() @vacioANull() @IsString() @MaxLength(300) origen?: string
  @IsOptional() @vacioANull() @IsString() @MaxLength(300) destino?: string
  @IsOptional() @Transform(({ value }) => value || null) @IsDateString() fechaSalida?: string
  @IsOptional() @vacioANull() @IsString() observaciones?: string
}

export class CrearComisionDto {
  @IsUUID() representanteId: string
  @IsNumber() @Min(0.01) monto: number
  @IsUUID() fuenteId: string
  @IsDateString() fecha: string
  @IsOptional() @IsString() @MaxLength(500) observaciones?: string
}
