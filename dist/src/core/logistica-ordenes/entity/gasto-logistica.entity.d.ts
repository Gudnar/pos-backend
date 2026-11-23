import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class GastoLogistica extends AuditoriaEntity {
    id: string;
    clienteId: string;
    ordenImportacionId: string;
    tipoGastoId?: string;
    descripcion: string;
    monedaId: string;
    monto: number;
    cantidad: number;
    tipoCambio: number;
    tcPaso1?: number;
    tcOperacion?: string;
    monedaIntermediaId?: string | null;
    montoIntermedio?: number | null;
    tcPaso2?: number | null;
    tcPaso2Operacion?: string | null;
    montoMonedaBase?: number;
    fechaGasto: string;
    pais?: string;
    comprobante?: string;
    observaciones?: string;
    fuenteId?: string | null;
    constructor(data?: Partial<GastoLogistica>);
}
