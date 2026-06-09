import { LotesService } from '../service/lotes.service';
import { IngresoLoteDto, CambiarEstadoLoteDto } from '../dto/lote.dto';
export declare class LotesController {
    private readonly svc;
    constructor(svc: LotesService);
    stockResumen(req: any, sucursalId: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    listarTodos(req: any, sucursalId?: string, estadoLote?: string, search?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    reporteGeneral(req: any, sucursalId?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    historialPrecios(req: any, productoId?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    listarPorProducto(req: any, sucursalId: string, productoId: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/lote.entity").Lote[];
    }>;
    proximosAVencer(req: any, sucursalId?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/lote.entity").Lote;
    }>;
    trazabilidad(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    ingresar(req: any, dto: IngresoLoteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/lote.entity").Lote;
    }>;
    cambiarEstado(req: any, id: string, dto: CambiarEstadoLoteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/lote.entity").Lote;
    }>;
}
