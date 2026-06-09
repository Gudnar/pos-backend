import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Sucursal extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    codigo?: string;
    direccion?: string;
    ciudad?: string;
    telefono?: string;
    email?: string;
    esPrincipal: boolean;
    activo: boolean;
    constructor(data?: Partial<Sucursal>);
}
