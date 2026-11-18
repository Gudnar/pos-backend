import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class VentaHojaRuta extends AuditoriaEntity {
    id: string;
    clienteId: string;
    ventaId: string;
    nroHojaRuta: number;
    empresaTransporte?: string;
    conductor?: string;
    conductorCi?: string;
    conductorCelular?: string;
    placa?: string;
    vehiculo?: string;
    origen?: string;
    destino?: string;
    fechaSalida?: string;
    observaciones?: string;
    constructor(data?: Partial<VentaHojaRuta>);
}
