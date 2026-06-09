import { Repository } from 'typeorm';
import { Proveedor } from '../entity/proveedor.entity';
import { CreateProveedorDto, UpdateProveedorDto } from '../dto/proveedor.dto';
import { RepresentantesService } from '../../representantes/service/representantes.service';
export declare class ProveedoresService {
    private readonly repo;
    private readonly repSvc;
    constructor(repo: Repository<Proveedor>, repSvc: RepresentantesService);
    listar(clienteId: string, q?: string): Promise<any[]>;
    obtener(clienteId: string, id: string): Promise<Proveedor>;
    crear(clienteId: string, dto: CreateProveedorDto, usuarioCreacion: string): Promise<Proveedor>;
    actualizar(clienteId: string, id: string, dto: UpdateProveedorDto, usuarioModificacion: string): Promise<Proveedor>;
    eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
}
