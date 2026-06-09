export declare class CreateFuenteDto {
    nombre: string;
    tipo?: string;
    banco?: string;
    numeroCuenta?: string;
    monedaId?: string;
    titular?: string;
    descripcion?: string;
    saldoInicial?: number;
    activo?: boolean;
}
export declare class UpdateFuenteDto {
    nombre?: string;
    tipo?: string;
    banco?: string;
    numeroCuenta?: string;
    monedaId?: string;
    titular?: string;
    descripcion?: string;
    saldoInicial?: number;
    activo?: boolean;
}
