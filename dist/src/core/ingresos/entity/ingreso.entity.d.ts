import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare const TipoIngreso: {
    ADELANTO: string;
    CAMBIO: string;
    PAGO_SERVICIO: string;
    SUELDO: string;
};
export declare const CategoriaIngreso: {
    PERSONAL: string;
    TRABAJO: string;
};
export declare const EstadoIngreso: {
    DISPONIBLE: string;
    PARCIAL: string;
    UTILIZADO: string;
    ANULADO: string;
};
export declare class Ingreso extends AuditoriaEntity {
    id: string;
    clienteId: string;
    sucursalId?: string;
    tipo: string;
    categoria: string;
    monto: number;
    montoDisponible: number;
    estadoIngreso: string;
    fecha: string;
    descripcion?: string;
    referencia?: string;
    contactoClienteId?: string;
    nombreContacto?: string;
    constructor(data?: Partial<Ingreso>);
}
