export declare class CreateGastoLogisticaDto {
    tipoGastoId?: string;
    descripcion: string;
    monedaId: string;
    monto: number;
    tipoCambio: number;
    fechaGasto: string;
    pais?: string;
    comprobante?: string;
    observaciones?: string;
    fuenteId?: string;
}
export declare class UpdateGastoLogisticaDto {
    fuenteId?: string;
    tipoGastoId?: string;
    descripcion?: string;
    monedaId?: string;
    monto?: number;
    tipoCambio?: number;
    fechaGasto?: string;
    pais?: string;
    comprobante?: string;
    observaciones?: string;
}
