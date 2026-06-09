import { Repository } from 'typeorm';
import { Moneda } from '../entity/moneda.entity';
import { CreateMonedaDto, UpdateMonedaDto } from '../dto/moneda.dto';
export declare class LogisticaMonedasService {
    private readonly repo;
    constructor(repo: Repository<Moneda>);
    listar(clienteId: string, q?: string): Promise<Moneda[]>;
    obtener(clienteId: string, id: string): Promise<Moneda>;
    crear(clienteId: string, dto: CreateMonedaDto, usuarioCreacion: string): Promise<Moneda>;
    actualizar(clienteId: string, id: string, dto: UpdateMonedaDto, usuarioModificacion: string): Promise<Moneda>;
    eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
    setBase(clienteId: string, id: string, usuarioModificacion: string): Promise<Moneda>;
}
