import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class OrdenImportacion extends AuditoriaEntity {
    id: string;
    clienteId: string;
    numero: string;
    paisOrigen: string;
    proveedorId?: string;
    monedaCompraId?: string;
    fechaOrden: string;
    fechaEstimadaLlegada?: string;
    fechaLlegadaReal?: string;
    metodoDistribucion: string;
    estadoOrden: string;
    observaciones?: string;
    totalProductosMonedaCompra?: number;
    totalProductosMonedaBase?: number;
    totalGastosMonedaBase?: number;
    costoTotalMonedaBase?: number;
    unidadesTotales?: number;
    tasaIva?: number;
    constructor(data?: Partial<OrdenImportacion>);
}
