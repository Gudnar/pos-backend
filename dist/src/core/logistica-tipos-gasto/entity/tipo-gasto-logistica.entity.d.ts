import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class TipoGastoLogistica extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    descripcion?: string;
    activo: boolean;
    constructor(data?: Partial<TipoGastoLogistica>);
}
