export declare class DatosNotaVentaDto {
    nombreCliente?: string;
    nitCi?: string;
    telefonoCliente?: string;
    direccionCliente?: string;
    nroPesaje?: string;
    nroFactura?: string;
    observaciones?: string;
    contactoClienteId?: string;
}
export declare class HojaRutaDto {
    empresaTransporte?: string;
    conductor?: string;
    conductorCi?: string;
    conductorCelular?: string;
    placa?: string;
    vehiculo?: string;
    origen?: string;
    destino?: string;
    fechaSalida?: string;
    observaciones?: string;
}
export declare class CrearComisionDto {
    representanteId: string;
    monto: number;
    fuenteId: string;
    fecha: string;
    observaciones?: string;
}
