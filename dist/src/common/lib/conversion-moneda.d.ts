export declare const OPERACIONES_TC: readonly ["MULTIPLICAR", "DIVIDIR"];
export type OperacionTc = typeof OPERACIONES_TC[number];
export declare const aCentavos: (n: number) => number;
export interface EntradaConversion {
    tipoCambio?: number | null;
    tcOperacion?: string | null;
    monedaIntermediaId?: string | null;
    tcPaso2?: number | null;
    tcPaso2Operacion?: string | null;
}
export interface ResultadoConversion {
    tipoCambio: number;
    tcPaso1: number;
    tcOperacion: OperacionTc;
    monedaIntermediaId: string | null;
    montoIntermedio: number | null;
    tcPaso2: number | null;
    tcPaso2Operacion: OperacionTc | null;
    montoBase: number;
}
export declare function calcularConversion(total: number, e: EntradaConversion): ResultadoConversion;
export declare function camposConversion(r: ResultadoConversion): {
    tipoCambio: number;
    tcPaso1: number;
    tcOperacion: "MULTIPLICAR" | "DIVIDIR";
    monedaIntermediaId: string | null;
    montoIntermedio: number | null;
    tcPaso2: number | null;
    tcPaso2Operacion: "MULTIPLICAR" | "DIVIDIR" | null;
};
