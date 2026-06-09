import { MovimientosStockService } from '../service/movimientos-stock.service';
import { RegistrarMovimientoDto, TransferirStockDto } from '../dto/movimiento-stock.dto';
export declare class MovimientosStockController {
    private readonly svc;
    constructor(svc: MovimientosStockService);
    kardex(req: any, sucursalId?: string, productoId?: string, fechaDesde?: string, fechaHasta?: string, tipo?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    sinMovimiento(req: any, sucursalId?: string, dias?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    reporteRotacion(req: any, sucursalId?: string, fechaDesde?: string, fechaHasta?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    listar(req: any, sucursalId: string, productoId?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/movimiento-stock.entity").MovimientoStock[];
    }>;
    registrar(req: any, dto: RegistrarMovimientoDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/movimiento-stock.entity").MovimientoStock;
    }>;
    transferir(req: any, dto: TransferirStockDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: {
            origen: import("../entity/movimiento-stock.entity").MovimientoStock;
            destino: import("../entity/movimiento-stock.entity").MovimientoStock;
        };
    }>;
}
