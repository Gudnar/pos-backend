import { LogisticaMonedasService } from '../service/logistica-monedas.service';
import { CreateMonedaDto, UpdateMonedaDto } from '../dto/moneda.dto';
export declare class LogisticaMonedasController {
    private readonly svc;
    constructor(svc: LogisticaMonedasService);
    listar(req: any, q?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/moneda.entity").Moneda[];
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/moneda.entity").Moneda;
    }>;
    crear(req: any, dto: CreateMonedaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/moneda.entity").Moneda;
    }>;
    actualizar(req: any, id: string, dto: UpdateMonedaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/moneda.entity").Moneda;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
    setBase(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/moneda.entity").Moneda;
    }>;
}
