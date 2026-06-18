import {
  IsString, IsNotEmpty, IsOptional, IsIn, IsUUID, IsNumber, IsArray,
  ValidateNested, Min, IsDateString,
} from 'class-validator'
import { Type } from 'class-transformer'

export class DetalleCompraDto {
  @IsOptional() @IsUUID()
  id?: string

  @IsUUID()
  productoId: string

  @IsOptional() @IsUUID()
  unidadId?: string

  @IsNumber() @Min(0.0001)
  cantidad: number

  @IsNumber() @Min(0)
  precioUnitario: number

  @IsOptional() @IsNumber() @Min(0)
  totalCompra?: number

  @IsOptional() @IsNumber() @Min(0)
  descuento?: number

  @IsOptional() @IsString()
  moneda?: string

  @IsOptional() @IsString()
  nroLote?: string

  @IsOptional() @IsString()
  fechaVencimiento?: string
}

export class CreateCompraDto {
  @IsUUID()
  sucursalId: string

  @IsOptional() @IsUUID()
  proveedorId?: string

  @IsIn(['INICIAL', 'COMPRA'])
  tipoCompra: string

  @IsDateString()
  fecha: string

  @IsOptional() @IsString()
  nroFactura?: string

  @IsOptional() @IsDateString()
  fechaEnvio?: string

  @IsOptional() @IsDateString()
  fechaEstimadaLlegada?: string

  @IsOptional() @IsString()
  nroGuiaRemision?: string

  @IsOptional() @IsString()
  transportista?: string

  @IsOptional() @IsString()
  observaciones?: string

  @IsArray() @ValidateNested({ each: true }) @Type(() => DetalleCompraDto)
  detalles: DetalleCompraDto[]
}

export class UpdateCompraDto {
  @IsOptional() @IsUUID()
  proveedorId?: string

  @IsOptional() @IsDateString()
  fecha?: string

  @IsOptional() @IsString()
  nroFactura?: string

  @IsOptional() @IsDateString()
  fechaEnvio?: string

  @IsOptional() @IsDateString()
  fechaEstimadaLlegada?: string

  @IsOptional() @IsString()
  nroGuiaRemision?: string

  @IsOptional() @IsString()
  transportista?: string

  @IsOptional() @IsString()
  observaciones?: string
}

export class UpdateIngresoDto {
  @IsOptional() @IsUUID()
  sucursalId?: string

  @IsOptional() @IsDateString()
  fecha?: string

  @IsOptional() @IsString()
  observaciones?: string

  @IsArray() @ValidateNested({ each: true }) @Type(() => DetalleCompraDto)
  detalles: DetalleCompraDto[]
}

// EN_TRANSITO → PENDIENTE: goods arrived at warehouse
export class MarcarPendienteDto {
  @IsDateString()
  fechaRecepcion: string

  @IsOptional() @IsIn(['BUENA', 'DAÑADA', 'PARCIAL'])
  condicionMercancia?: string

  @IsOptional() @IsString()
  observacionesRecepcion?: string
}

// Per-item lot info for finalization
export class DetalleFinalizarDto {
  @IsUUID()
  id: string

  @IsOptional() @IsString()
  nroLote?: string

  @IsOptional() @IsString()
  fechaVencimiento?: string
}

// Edit order in EN_TRANSITO or PENDIENTE state (header + items, no stock involved)
export class EditarOrdenDto {
  @IsOptional() @IsUUID()
  proveedorId?: string

  @IsOptional() @IsUUID()
  sucursalId?: string

  @IsOptional() @IsDateString()
  fecha?: string

  @IsOptional() @IsString()
  nroFactura?: string

  @IsOptional() @IsDateString()
  fechaEnvio?: string

  @IsOptional() @IsDateString()
  fechaEstimadaLlegada?: string

  @IsOptional() @IsString()
  nroGuiaRemision?: string

  @IsOptional() @IsString()
  transportista?: string

  @IsOptional() @IsString()
  observaciones?: string

  @IsArray() @ValidateNested({ each: true }) @Type(() => DetalleCompraDto)
  detalles: DetalleCompraDto[]
}

// PENDIENTE → FINALIZADO: assign lots and update stock
export class FinalizarCompraDto {
  @IsOptional() @IsString()
  observacionesFinalizacion?: string

  @IsArray() @ValidateNested({ each: true }) @Type(() => DetalleFinalizarDto)
  detalles: DetalleFinalizarDto[]
}

export class AnularCompraDto {
  @IsOptional() @IsString()
  motivo?: string
}

export class CreatePagoProveedorDto {
  @IsDateString()
  fecha: string

  @IsNumber() @Min(0.01)
  monto: number

  @IsIn(['EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'QR', 'TARJETA'])
  metodoPago: string

  @IsOptional() @IsString()
  referencia?: string

  @IsOptional() @IsString()
  notas?: string
}
