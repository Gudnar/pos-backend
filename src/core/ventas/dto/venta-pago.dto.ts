import { IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator'

export const METODOS_ABONO = ['EFECTIVO', 'TRANSFERENCIA', 'QR', 'CHEQUE', 'TARJETA']

export class RegistrarPagoVentaDto {
  @IsDateString() fecha: string
  @IsNumber() @Min(0.01) monto: number
  @IsIn(METODOS_ABONO) metodoPago: string
  @IsUUID() fuenteId: string
  @IsOptional() @IsString() @MaxLength(200) referencia?: string
  @IsOptional() @IsString() @MaxLength(500) observaciones?: string
}
