export declare class CreateOrdenImportacionDto {
    numero?: string;
    paisOrigen: string;
    proveedorId?: string;
    monedaCompraId?: string;
    fechaOrden: string;
    fechaEstimadaLlegada?: string;
    fechaLlegadaReal?: string;
    metodoDistribucion?: string;
    observaciones?: string;
}
export declare class UpdateOrdenImportacionDto {
    numero?: string;
    paisOrigen?: string;
    proveedorId?: string;
    monedaCompraId?: string;
    fechaOrden?: string;
    fechaEstimadaLlegada?: string;
    fechaLlegadaReal?: string;
    metodoDistribucion?: string;
    estadoOrden?: string;
    observaciones?: string;
}
export declare class PasoFormulaDto {
    operacion: string;
    valor: number;
}
export declare class RedondeoFormulaDto {
    tipo: string;
    multiplo?: number;
}
export declare class FormulaDto {
    base: string;
    pasos: PasoFormulaDto[];
    redondeo?: RedondeoFormulaDto;
}
export declare class GastoOverrideDto {
    gastoId: string;
    tipoCambio: number;
}
export declare class ComponenteFormulaDto {
    multiplicador: number;
    sumarFijo?: number;
}
export declare class ProponerPreciosDto {
    gastosParaPrecio?: string[];
    tiposCambioOverride?: GastoOverrideDto[];
    componenteCompra: ComponenteFormulaDto;
    componenteLogistica: ComponenteFormulaDto;
    ajusteFijo?: number;
    redondeo?: RedondeoFormulaDto;
}
export declare class PrecioVentaManualItemDto {
    itemId: string;
    precioVenta: number;
}
export declare class CerrarOrdenDto {
    margenPorcentaje?: number;
    formula?: FormulaDto;
    gastosParaPrecio?: string[];
    tiposCambioOverride?: GastoOverrideDto[];
    ingresarInventario?: boolean;
    sucursalId?: string;
    tasaIva?: number;
    preciosVentaManual?: PrecioVentaManualItemDto[];
}
