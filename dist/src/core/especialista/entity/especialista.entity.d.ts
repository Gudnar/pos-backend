import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Especialista extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    especialidades: string[];
    descripcion?: string;
    foto?: string;
    horarios: Array<{
        dia: string;
        franjas: Array<{
            inicio: string;
            fin: string;
        }>;
    }>;
    activo: boolean;
    constructor(data?: Partial<Especialista>);
}
