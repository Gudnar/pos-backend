import { IngresosService } from '../service/ingresos.service';
import { CreateIngresoDto, UpdateIngresoDto } from '../dto/ingreso.dto';
export declare class IngresosController {
    private readonly svc;
    constructor(svc: IngresosService);
    listar(req: any, tipo?: string, categoria?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/ingreso.entity").Ingreso[];
    }>;
    listarAdelantos(req: any, contactoClienteId?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/ingreso.entity").Ingreso[];
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/ingreso.entity").Ingreso;
    }>;
    crear(req: any, dto: CreateIngresoDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/ingreso.entity").Ingreso;
    }>;
    actualizar(req: any, id: string, dto: UpdateIngresoDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/ingreso.entity").Ingreso;
    }>;
    anular(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
