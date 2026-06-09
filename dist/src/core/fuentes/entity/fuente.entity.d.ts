import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
import { MovimientoFuente } from './movimiento-fuente.entity';
export declare enum TipoFuente {
    CUENTA_BANCARIA = "CUENTA_BANCARIA",
    CAJA = "CAJA",
    BILLETERA_DIGITAL = "BILLETERA_DIGITAL",
    OTRO = "OTRO"
}
export declare class Fuente extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    tipo: string;
    banco?: string;
    numeroCuenta?: string;
    monedaId?: string;
    titular?: string;
    descripcion?: string;
    saldoInicial: number;
    activo: boolean;
    movimientos?: MovimientoFuente[];
    constructor(data?: Partial<Fuente>);
}
