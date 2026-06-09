import { SucursalesService } from '../service/sucursales.service';
import { CreateSucursalDto, UpdateSucursalDto } from '../dto/sucursal.dto';
export declare class SucursalesController {
    private readonly svc;
    constructor(svc: SucursalesService);
    listar(req: any): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/sucursal.entity").Sucursal[];
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/sucursal.entity").Sucursal;
    }>;
    crear(req: any, dto: CreateSucursalDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/sucursal.entity").Sucursal;
    }>;
    actualizar(req: any, id: string, dto: UpdateSucursalDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/sucursal.entity").Sucursal;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
