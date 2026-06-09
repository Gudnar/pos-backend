import { EspecialistaService } from '../service/especialista.service';
import { CreateEspecialistaDto, UpdateEspecialistaDto } from '../dto/especialista.dto';
export declare class EspecialistaController {
    private readonly svc;
    constructor(svc: EspecialistaService);
    listar(req: any, especialidad?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/especialista.entity").Especialista[];
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/especialista.entity").Especialista;
    }>;
    crear(req: any, dto: CreateEspecialistaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/especialista.entity").Especialista;
    }>;
    actualizar(req: any, id: string, dto: UpdateEspecialistaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/especialista.entity").Especialista;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
