export declare class CreateEspecialistaDto {
    nombre: string;
    especialidades: string[];
    descripcion?: string;
    foto?: string;
    horarios?: Array<{
        dia: string;
        franjas: Array<{
            inicio: string;
            fin: string;
        }>;
    }>;
}
export declare class UpdateEspecialistaDto {
    nombre?: string;
    especialidades?: string[];
    descripcion?: string;
    foto?: string;
    horarios?: Array<{
        dia: string;
        franjas: Array<{
            inicio: string;
            fin: string;
        }>;
    }>;
    activo?: boolean;
}
