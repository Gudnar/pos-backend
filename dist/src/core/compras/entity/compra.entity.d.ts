import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare const TipoCompra: {
    INICIAL: string;
    COMPRA: string;
};
export declare const EstadoCompra: {
    EN_TRANSITO: string;
    PENDIENTE: string;
    FINALIZADO: string;
    ANULADA: string;
};
export declare const EstadoPagoCompra: {
    PENDIENTE: string;
    PARCIAL: string;
    PAGADO: string;
};
export declare const CondicionMercancia: {
    BUENA: string;
    DAÑADA: string;
    PARCIAL: string;
};
export declare class Compra extends AuditoriaEntity {
    id: string;
    clienteId: string;
    sucursalId: string;
    proveedorId?: string;
    nroCompra: string;
    tipoCompra: string;
    estadoCompra: string;
    fecha: string;
    nroFactura?: string;
    fechaEnvio?: string;
    fechaEstimadaLlegada?: string;
    nroGuiaRemision?: string;
    transportista?: string;
    fechaRecepcion?: string;
    usuarioRecepcion?: string;
    condicionMercancia?: string;
    observacionesRecepcion?: string;
    fechaFinalizacion?: string;
    usuarioFinalizacion?: string;
    observacionesFinalizacion?: string;
    subtotal: number;
    descuento: number;
    total: number;
    montoPagado: number;
    estadoPago: string;
    observaciones?: string;
    constructor(data?: Partial<Compra>);
}
