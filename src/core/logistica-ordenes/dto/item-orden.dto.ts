import { IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator'

export class CreateItemOrdenDto {
  // Conversión: tipoCambio es el TC del paso 1; opcionalmente un segundo paso vía moneda intermedia
  @IsOptional() @IsIn(['MULTIPLICAR', 'DIVIDIR'])
  tcOperacion?: string

  @IsOptional() @IsUUID()
  monedaIntermediaId?: string | null

  @IsOptional() @IsNumber() @Min(0)
  tcPaso2?: number | null

  @IsOptional() @IsIn(['MULTIPLICAR', 'DIVIDIR'])
  tcPaso2Operacion?: string | null

  /** Total de la línea en moneda de compra (lo que dice la factura). Si viene, manda sobre el precio unitario */
  @IsOptional() @IsNumber() @Min(0)
  totalDeCompra?: number

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
  // Conversión: tipoCambio es el TC del paso 1; opcionalmente un segundo paso vía moneda intermedia
  @IsOptional() @IsIn(['MULTIPLICAR', 'DIVIDIR'])
  tcOperacion?: string

  @IsOptional() @IsUUID()
  monedaIntermediaId?: string | null

  @IsOptional() @IsNumber() @Min(0)
  tcPaso2?: number | null

  @IsOptional() @IsIn(['MULTIPLICAR', 'DIVIDIR'])
  tcPaso2Operacion?: string | null

  /** Total de la línea en moneda de compra (lo que dice la factura). Si viene, manda sobre el precio unitario */
  @IsOptional() @IsNumber() @Min(0)
  totalDeCompra?: number

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
