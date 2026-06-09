import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
import { Fuente } from './fuente.entity';
export declare enum TipoMovimiento {
    INGRESO = "INGRESO",
    EGRESO = "EGRESO",
    TRANSFERENCIA_SALIDA = "TRANSFERENCIA_SALIDA",
    TRANSFERENCIA_ENTRADA = "TRANSFERENCIA_ENTRADA"
}
export declare enum CategoriaMovimiento {
    PAGO_PROVEEDOR = "PAGO_PROVEEDOR",
    GASTO_LOGISTICA = "GASTO_LOGISTICA",
    INGRESO_VENTA = "INGRESO_VENTA",
    RETIRO = "RETIRO",
    DEPOSITO = "DEPOSITO",
    TRANSFERENCIA = "TRANSFERENCIA",
    OTRO = "OTRO"
}
export declare class MovimientoFuente extends AuditoriaEntity {
    id: string;
    clienteId: string;
    fuenteId: string;
    fuente?: Fuente;
    tipo: string;
    concepto: string;
    referencia?: string;
    monedaId?: string;
    monto: number;
    tipoCambio: number;
    montoNativo: number;
    fecha: string;
    categoria?: string;
    origenTipo?: string;
    origenId?: string;
    fuenteDestinoId?: string;
    constructor(data?: Partial<MovimientoFuente>);
}
