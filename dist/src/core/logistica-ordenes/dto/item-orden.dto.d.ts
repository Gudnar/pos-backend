export declare class CreateItemOrdenDto {
    totalDeCompra?: number;
    productoId?: string;
    descripcionProducto: string;
    cantidadUnidades: number;
    precioUnitarioMonedaCompra: number;
    tipoCambio: number;
    monedaCompraId?: string;
}
export declare class UpdateItemOrdenDto {
    totalDeCompra?: number;
    productoId?: string;
    descripcionProducto?: string;
    cantidadUnidades?: number;
    precioUnitarioMonedaCompra?: number;
    tipoCambio?: number;
    monedaCompraId?: string;
}
