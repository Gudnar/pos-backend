import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Consulta extends AuditoriaEntity {
    id: string;
    clienteId: string;
    pacienteId: string;
    citaId?: string;
    fecha: string;
    servicio?: string;
    diagnostico: string;
    tratamiento?: string;
    medicamentos?: string;
    observaciones?: string;
    proximaCita?: string;
    constructor(data?: Partial<Consulta>);
}
