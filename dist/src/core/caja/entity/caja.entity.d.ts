import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Caja extends AuditoriaEntity {
    id: string;
    clienteId: string;
    sucursalId: string;
    nombre: string;
    descripcion?: string;
    activo: boolean;
    constructor(data?: Partial<Caja>);
}
