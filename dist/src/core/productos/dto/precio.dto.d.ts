export declare class EscalaPrecioDto {
    cantidadMin: number;
    cantidadMax?: number;
    precio: number;
}
export declare class CreatePrecioProductoDto {
    tipo?: string;
    unidadId?: string;
    moneda?: string;
    fechaVigencia?: string;
    notas?: string;
    escala: EscalaPrecioDto[];
}
export declare class CreatePrecioPromocionalDto {
    nombre: string;
    precio: number;
    moneda?: string;
    fechaInicio?: string;
    fechaFin?: string;
    habilitado?: boolean;
    notas?: string;
}
export declare class UpdatePrecioPromocionalDto {
    nombre?: string;
    precio?: number;
    moneda?: string;
    fechaInicio?: string;
    fechaFin?: string;
    habilitado?: boolean;
    notas?: string;
}
