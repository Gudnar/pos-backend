export declare class CreatePagoProveedorDto {
    tcOperacion?: string;
    monedaIntermediaId?: string | null;
    tcPaso2?: number | null;
    tcPaso2Operacion?: string | null;
    monedaId: string;
    monto: number;
    tipoCambio: number;
    fechaPago: string;
    metodoPago?: string;
    referencia?: string;
    observaciones?: string;
    fuenteId?: string | null;
}
export declare class UpdatePagoProveedorDto {
    tcOperacion?: string;
    monedaIntermediaId?: string | null;
    tcPaso2?: number | null;
    tcPaso2Operacion?: string | null;
    fuenteId?: string | null;
    monedaId?: string;
    monto?: number;
    tipoCambio?: number;
    fechaPago?: string;
    metodoPago?: string;
    referencia?: string;
    observaciones?: string;
}
