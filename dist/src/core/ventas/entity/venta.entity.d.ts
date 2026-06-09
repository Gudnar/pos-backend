import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare const EstadoVenta: {
    PENDIENTE: string;
    PAGADA: string;
    ANULADA: string;
};
export declare const MetodoPago: {
    EFECTIVO: string;
    TARJETA: string;
    QR: string;
    TRANSFERENCIA: string;
    CREDITO: string;
    ADELANTO: string;
    MIXTO: string;
};
export declare class Venta extends AuditoriaEntity {
    id: string;
    clienteId: string;
    sucursalId: string;
    cajaId?: string;
    cajaSesionId?: string;
    usuarioId: string;
    nroVenta: string;
    fecha: string;
    estadoVenta: string;
    metodoPago?: string;
    subtotal: number;
    descuento: number;
    impuesto: number;
    total: number;
    montoPagado?: number;
    cambio?: number;
    contactoClienteId?: string;
    nombreCliente?: string;
    observaciones?: string;
    adelantoId?: string;
    montoAdelanto?: number;
    constructor(data?: Partial<Venta>);
}
