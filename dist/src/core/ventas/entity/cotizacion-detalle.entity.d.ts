import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class CotizacionDetalle extends AuditoriaEntity {
    id: string;
    clienteId: string;
    cotizacionId: string;
    productoId: string;
    loteId?: string;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    orden: number;
    constructor(data?: Partial<CotizacionDetalle>);
}
