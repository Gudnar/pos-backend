import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Moneda extends AuditoriaEntity {
    id: string;
    clienteId: string;
    codigo: string;
    nombre: string;
    simbolo: string;
    esMonedaBase: boolean;
    activo: boolean;
    constructor(data?: Partial<Moneda>);
}
