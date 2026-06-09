export declare class CreatePagoProveedorDto {
    monedaId: string;
    monto: number;
    tipoCambio: number;
    fechaPago: string;
    metodoPago?: string;
    referencia?: string;
    observaciones?: string;
    fuenteId?: string;
}
export declare class UpdatePagoProveedorDto {
    fuenteId?: string;
    monedaId?: string;
    monto?: number;
    tipoCambio?: number;
    fechaPago?: string;
    metodoPago?: string;
    referencia?: string;
    observaciones?: string;
}
