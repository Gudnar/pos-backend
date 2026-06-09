import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Proveedor extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    empresa?: string;
    nit?: string;
    categoria?: string;
    direccion?: string;
    notas?: string;
    color?: string;
    activo: boolean;
    constructor(data?: Partial<Proveedor>);
}
