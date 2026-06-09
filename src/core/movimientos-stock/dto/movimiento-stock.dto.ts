import { IsString, IsOptional, IsNumber, IsUUID, Min, IsIn } from 'class-validator'
import { Type, Transform } from 'class-transformer'

const TIPOS_VALIDOS = ['SALIDA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO', 'RETIRO', 'DEVOLUCION_PROVEEDOR', 'DEVOLUCION_CLIENTE']

export class RegistrarMovimientoDto {
  @IsUUID()
  loteId: string

  @IsUUID()
  sucursalId: string

  @IsString() @IsIn(TIPOS_VALIDOS)
  tipo: string

  @Type(() => Number) @IsNumber() @Min(0.0001)
  cantidad: number

  @IsOptional() @Transform(({ value }) => value || undefined) @IsUUID()
  unidadId?: string

  @IsOptional() @IsString()
  motivo?: string

  @IsOptional() @IsString()
  referenciaDocumento?: string

  @IsOptional() @IsString()
  tipoDocumento?: string
}

export class TransferirStockDto {
  @IsUUID()
  loteId: string

  @IsUUID()
  sucursalOrigenId: string

  @IsUUID()
  sucursalDestinoId: string

  @Type(() => Number) @IsNumber() @Min(0.0001)
  cantidad: number

  @IsOptional() @IsString()
  motivo?: string
}
