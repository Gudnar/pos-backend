import { Repository } from 'typeorm';
import { SubcategoriaProducto } from '../entity/subcategoria-producto.entity';
import { CreateSubcategoriaProductoDto, UpdateSubcategoriaProductoDto } from '../dto/subcategoria-producto.dto';
export declare class SubcategoriasProductoService {
    private readonly repo;
    constructor(repo: Repository<SubcategoriaProducto>);
    listar(clienteId: string, categoriaId?: string, soloActivos?: boolean): Promise<SubcategoriaProducto[]>;
    obtener(clienteId: string, id: string): Promise<SubcategoriaProducto>;
    crear(clienteId: string, dto: CreateSubcategoriaProductoDto, usuarioCreacion: string): Promise<SubcategoriaProducto>;
    actualizar(clienteId: string, id: string, dto: UpdateSubcategoriaProductoDto, usuarioModificacion: string): Promise<SubcategoriaProducto>;
    eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
}
