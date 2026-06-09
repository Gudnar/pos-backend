import { UsuariosSistemaService } from '../service/usuarios-sistema.service';
import { CreateUsuarioSistemaDto, UpdateUsuarioSistemaDto } from '../dto/usuarios-sistema.dto';
export declare class UsuariosSistemaController {
    private readonly svc;
    constructor(svc: UsuariosSistemaService);
    listar(req: any): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    crear(req: any, dto: CreateUsuarioSistemaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    actualizar(req: any, id: string, dto: UpdateUsuarioSistemaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
