export declare class CreateItemOrdenDto {
    tcOperacion?: string;
    monedaIntermediaId?: string | null;
    tcPaso2?: number | null;
    tcPaso2Operacion?: string | null;
    totalDeCompra?: number;
    productoId?: string;
    descripcionProducto: string;
    cantidadUnidades: number;
    precioUnitarioMonedaCompra: number;
    tipoCambio: number;
    monedaCompraId?: string;
}
export declare class UpdateItemOrdenDto {
    tcOperacion?: string;
    monedaIntermediaId?: string | null;
    tcPaso2?: number | null;
    tcPaso2Operacion?: string | null;
    totalDeCompra?: number;
    productoId?: string;
    descripcionProducto?: string;
    cantidadUnidades?: number;
    precioUnitarioMonedaCompra?: number;
    tipoCambio?: number;
    monedaCompraId?: string;
}
