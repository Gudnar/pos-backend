import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class ContactoCliente extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    empresa?: string;
    grupo?: string;
    direccion?: string;
    web?: string;
    notas?: string;
    activo: boolean;
    constructor(data?: Partial<ContactoCliente>);
}
