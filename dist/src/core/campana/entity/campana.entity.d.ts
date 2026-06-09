import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Campana extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    canal: string;
    origen?: string;
    descripcion?: string;
    agenteId: string;
    activa: boolean;
    constructor(data?: Partial<Campana>);
}
