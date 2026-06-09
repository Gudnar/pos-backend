import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class PaisLogistica extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    codigo?: string;
    activo: boolean;
    constructor(data?: Partial<PaisLogistica>);
}
