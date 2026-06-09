import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Producto extends AuditoriaEntity {
    id: string;
    clienteId: string;
    subcategoriaId: string;
    nombre: string;
    descripcion?: string;
    codigoProveedor?: string;
    codigoBarras?: string;
    codigoTienda?: string;
    unidadMedida?: string;
    unidadBaseId?: string;
    activo: boolean;
    requiereLote: boolean;
    metodoPicking: string;
    alertaVencimientoDias: number;
    porcentajeFactura?: number;
    constructor(data?: Partial<Producto>);
}
