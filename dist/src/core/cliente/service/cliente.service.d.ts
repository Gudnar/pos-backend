import { Repository } from 'typeorm';
import { Cliente } from '../entity/cliente.entity';
import { CreateClienteDto, UpdateClienteDto } from '../dto/cliente.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class ClienteService extends BaseService {
    private readonly clienteRepository;
    constructor(clienteRepository: Repository<Cliente>);
    listar(): Promise<Cliente[]>;
    obtener(id: string): Promise<Cliente>;
    obtenerPorSlug(slug: string): Promise<Cliente>;
    crear(dto: CreateClienteDto, usuarioCreacion: string): Promise<Cliente>;
    actualizar(id: string, dto: UpdateClienteDto, usuarioModificacion: string): Promise<Cliente>;
    eliminar(id: string, usuarioModificacion: string): Promise<void>;
}
