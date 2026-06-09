export declare class CreateUsuarioSistemaDto {
    usuario: string;
    contrasena: string;
    nombres: string;
    apellidos?: string;
    correoElectronico?: string;
    rol: string;
    sucursales?: string[];
    estado?: string;
}
export declare class UpdateUsuarioSistemaDto {
    nombres?: string;
    apellidos?: string;
    correoElectronico?: string;
    rol?: string;
    sucursales?: string[];
    estado?: string;
    nuevaContrasena?: string;
}
