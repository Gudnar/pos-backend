import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class PagoProveedorImportacion extends AuditoriaEntity {
    id: string;
    clienteId: string;
    ordenImportacionId: string;
    monedaId: string;
    monto: number;
    tipoCambio: number;
    tcPaso1?: number;
    tcOperacion?: string;
    monedaIntermediaId?: string | null;
    montoIntermedio?: number | null;
    tcPaso2?: number | null;
    tcPaso2Operacion?: string | null;
    montoMonedaBase?: number;
    fechaPago: string;
    metodoPago: string;
    referencia?: string;
    observaciones?: string;
    fuenteId?: string | null;
    constructor(data?: Partial<PagoProveedorImportacion>);
}
