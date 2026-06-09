import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class PagoProveedorImportacion extends AuditoriaEntity {
    id: string;
    clienteId: string;
    ordenImportacionId: string;
    monedaId: string;
    monto: number;
    tipoCambio: number;
    montoMonedaBase?: number;
    fechaPago: string;
    metodoPago: string;
    referencia?: string;
    observaciones?: string;
    fuenteId?: string;
    constructor(data?: Partial<PagoProveedorImportacion>);
}
