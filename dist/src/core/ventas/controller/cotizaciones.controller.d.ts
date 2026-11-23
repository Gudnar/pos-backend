import { CotizacionesService } from '../service/cotizaciones.service';
import { CrearCotizacionDto, AnularCotizacionDto } from '../dto/cotizacion.dto';
export declare class CotizacionesController {
    private readonly svc;
    constructor(svc: CotizacionesService);
    listar(req: any, sucursalId?: string, fechaDesde?: string, fechaHasta?: string, estado?: string, nombreCliente?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    crear(req: any, dto: CrearCotizacionDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/cotizacion.entity").Cotizacion;
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    impresion(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    anular(req: any, id: string, dto: AnularCotizacionDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/cotizacion.entity").Cotizacion;
    }>;
}
