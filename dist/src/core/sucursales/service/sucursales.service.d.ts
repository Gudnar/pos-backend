import { Repository } from 'typeorm';
import { Sucursal } from '../entity/sucursal.entity';
import { UsuarioSucursal } from '../entity/usuario-sucursal.entity';
import { CreateSucursalDto, UpdateSucursalDto } from '../dto/sucursal.dto';
export declare class SucursalesService {
    private readonly repo;
    private readonly asignacionRepo;
    constructor(repo: Repository<Sucursal>, asignacionRepo: Repository<UsuarioSucursal>);
    listar(clienteId: string): Promise<Sucursal[]>;
    obtener(clienteId: string, id: string): Promise<Sucursal>;
    crear(clienteId: string, dto: CreateSucursalDto, usuarioCreacion: string): Promise<Sucursal>;
    actualizar(clienteId: string, id: string, dto: UpdateSucursalDto, usuarioModificacion: string): Promise<Sucursal>;
    eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
    obtenerSucursalesDeUsuario(clienteId: string, usuarioId: string): Promise<string[]>;
    sincronizarSucursalesUsuario(clienteId: string, usuarioId: string, sucursalIds: string[], actor: string): Promise<void>;
}
