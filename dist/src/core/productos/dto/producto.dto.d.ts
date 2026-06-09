export declare class CreateProductoDto {
    subcategoriaId: string;
    unidadBaseId?: string;
    nombre: string;
    descripcion?: string;
    codigoProveedor?: string;
    codigoBarras?: string;
    codigoTienda?: string;
    unidadMedida?: string;
    requiereLote?: boolean;
    metodoPicking?: string;
    alertaVencimientoDias?: number;
    porcentajeFactura?: number;
    estado?: string;
}
export declare class UpdateProductoDto {
    subcategoriaId?: string;
    unidadBaseId?: string;
    nombre?: string;
    descripcion?: string;
    codigoProveedor?: string;
    codigoBarras?: string;
    codigoTienda?: string;
    unidadMedida?: string;
    requiereLote?: boolean;
    metodoPicking?: string;
    alertaVencimientoDias?: number;
    porcentajeFactura?: number;
    estado?: string;
}
