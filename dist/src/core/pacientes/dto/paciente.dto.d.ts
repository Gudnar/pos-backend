export declare class CreatePacienteDto {
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
}
export declare class UpdatePacienteDto {
    nombre?: string;
    telefono?: string;
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
}
export declare class CreateConsultaDto {
    fecha: string;
    diagnostico: string;
    servicio?: string;
    tratamiento?: string;
    medicamentos?: string;
    observaciones?: string;
    proximaCita?: string;
    citaId?: string;
}
export declare class UpdateConsultaDto {
    fecha?: string;
    diagnostico?: string;
    servicio?: string;
    tratamiento?: string;
    medicamentos?: string;
    observaciones?: string;
    proximaCita?: string;
}
