import { Repository } from 'typeorm';
import { Especialista } from '../entity/especialista.entity';
import { CreateEspecialistaDto, UpdateEspecialistaDto } from '../dto/especialista.dto';
export declare class EspecialistaService {
    private readonly repo;
    constructor(repo: Repository<Especialista>);
    listar(clienteId: string, especialidad?: string): Promise<Especialista[]>;
    obtener(id: string, clienteId: string): Promise<Especialista>;
    crear(clienteId: string, dto: CreateEspecialistaDto, usuarioCreacion: string): Promise<Especialista>;
    actualizar(clienteId: string, id: string, dto: UpdateEspecialistaDto, usuarioModificacion: string): Promise<Especialista>;
    eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
}
