import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class CompraDetalle extends AuditoriaEntity {
    id: string;
    clienteId: string;
    compraId: string;
    productoId: string;
    unidadId?: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    subtotal: number;
    nroLote?: string;
    fechaVencimiento?: string;
    loteId?: string;
    constructor(data?: Partial<CompraDetalle>);
}
