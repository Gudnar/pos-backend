import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class SubcategoriaProducto extends AuditoriaEntity {
    id: string;
    clienteId: string;
    categoriaId: string;
    nombre: string;
    descripcion?: string;
    activo: boolean;
    constructor(data?: Partial<SubcategoriaProducto>);
}
