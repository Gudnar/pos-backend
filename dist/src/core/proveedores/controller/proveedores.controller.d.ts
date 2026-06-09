import { ProveedoresService } from '../service/proveedores.service';
import { CreateProveedorDto, UpdateProveedorDto } from '../dto/proveedor.dto';
import { RepresentantesService } from '../../representantes/service/representantes.service';
import { CreateRepresentanteDto, UpdateRepresentanteDto, DesactivarRepresentanteDto } from '../../representantes/dto/representante.dto';
export declare class ProveedoresController {
    private readonly svc;
    private readonly repSvc;
    constructor(svc: ProveedoresService, repSvc: RepresentantesService);
    private clienteIdOf;
    listar(req: any, q?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/proveedor.entity").Proveedor;
    }>;
    crear(req: any, dto: CreateProveedorDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/proveedor.entity").Proveedor;
    }>;
    actualizar(req: any, id: string, dto: UpdateProveedorDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/proveedor.entity").Proveedor;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
    listarReps(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../../representantes/entity/representante.entity").Representante[];
    }>;
    crearRep(req: any, id: string, dto: CreateRepresentanteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../../representantes/entity/representante.entity").Representante;
    }>;
    actualizarRep(req: any, repId: string, dto: UpdateRepresentanteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../../representantes/entity/representante.entity").Representante;
    }>;
    desactivarRep(req: any, repId: string, dto: DesactivarRepresentanteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../../representantes/entity/representante.entity").Representante;
    }>;
    eliminarRep(req: any, repId: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
