import { DetalleVentaDto } from './venta.dto';
export declare class CrearCotizacionDto {
    sucursalId: string;
    fecha?: string;
    validoHasta?: string;
    tipoPrecio?: string;
    contactoClienteId?: string;
    nombreCliente?: string;
    nitCi?: string;
    telefonoCliente?: string;
    observaciones?: string;
    detalles: DetalleVentaDto[];
}
export declare class AnularCotizacionDto {
    motivo?: string;
}
