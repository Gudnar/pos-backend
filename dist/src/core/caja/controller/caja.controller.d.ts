import { CajaService } from '../service/caja.service';
import { CreateCajaDto, UpdateCajaDto, AbrirSesionDto, CerrarSesionDto } from '../dto/caja.dto';
export declare class CajaController {
    private readonly svc;
    constructor(svc: CajaService);
    listar(req: any, sucursalId?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/caja.entity").Caja[];
    }>;
    crear(req: any, dto: CreateCajaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/caja.entity").Caja;
    }>;
    actualizar(req: any, id: string, dto: UpdateCajaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/caja.entity").Caja;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
    sesionActiva(req: any): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/caja-sesion.entity").CajaSesion | null;
    }>;
    sesionesDia(req: any, fecha?: string, sucursalId?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    ultimasSesiones(req: any, cajaId?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/caja-sesion.entity").CajaSesion[];
    }>;
    abrirSesion(req: any, dto: AbrirSesionDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/caja-sesion.entity").CajaSesion;
    }>;
    cerrarSesion(req: any, id: string, dto: CerrarSesionDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/caja-sesion.entity").CajaSesion;
    }>;
}
