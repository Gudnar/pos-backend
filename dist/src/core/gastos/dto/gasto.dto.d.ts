export declare class CreateGastoDto {
    tipo: string;
    categoria: string;
    monto: number;
    fecha: string;
    descripcion: string;
    referencia?: string;
    sucursalId?: string;
}
export declare class UpdateGastoDto {
    tipo?: string;
    categoria?: string;
    monto?: number;
    fecha?: string;
    descripcion?: string;
    referencia?: string;
}
