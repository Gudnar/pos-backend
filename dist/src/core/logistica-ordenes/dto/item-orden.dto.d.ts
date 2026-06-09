export declare class CreateItemOrdenDto {
    productoId?: string;
    descripcionProducto: string;
    cantidadUnidades: number;
    precioUnitarioMonedaCompra: number;
    tipoCambio: number;
    monedaCompraId?: string;
}
export declare class UpdateItemOrdenDto {
    productoId?: string;
    descripcionProducto?: string;
    cantidadUnidades?: number;
    precioUnitarioMonedaCompra?: number;
    tipoCambio?: number;
    monedaCompraId?: string;
}
