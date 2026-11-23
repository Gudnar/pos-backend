import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare const TipoDocumentoVenta: {
    TABLILLA_PESAJE: string;
    OTROS: string;
};
export declare const TIPOS_DOCUMENTO_VENTA: string[];
export declare const TIPOS_DOCUMENTO_MULTIPLES: string[];
export declare class VentaDocumento extends AuditoriaEntity {
    id: string;
    clienteId: string;
    ventaId: string;
    tipo: string;
    nombreOriginal: string;
    mimeType: string;
    tamano: number;
    rutaArchivo: string;
    constructor(data?: Partial<VentaDocumento>);
}
