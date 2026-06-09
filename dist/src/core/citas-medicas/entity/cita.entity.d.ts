import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Cita extends AuditoriaEntity {
    id: string;
    clienteId: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    servicio: string;
    pacienteNombre: string;
    pacienteTelefono: string;
    pacienteEmail?: string;
    notas?: string;
    estadoCita: string;
    origenRegistro: string;
    agenteId?: string;
    especialistaId?: string;
    especialistaNombre?: string;
    constructor(data?: Partial<Cita>);
}
