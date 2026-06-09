import { Repository } from 'typeorm';
import { TipoGastoLogistica } from '../entity/tipo-gasto-logistica.entity';
import { CreateTipoGastoLogisticaDto, UpdateTipoGastoLogisticaDto } from '../dto/tipo-gasto-logistica.dto';
export declare class LogisticaTiposGastoService {
    private readonly repo;
    constructor(repo: Repository<TipoGastoLogistica>);
    listar(clienteId: string, q?: string): Promise<TipoGastoLogistica[]>;
    obtener(clienteId: string, id: string): Promise<TipoGastoLogistica>;
    crear(clienteId: string, dto: CreateTipoGastoLogisticaDto, usuarioCreacion: string): Promise<TipoGastoLogistica>;
    actualizar(clienteId: string, id: string, dto: UpdateTipoGastoLogisticaDto, usuarioModificacion: string): Promise<TipoGastoLogistica>;
    eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
    inicializarDefaults(clienteId: string, usuarioCreacion: string): Promise<void>;
}
