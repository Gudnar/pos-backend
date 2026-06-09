import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class PrecioProducto extends AuditoriaEntity {
    id: string;
    clienteId: string;
    productoId: string;
    tipo: string;
    precio: number;
    moneda: string;
    fechaVigencia?: string;
    fechaFin?: string;
    unidadId?: string;
    cantidadMin: number;
    cantidadMax?: number;
    activo: boolean;
    notas?: string;
    constructor(data?: Partial<PrecioProducto>);
}
