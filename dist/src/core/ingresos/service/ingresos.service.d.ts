import { EntityManager, Repository } from 'typeorm';
import { Ingreso } from '../entity/ingreso.entity';
import { CreateIngresoDto, UpdateIngresoDto } from '../dto/ingreso.dto';
export declare class IngresosService {
    private readonly ingresoRepo;
    constructor(ingresoRepo: Repository<Ingreso>);
    listar(clienteId: string, tipo?: string, categoria?: string, fecha?: string): Promise<Ingreso[]>;
    listarAdelantos(clienteId: string, contactoClienteId?: string): Promise<Ingreso[]>;
    obtener(clienteId: string, id: string): Promise<Ingreso>;
    crear(clienteId: string, dto: CreateIngresoDto, usuarioId: string): Promise<Ingreso>;
    actualizar(clienteId: string, id: string, dto: UpdateIngresoDto, usuarioId: string): Promise<Ingreso>;
    anular(clienteId: string, id: string, usuarioId: string): Promise<void>;
    aplicarMonto(manager: EntityManager, clienteId: string, ingresoId: string, montoAplicar: number, usuarioId: string): Promise<void>;
}
