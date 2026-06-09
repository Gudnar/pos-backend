/// <reference types="node" />
import { Repository } from 'typeorm';
import { Producto } from '../entity/producto.entity';
import { CategoriaProducto } from '../../categorias-producto/entity/categoria-producto.entity';
import { SubcategoriaProducto } from '../../subcategorias-producto/entity/subcategoria-producto.entity';
import { UnidadMedida } from '../../unidades-medida/entity/unidad-medida.entity';
export declare class ImportExportService {
    private readonly prodRepo;
    private readonly catRepo;
    private readonly subRepo;
    private readonly unidadRepo;
    constructor(prodRepo: Repository<Producto>, catRepo: Repository<CategoriaProducto>, subRepo: Repository<SubcategoriaProducto>, unidadRepo: Repository<UnidadMedida>);
    exportar(clienteId: string): Promise<Buffer>;
    importar(clienteId: string, usuarioCreacion: string, fileBuffer: Buffer): Promise<{
        importados: number;
        errores: {
            fila: number;
            error: string;
        }[];
    }>;
}
