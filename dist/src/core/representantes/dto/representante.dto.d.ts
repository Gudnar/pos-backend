export declare class CreateRepresentanteDto {
    nombre: string;
    cargo?: string;
    telefono?: string;
    email?: string;
    fechaInicio?: string;
    reemplazarActual?: boolean;
    motivoCambio?: string;
    notas?: string;
}
export declare class UpdateRepresentanteDto {
    nombre?: string;
    cargo?: string;
    telefono?: string;
    email?: string;
    fechaInicio?: string;
    notas?: string;
}
export declare class DesactivarRepresentanteDto {
    fechaFin?: string;
    motivoCambio?: string;
}
