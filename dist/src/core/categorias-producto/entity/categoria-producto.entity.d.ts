import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class CategoriaProducto extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    descripcion?: string;
    color?: string;
    activo: boolean;
    constructor(data?: Partial<CategoriaProducto>);
}
