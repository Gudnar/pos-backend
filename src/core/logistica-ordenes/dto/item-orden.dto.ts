import { IsInt, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator'

export class CreateItemOrdenDto {
  @IsOptional() @IsUUID()
  productoId?: string

  @IsString() @MaxLength(300)
  descripcionProducto: string

  @IsInt() @Min(1)
  cantidadUnidades: number

  @IsNumber() @Min(0)
  precioUnitarioMonedaCompra: number

  @IsNumber() @Min(0)
  tipoCambio: number

  @IsOptional() @IsUUID()
  monedaCompraId?: string
}

export class UpdateItemOrdenDto {
  @IsOptional() @IsUUID()
  productoId?: string

  @IsOptional() @IsString() @MaxLength(300)
  descripcionProducto?: string

  @IsOptional() @IsInt() @Min(1)
  cantidadUnidades?: number

  @IsOptional() @IsNumber() @Min(0)
  precioUnitarioMonedaCompra?: number

  @IsOptional() @IsNumber() @Min(0)
  tipoCambio?: number

  @IsOptional() @IsUUID()
  monedaCompraId?: string
}
