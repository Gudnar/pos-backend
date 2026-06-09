import { Repository } from 'typeorm';
import { Representante } from '../entity/representante.entity';
import { CreateRepresentanteDto, UpdateRepresentanteDto, DesactivarRepresentanteDto } from '../dto/representante.dto';
export declare class RepresentantesService {
    private readonly repo;
    constructor(repo: Repository<Representante>);
    listar(clienteId: string, tipo: string, entidadId: string): Promise<Representante[]>;
    listarActivosBatch(clienteId: string, tipo: string, entidadIds: string[]): Promise<Map<string, Representante>>;
    crear(clienteId: string, tipo: string, entidadId: string, dto: CreateRepresentanteDto, usuarioCreacion: string): Promise<Representante>;
    actualizar(clienteId: string, repId: string, dto: UpdateRepresentanteDto, usuarioModificacion: string): Promise<Representante>;
    desactivar(clienteId: string, repId: string, dto: DesactivarRepresentanteDto, usuarioModificacion: string): Promise<Representante>;
    eliminar(clienteId: string, repId: string, usuarioModificacion: string): Promise<void>;
    private _obtener;
}
