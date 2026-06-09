export declare class DetalleVentaDto {
    productoId: string;
    cantidad: number;
    precioUnitario: number;
    descuento?: number;
}
export declare class CrearVentaDto {
    sucursalId: string;
    cajaId?: string;
    cajaSesionId?: string;
    metodoPago?: string;
    descuento?: number;
    impuesto?: number;
    montoPagado?: number;
    contactoClienteId?: string;
    nombreCliente?: string;
    observaciones?: string;
    adelantoId?: string;
    montoAdelanto?: number;
    detalles: DetalleVentaDto[];
}
export declare class AnularVentaDto {
    motivo?: string;
}
