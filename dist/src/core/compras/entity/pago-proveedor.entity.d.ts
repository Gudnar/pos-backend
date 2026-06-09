import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare const MetodoPagoProveedor: {
    EFECTIVO: string;
    TRANSFERENCIA: string;
    CHEQUE: string;
    QR: string;
    TARJETA: string;
};
export declare class PagoProveedor extends AuditoriaEntity {
    id: string;
    clienteId: string;
    compraId: string;
    proveedorId?: string;
    fecha: string;
    monto: number;
    metodoPago: string;
    referencia?: string;
    notas?: string;
    constructor(data?: Partial<PagoProveedor>);
}
