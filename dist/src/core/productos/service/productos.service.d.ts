import { Repository } from 'typeorm';
import { Producto } from '../entity/producto.entity';
import { PrecioProducto } from '../entity/precio-producto.entity';
import { CategoriaProducto } from '../../categorias-producto/entity/categoria-producto.entity';
import { SubcategoriaProducto } from '../../subcategorias-producto/entity/subcategoria-producto.entity';
import { CreateProductoDto, UpdateProductoDto } from '../dto/producto.dto';
export declare class ProductosService {
    private readonly repo;
    private readonly precioRepo;
    private readonly categoriaRepo;
    private readonly subcategoriaRepo;
    constructor(repo: Repository<Producto>, precioRepo: Repository<PrecioProducto>, categoriaRepo: Repository<CategoriaProducto>, subcategoriaRepo: Repository<SubcategoriaProducto>);
    listar(clienteId: string, subcategoriaId?: string, q?: string, soloActivos?: boolean): Promise<Producto[]>;
    obtener(clienteId: string, id: string): Promise<Producto>;
    crear(clienteId: string, dto: CreateProductoDto, usuarioCreacion: string): Promise<Producto>;
    actualizar(clienteId: string, id: string, dto: UpdateProductoDto, usuarioModificacion: string): Promise<Producto>;
    listarParaPOS(clienteId: string, q?: string): Promise<any[]>;
    eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
}
