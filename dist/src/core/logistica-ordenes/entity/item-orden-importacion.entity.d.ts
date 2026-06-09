import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class ItemOrdenImportacion extends AuditoriaEntity {
    id: string;
    clienteId: string;
    ordenImportacionId: string;
    productoId?: string;
    descripcionProducto: string;
    cantidadUnidades: number;
    precioUnitarioMonedaCompra: number;
    tipoCambio: number;
    monedaCompraId?: string;
    precioUnitarioMonedaBase?: number;
    subtotalMonedaCompra?: number;
    subtotalMonedaBase?: number;
    costoLogisticaAsignado?: number;
    costoTotalUnitario?: number;
    margenAplicado?: number;
    precioVentaSugerido?: number;
    constructor(data?: Partial<ItemOrdenImportacion>);
}
