import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Representante extends AuditoriaEntity {
    id: string;
    clienteId: string;
    tipo: string;
    entidadId: string;
    nombre: string;
    cargo?: string;
    telefono?: string;
    email?: string;
    activo: boolean;
    fechaInicio?: string;
    fechaFin?: string;
    motivoCambio?: string;
    notas?: string;
    constructor(data?: Partial<Representante>);
}
