import { LogisticaPaisesService } from '../service/logistica-paises.service';
import { CreatePaisLogisticaDto, UpdatePaisLogisticaDto } from '../dto/pais-logistica.dto';
export declare class LogisticaPaisesController {
    private readonly svc;
    constructor(svc: LogisticaPaisesService);
    listar(req: any, q?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/pais-logistica.entity").PaisLogistica[];
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/pais-logistica.entity").PaisLogistica;
    }>;
    crear(req: any, dto: CreatePaisLogisticaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/pais-logistica.entity").PaisLogistica;
    }>;
    actualizar(req: any, id: string, dto: UpdatePaisLogisticaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/pais-logistica.entity").PaisLogistica;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
