import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare const EstadoLote: {
    ACTIVO: string;
    AGOTADO: string;
    VENCIDO: string;
    CUARENTENA: string;
    RETIRADO: string;
};
export declare class Lote extends AuditoriaEntity {
    id: string;
    clienteId: string;
    sucursalId: string;
    productoId: string;
    nroLote?: string;
    nroSerie?: string;
    loteInterno?: string;
    fechaFabricacion?: string;
    fechaVencimiento?: string;
    fechaIngreso: string;
    fechaVencimientoGarantia?: string;
    proveedorId?: string;
    nroFacturaProveedor?: string;
    nroPedidoCompra?: string;
    nroRemision?: string;
    paisOrigen?: string;
    certificadoCalidad?: string;
    cantidadInicial: number;
    cantidadActual: number;
    unidadId?: string;
    estadoLote: string;
    motivoCuarentena?: string;
    notas?: string;
    constructor(data?: Partial<Lote>);
}
