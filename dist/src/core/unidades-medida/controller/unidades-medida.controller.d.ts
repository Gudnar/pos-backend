import { UnidadesMedidaService } from '../service/unidades-medida.service';
import { CreateUnidadMedidaDto, UpdateUnidadMedidaDto } from '../dto/unidad-medida.dto';
export declare class UnidadesMedidaController {
    private readonly svc;
    constructor(svc: UnidadesMedidaService);
    listar(req: any): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    crear(req: any, dto: CreateUnidadMedidaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/unidad-medida.entity").UnidadMedida;
    }>;
    actualizar(req: any, id: string, dto: UpdateUnidadMedidaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/unidad-medida.entity").UnidadMedida;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
