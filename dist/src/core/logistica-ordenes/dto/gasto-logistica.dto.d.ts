export declare class CreateGastoLogisticaDto {
    tcOperacion?: string;
    monedaIntermediaId?: string | null;
    tcPaso2?: number | null;
    tcPaso2Operacion?: string | null;
    tipoGastoId?: string;
    descripcion: string;
    monedaId: string;
    monto: number;
    cantidad?: number;
    tipoCambio: number;
    fechaGasto: string;
    pais?: string;
    comprobante?: string;
    observaciones?: string;
    fuenteId?: string | null;
}
export declare class UpdateGastoLogisticaDto {
    tcOperacion?: string;
    monedaIntermediaId?: string | null;
    tcPaso2?: number | null;
    tcPaso2Operacion?: string | null;
    fuenteId?: string | null;
    tipoGastoId?: string;
    descripcion?: string;
    monedaId?: string;
    monto?: number;
    cantidad?: number;
    tipoCambio?: number;
    fechaGasto?: string;
    pais?: string;
    comprobante?: string;
    observaciones?: string;
}
