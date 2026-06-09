import { Repository } from 'typeorm';
import { ItemOrdenImportacion } from '../entity/item-orden-importacion.entity';
import { CreateItemOrdenDto, UpdateItemOrdenDto } from '../dto/item-orden.dto';
export declare class ItemsOrdenService {
    private readonly repo;
    constructor(repo: Repository<ItemOrdenImportacion>);
    listar(clienteId: string, ordenId: string): Promise<ItemOrdenImportacion[]>;
    obtener(clienteId: string, ordenId: string, id: string): Promise<ItemOrdenImportacion>;
    private validarProductoUnico;
    crear(clienteId: string, ordenId: string, dto: CreateItemOrdenDto, usuarioCreacion: string): Promise<ItemOrdenImportacion>;
    actualizar(clienteId: string, ordenId: string, id: string, dto: UpdateItemOrdenDto, usuarioModificacion: string): Promise<ItemOrdenImportacion>;
    eliminar(clienteId: string, ordenId: string, id: string, usuarioModificacion: string): Promise<void>;
}
