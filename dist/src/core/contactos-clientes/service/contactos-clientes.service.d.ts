import { Repository } from 'typeorm';
import { ContactoCliente } from '../entity/contacto-cliente.entity';
import { CreateContactoClienteDto, UpdateContactoClienteDto } from '../dto/contacto-cliente.dto';
import { RepresentantesService } from '../../representantes/service/representantes.service';
export declare class ContactosClientesService {
    private readonly repo;
    private readonly repSvc;
    constructor(repo: Repository<ContactoCliente>, repSvc: RepresentantesService);
    listar(clienteId: string, q?: string): Promise<any[]>;
    obtener(clienteId: string, id: string): Promise<ContactoCliente>;
    crear(clienteId: string, dto: CreateContactoClienteDto, usuarioCreacion: string): Promise<ContactoCliente>;
    actualizar(clienteId: string, id: string, dto: UpdateContactoClienteDto, usuarioModificacion: string): Promise<ContactoCliente>;
    eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
}
