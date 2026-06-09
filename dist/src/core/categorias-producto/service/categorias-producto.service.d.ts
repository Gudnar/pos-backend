import { Repository } from 'typeorm';
import { CategoriaProducto } from '../entity/categoria-producto.entity';
import { CreateCategoriaProductoDto, UpdateCategoriaProductoDto } from '../dto/categoria-producto.dto';
export declare class CategoriasProductoService {
    private readonly repo;
    constructor(repo: Repository<CategoriaProducto>);
    listar(clienteId: string, q?: string): Promise<CategoriaProducto[]>;
    obtener(clienteId: string, id: string): Promise<CategoriaProducto>;
    crear(clienteId: string, dto: CreateCategoriaProductoDto, usuarioCreacion: string): Promise<CategoriaProducto>;
    actualizar(clienteId: string, id: string, dto: UpdateCategoriaProductoDto, usuarioModificacion: string): Promise<CategoriaProducto>;
    eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
}
