import { Repository } from 'typeorm';
import { Fuente } from '../entity/fuente.entity';
import { MovimientoFuente } from '../entity/movimiento-fuente.entity';
import { CreateFuenteDto, UpdateFuenteDto } from '../dto/fuente.dto';
export declare class FuentesService {
    private readonly repo;
    private readonly movRepo;
    constructor(repo: Repository<Fuente>, movRepo: Repository<MovimientoFuente>);
    private calcularSaldo;
    listar(clienteId: string): Promise<any[]>;
    obtener(clienteId: string, id: string): Promise<any>;
    crear(clienteId: string, dto: CreateFuenteDto, usuarioCreacion: string): Promise<Fuente>;
    actualizar(clienteId: string, id: string, dto: UpdateFuenteDto, usuarioModificacion: string): Promise<any>;
    eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
    resumen(clienteId: string): Promise<any[]>;
}
