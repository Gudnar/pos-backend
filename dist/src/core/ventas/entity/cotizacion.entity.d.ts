import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare const EstadoCotizacion: {
    VIGENTE: string;
    CONVERTIDA: string;
    ANULADA: string;
};
export declare class Cotizacion extends AuditoriaEntity {
    id: string;
    clienteId: string;
    sucursalId: string;
    usuarioId: string;
    nroCotizacion: string;
    fecha: string;
    validoHasta?: string;
    estadoCotizacion: string;
    tipoPrecio?: string;
    contactoClienteId?: string;
    nombreCliente?: string;
    nitCi?: string;
    telefonoCliente?: string;
    observaciones?: string;
    total: number;
    ventaId?: string | null;
    fechaConversion?: Date | null;
    constructor(data?: Partial<Cotizacion>);
}
