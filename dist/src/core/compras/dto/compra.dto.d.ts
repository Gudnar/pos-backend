export declare class DetalleCompraDto {
    id?: string;
    productoId: string;
    unidadId?: string;
    cantidad: number;
    precioUnitario: number;
    totalCompra?: number;
    descuento?: number;
    moneda?: string;
    nroLote?: string;
    fechaVencimiento?: string;
}
export declare class CreateCompraDto {
    sucursalId: string;
    proveedorId?: string;
    tipoCompra: string;
    fecha: string;
    nroFactura?: string;
    fechaEnvio?: string;
    fechaEstimadaLlegada?: string;
    nroGuiaRemision?: string;
    transportista?: string;
    observaciones?: string;
    detalles: DetalleCompraDto[];
}
export declare class UpdateCompraDto {
    proveedorId?: string;
    fecha?: string;
    nroFactura?: string;
    fechaEnvio?: string;
    fechaEstimadaLlegada?: string;
    nroGuiaRemision?: string;
    transportista?: string;
    observaciones?: string;
}
export declare class UpdateIngresoDto {
    sucursalId?: string;
    fecha?: string;
    observaciones?: string;
    detalles: DetalleCompraDto[];
}
export declare class MarcarPendienteDto {
    fechaRecepcion: string;
    condicionMercancia?: string;
    observacionesRecepcion?: string;
}
export declare class DetalleFinalizarDto {
    id: string;
    nroLote?: string;
    fechaVencimiento?: string;
}
export declare class EditarOrdenDto {
    proveedorId?: string;
    sucursalId?: string;
    fecha?: string;
    nroFactura?: string;
    fechaEnvio?: string;
    fechaEstimadaLlegada?: string;
    nroGuiaRemision?: string;
    transportista?: string;
    observaciones?: string;
    detalles: DetalleCompraDto[];
}
export declare class FinalizarCompraDto {
    observacionesFinalizacion?: string;
    detalles: DetalleFinalizarDto[];
}
export declare class AnularCompraDto {
    motivo?: string;
}
export declare class CreatePagoProveedorDto {
    fecha: string;
    monto: number;
    metodoPago: string;
    referencia?: string;
    notas?: string;
}
