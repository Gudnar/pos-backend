import { FuentesService } from '../service/fuentes.service';
import { MovimientosFuenteService } from '../service/movimientos-fuente.service';
import { CreateFuenteDto, UpdateFuenteDto } from '../dto/fuente.dto';
import { CreateMovimientoFuenteDto, CreateTransferenciaDto, UpdateMovimientoFuenteDto } from '../dto/movimiento-fuente.dto';
export declare class FuentesController {
    private readonly fuentesSvc;
    private readonly movimientosSvc;
    constructor(fuentesSvc: FuentesService, movimientosSvc: MovimientosFuenteService);
    listar(req: any): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    resumen(req: any): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    crear(req: any, dto: CreateFuenteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/fuente.entity").Fuente;
    }>;
    actualizar(req: any, id: string, dto: UpdateFuenteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
    listarMovimientos(req: any, id: string, desde?: string, hasta?: string, tipo?: string, categoria?: string, concepto?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/movimiento-fuente.entity").MovimientoFuente[];
    }>;
    registrarMovimiento(req: any, id: string, dto: CreateMovimientoFuenteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/movimiento-fuente.entity").MovimientoFuente;
    }>;
    registrarTransferencia(req: any, id: string, dto: CreateTransferenciaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: {
            salida: import("../entity/movimiento-fuente.entity").MovimientoFuente;
            entrada: import("../entity/movimiento-fuente.entity").MovimientoFuente;
        };
    }>;
    actualizarMovimiento(req: any, id: string, movId: string, dto: UpdateMovimientoFuenteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/movimiento-fuente.entity").MovimientoFuente;
    }>;
    eliminarMovimiento(req: any, id: string, movId: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
