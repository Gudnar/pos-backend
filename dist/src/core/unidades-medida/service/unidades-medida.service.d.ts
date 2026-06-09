import { Repository } from 'typeorm';
import { UnidadMedida } from '../entity/unidad-medida.entity';
import { CreateUnidadMedidaDto, UpdateUnidadMedidaDto } from '../dto/unidad-medida.dto';
export declare class UnidadesMedidaService {
    private readonly repo;
    constructor(repo: Repository<UnidadMedida>);
    listar(clienteId: string): Promise<any[]>;
    obtener(clienteId: string, id: string): Promise<UnidadMedida>;
    crear(clienteId: string, dto: CreateUnidadMedidaDto, usuarioCreacion: string): Promise<UnidadMedida>;
    actualizar(clienteId: string, id: string, dto: UpdateUnidadMedidaDto, usuarioModificacion: string): Promise<UnidadMedida>;
    eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
}
