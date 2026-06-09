import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class DetalleVenta extends AuditoriaEntity {
    id: string;
    clienteId: string;
    ventaId: string;
    productoId: string;
    loteId?: string;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    subtotal: number;
    constructor(data?: Partial<DetalleVenta>);
}
