import { GastosService } from '../service/gastos.service';
import { CreateGastoDto, UpdateGastoDto } from '../dto/gasto.dto';
export declare class GastosController {
    private readonly svc;
    constructor(svc: GastosService);
    listar(req: any, tipo?: string, categoria?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/gasto.entity").Gasto[];
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/gasto.entity").Gasto;
    }>;
    crear(req: any, dto: CreateGastoDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/gasto.entity").Gasto;
    }>;
    actualizar(req: any, id: string, dto: UpdateGastoDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/gasto.entity").Gasto;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
