export declare class RegistrarMovimientoDto {
    loteId: string;
    sucursalId: string;
    tipo: string;
    cantidad: number;
    unidadId?: string;
    motivo?: string;
    referenciaDocumento?: string;
    tipoDocumento?: string;
}
export declare class TransferirStockDto {
    loteId: string;
    sucursalOrigenId: string;
    sucursalDestinoId: string;
    cantidad: number;
    motivo?: string;
}
