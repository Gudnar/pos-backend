import { CategoriasProductoService } from '../service/categorias-producto.service';
import { CreateCategoriaProductoDto, UpdateCategoriaProductoDto } from '../dto/categoria-producto.dto';
export declare class CategoriasProductoController {
    private readonly svc;
    constructor(svc: CategoriasProductoService);
    listar(req: any, q?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/categoria-producto.entity").CategoriaProducto[];
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/categoria-producto.entity").CategoriaProducto;
    }>;
    crear(req: any, dto: CreateCategoriaProductoDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/categoria-producto.entity").CategoriaProducto;
    }>;
    actualizar(req: any, id: string, dto: UpdateCategoriaProductoDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/categoria-producto.entity").CategoriaProducto;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
