export declare class CreateCajaDto {
    nombre: string;
    descripcion?: string;
    sucursalId: string;
    activo?: boolean;
}
export declare class UpdateCajaDto {
    nombre?: string;
    descripcion?: string;
    activo?: boolean;
}
export declare class AbrirSesionDto {
    cajaId: string;
    montoInicial: number;
    observaciones?: string;
}
export declare class CerrarSesionDto {
    montoFinal: number;
    observaciones?: string;
}
