export declare class CreateMovimientoFuenteDto {
    tipo: string;
    concepto: string;
    referencia?: string;
    monedaId?: string;
    monto: number;
    tipoCambio?: number;
    fecha: string;
    categoria?: string;
    origenTipo?: string;
    origenId?: string;
    fuenteDestinoId?: string;
}
export declare class CreateTransferenciaDto {
    fuenteDestinoId: string;
    concepto: string;
    referencia?: string;
    monedaId?: string;
    monto: number;
    tipoCambio?: number;
    tipoCambioDestino?: number;
    fecha: string;
}
export declare class UpdateMovimientoFuenteDto {
    concepto?: string;
    referencia?: string;
    monedaId?: string;
    monto?: number;
    tipoCambio?: number;
    fecha?: string;
    categoria?: string;
}
