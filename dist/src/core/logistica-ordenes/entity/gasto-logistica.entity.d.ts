import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class GastoLogistica extends AuditoriaEntity {
    id: string;
    clienteId: string;
    ordenImportacionId: string;
    tipoGastoId?: string;
    descripcion: string;
    monedaId: string;
    monto: number;
    tipoCambio: number;
    montoMonedaBase?: number;
    fechaGasto: string;
    pais?: string;
    comprobante?: string;
    observaciones?: string;
    fuenteId?: string;
    constructor(data?: Partial<GastoLogistica>);
}
