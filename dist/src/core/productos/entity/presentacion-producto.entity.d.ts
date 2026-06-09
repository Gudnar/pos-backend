import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class PresentacionProducto extends AuditoriaEntity {
    id: string;
    clienteId: string;
    productoId: string;
    unidadId: string;
    activo: boolean;
    constructor(data?: Partial<PresentacionProducto>);
}
