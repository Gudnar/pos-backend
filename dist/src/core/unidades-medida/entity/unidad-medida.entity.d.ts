import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class UnidadMedida extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    abreviacion?: string;
    esBase: boolean;
    unidadBaseId?: string;
    factorConversion: number;
    activo: boolean;
    constructor(data?: Partial<UnidadMedida>);
}
