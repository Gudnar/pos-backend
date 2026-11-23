import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare const OrigenPagoVenta: {
    POS: string;
    ABONO: string;
};
export declare class VentaPago extends AuditoriaEntity {
    id: string;
    clienteId: string;
    ventaId: string;
    origen: string;
    fecha: string;
    metodoPago: string;
    monto: number;
    referencia?: string;
    fuenteId?: string;
    observaciones?: string;
    comprobanteNombre?: string;
    comprobanteMime?: string;
    comprobanteTamano?: number;
    comprobanteRuta?: string;
    constructor(data?: Partial<VentaPago>);
}
