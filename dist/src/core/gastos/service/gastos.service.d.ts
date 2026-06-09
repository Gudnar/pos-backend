import { Repository } from 'typeorm';
import { Gasto } from '../entity/gasto.entity';
import { CreateGastoDto, UpdateGastoDto } from '../dto/gasto.dto';
export declare class GastosService {
    private readonly gastoRepo;
    constructor(gastoRepo: Repository<Gasto>);
    listar(clienteId: string, tipo?: string, categoria?: string): Promise<Gasto[]>;
    obtener(clienteId: string, id: string): Promise<Gasto>;
    crear(clienteId: string, dto: CreateGastoDto, usuarioId: string): Promise<Gasto>;
    actualizar(clienteId: string, id: string, dto: UpdateGastoDto, usuarioId: string): Promise<Gasto>;
    eliminar(clienteId: string, id: string, usuarioId: string): Promise<void>;
}
