import { LogisticaTiposGastoService } from '../service/logistica-tipos-gasto.service';
import { CreateTipoGastoLogisticaDto, UpdateTipoGastoLogisticaDto } from '../dto/tipo-gasto-logistica.dto';
export declare class LogisticaTiposGastoController {
    private readonly svc;
    constructor(svc: LogisticaTiposGastoService);
    listar(req: any, q?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/tipo-gasto-logistica.entity").TipoGastoLogistica[];
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/tipo-gasto-logistica.entity").TipoGastoLogistica;
    }>;
    crear(req: any, dto: CreateTipoGastoLogisticaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/tipo-gasto-logistica.entity").TipoGastoLogistica;
    }>;
    actualizar(req: any, id: string, dto: UpdateTipoGastoLogisticaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/tipo-gasto-logistica.entity").TipoGastoLogistica;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
