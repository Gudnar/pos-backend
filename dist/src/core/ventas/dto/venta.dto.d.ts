export declare class DetalleVentaDto {
    productoId: string;
    cantidad: number;
    precioUnitario: number;
    descuento?: number;
    loteId?: string;
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
export declare const METODOS_PAGO_POS: string[];
export declare class PagoVentaDto {
    metodoPago: string;
    monto: number;
    referencia?: string;
    adelantoId?: string;
    fuenteId?: string;
}
export declare class VentaPosDto {
    sucursalId: string;
    tipoOperacion?: string;
    fecha?: string;
    contactoClienteId?: string;
    nombreCliente?: string;
    nitCi?: string;
    telefonoCliente?: string;
    observaciones?: string;
    pagos?: PagoVentaDto[];
    registrarDeuda?: boolean;
    cotizacionId?: string;
    detalles: DetalleVentaDto[];
}
export declare class AnularVentaDto {
    motivo?: string;
}
