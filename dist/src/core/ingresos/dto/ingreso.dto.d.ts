export declare class CreateIngresoDto {
    tipo: string;
    categoria: string;
    monto: number;
    fecha: string;
    descripcion?: string;
    referencia?: string;
    contactoClienteId?: string;
    nombreContacto?: string;
    sucursalId?: string;
}
export declare class UpdateIngresoDto {
    descripcion?: string;
    referencia?: string;
    nombreContacto?: string;
}
