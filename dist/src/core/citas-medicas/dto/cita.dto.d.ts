export declare class CreatePacienteDto {
    nombre: string;
    telefono: string;
    email?: string;
}
export declare class CreateCitaDto {
    fecha: string;
    horaInicio: string;
    horaFin: string;
    servicio: string;
    pacienteNombre: string;
    pacienteTelefono: string;
    pacienteEmail?: string;
    notas?: string;
    estadoCita?: string;
    origenRegistro?: string;
    agenteId?: string;
    especialistaId?: string;
    especialistaNombre?: string;
}
export declare class UpdateCitaDto {
    fecha?: string;
    horaInicio?: string;
    horaFin?: string;
    servicio?: string;
    pacienteNombre?: string;
    pacienteTelefono?: string;
    pacienteEmail?: string;
    notas?: string;
    estadoCita?: string;
    especialistaId?: string;
    especialistaNombre?: string;
}
