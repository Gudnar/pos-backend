import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class VentaComision extends AuditoriaEntity {
    id: string;
    clienteId: string;
    ventaId: string;
    contactoClienteId: string;
    representanteId: string;
    beneficiarioNombre: string;
    beneficiarioCargo?: string;
    monto: number;
    fuenteId: string;
    fecha: string;
    observaciones?: string;
    constructor(data?: Partial<VentaComision>);
}
