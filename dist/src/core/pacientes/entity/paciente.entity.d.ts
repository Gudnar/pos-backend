import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Paciente extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    telefono: string;
    email?: string;
    ci?: string;
    fechaNacimiento?: string;
    genero?: string;
    grupoSanguineo?: string;
    direccion?: string;
    alergias?: string;
    enfermedadesCronicas?: string;
    cirugiasPrevias?: string;
    medicamentosActuales?: string;
    observaciones?: string;
    contactoEmergenciaNombre?: string;
    contactoEmergenciaTelefono?: string;
    origenRegistro: string;
    constructor(data?: Partial<Paciente>);
}
