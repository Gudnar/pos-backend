import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare const EstadoSesion: {
    ABIERTA: string;
    CERRADA: string;
};
export declare class CajaSesion extends AuditoriaEntity {
    id: string;
    clienteId: string;
    cajaId: string;
    sucursalId: string;
    usuarioId: string;
    estadoSesion: string;
    montoInicial: number;
    montoFinal?: number;
    totalVentas: number;
    nroVentas: number;
    fechaApertura: Date;
    fechaCierre?: Date;
    nombreUsuario?: string;
    diferencia?: number;
    observaciones?: string;
    constructor(data?: Partial<CajaSesion>);
}
