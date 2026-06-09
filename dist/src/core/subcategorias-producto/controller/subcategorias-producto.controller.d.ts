import { SubcategoriasProductoService } from '../service/subcategorias-producto.service';
import { CreateSubcategoriaProductoDto, UpdateSubcategoriaProductoDto } from '../dto/subcategoria-producto.dto';
export declare class SubcategoriasProductoController {
    private readonly svc;
    constructor(svc: SubcategoriasProductoService);
    listar(req: any, categoriaId?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/subcategoria-producto.entity").SubcategoriaProducto[];
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/subcategoria-producto.entity").SubcategoriaProducto;
    }>;
    crear(req: any, dto: CreateSubcategoriaProductoDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/subcategoria-producto.entity").SubcategoriaProducto;
    }>;
    actualizar(req: any, id: string, dto: UpdateSubcategoriaProductoDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/subcategoria-producto.entity").SubcategoriaProducto;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
