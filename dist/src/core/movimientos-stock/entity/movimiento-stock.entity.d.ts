import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare const TipoMovimiento: {
    INGRESO: string;
    SALIDA: string;
    TRANSFERENCIA_SALIDA: string;
    TRANSFERENCIA_ENTRADA: string;
    AJUSTE_POSITIVO: string;
    AJUSTE_NEGATIVO: string;
    RETIRO: string;
    DEVOLUCION_PROVEEDOR: string;
    DEVOLUCION_CLIENTE: string;
};
export declare class MovimientoStock extends AuditoriaEntity {
    id: string;
    clienteId: string;
    sucursalId: string;
    productoId: string;
    loteId?: string;
    unidadId?: string;
    tipo: string;
    cantidad: number;
    cantidadAnterior: number;
    cantidadPosterior: number;
    sucursalDestinoId?: string;
    loteDestinoId?: string;
    referenciaDocumento?: string;
    tipoDocumento?: string;
    motivo?: string;
    usuarioId?: string;
    constructor(data?: Partial<MovimientoStock>);
}
