import { Repository } from 'typeorm';
import { Usuario } from '../../usuario/entity/usuario.entity';
import { UsuarioSucursal } from '../../sucursales/entity/usuario-sucursal.entity';
import { Sucursal } from '../../sucursales/entity/sucursal.entity';
import { CreateUsuarioSistemaDto, UpdateUsuarioSistemaDto } from '../dto/usuarios-sistema.dto';
export declare class UsuariosSistemaService {
    private readonly usuarioRepo;
    private readonly asignacionRepo;
    private readonly sucursalRepo;
    constructor(usuarioRepo: Repository<Usuario>, asignacionRepo: Repository<UsuarioSucursal>, sucursalRepo: Repository<Sucursal>);
    listar(clienteId: string): Promise<any[]>;
    obtener(clienteId: string, id: string): Promise<any>;
    crear(clienteId: string, dto: CreateUsuarioSistemaDto, usuarioCreacion: string): Promise<any>;
    actualizar(clienteId: string, id: string, dto: UpdateUsuarioSistemaDto, actor: string): Promise<any>;
    eliminar(clienteId: string, id: string, actor: string): Promise<void>;
    private _enriquecer;
    private _sincronizar;
}
