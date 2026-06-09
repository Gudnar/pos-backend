import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class PrecioPromocional extends AuditoriaEntity {
    id: string;
    clienteId: string;
    productoId: string;
    nombre: string;
    precio: number;
    moneda: string;
    fechaInicio?: string;
    fechaFin?: string;
    habilitado: boolean;
    notas?: string;
    constructor(data?: Partial<PrecioPromocional>);
}
