import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare const TipoGasto: {
    ALIMENTACION: string;
    TRANSPORTE: string;
    SERVICIOS: string;
    MANTENIMIENTO: string;
    OTROS: string;
};
export declare const CategoriaGasto: {
    PERSONAL: string;
    TRABAJO: string;
};
export declare class Gasto extends AuditoriaEntity {
    id: string;
    clienteId: string;
    sucursalId?: string;
    tipo: string;
    categoria: string;
    monto: number;
    fecha: string;
    descripcion: string;
    referencia?: string;
    constructor(data?: Partial<Gasto>);
}
