import { Repository } from 'typeorm';
import { PaisLogistica } from '../entity/pais-logistica.entity';
import { CreatePaisLogisticaDto, UpdatePaisLogisticaDto } from '../dto/pais-logistica.dto';
export declare class LogisticaPaisesService {
    private readonly repo;
    constructor(repo: Repository<PaisLogistica>);
    listar(clienteId: string, q?: string): Promise<PaisLogistica[]>;
    obtener(clienteId: string, id: string): Promise<PaisLogistica>;
    crear(clienteId: string, dto: CreatePaisLogisticaDto, usuarioCreacion: string): Promise<PaisLogistica>;
    actualizar(clienteId: string, id: string, dto: UpdatePaisLogisticaDto, usuarioModificacion: string): Promise<PaisLogistica>;
    eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
    inicializarDefaults(clienteId: string, usuarioCreacion: string): Promise<void>;
}
