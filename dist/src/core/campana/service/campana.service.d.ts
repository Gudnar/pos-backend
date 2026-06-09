import { Repository } from 'typeorm';
import { Campana } from '../entity/campana.entity';
import { CreateCampanaDto, UpdateCampanaDto } from '../dto/campana.dto';
export declare class CampanaService {
    private readonly campanaRepo;
    constructor(campanaRepo: Repository<Campana>);
    listar(clienteId: string): Promise<Campana[]>;
    obtener(id: string, clienteId: string): Promise<Campana>;
    crear(clienteId: string, dto: CreateCampanaDto, usuarioCreacion: string): Promise<Campana>;
    actualizar(id: string, clienteId: string, dto: UpdateCampanaDto, usuarioModificacion: string): Promise<Campana>;
    eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void>;
    resolverPorCanalYOrigen(clienteId: string, canal: string, origen?: string): Promise<Campana | null>;
}
