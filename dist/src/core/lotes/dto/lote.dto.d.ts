export declare class IngresoLoteDto {
    productoId: string;
    sucursalId: string;
    nroLote?: string;
    nroSerie?: string;
    fechaFabricacion?: string;
    fechaVencimiento?: string;
    fechaVencimientoGarantia?: string;
    proveedorId?: string;
    nroFacturaProveedor?: string;
    nroPedidoCompra?: string;
    nroRemision?: string;
    paisOrigen?: string;
    certificadoCalidad?: string;
    cantidad: number;
    unidadId?: string;
    referenciaDocumento?: string;
    notas?: string;
}
export declare class CambiarEstadoLoteDto {
    estadoLote: string;
    motivoCuarentena?: string;
}
