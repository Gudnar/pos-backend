import { Repository } from 'typeorm';
import { GastoLogistica } from '../entity/gasto-logistica.entity';
import { CreateGastoLogisticaDto, UpdateGastoLogisticaDto } from '../dto/gasto-logistica.dto';
import { MovimientosFuenteService } from '../../fuentes/service/movimientos-fuente.service';
export declare class GastosLogisticaService {
    private readonly repo;
    private readonly movimientosSvc;
    constructor(repo: Repository<GastoLogistica>, movimientosSvc: MovimientosFuenteService);
    listar(clienteId: string, ordenId: string): Promise<GastoLogistica[]>;
    obtener(clienteId: string, ordenId: string, id: string): Promise<GastoLogistica>;
    crear(clienteId: string, ordenId: string, dto: CreateGastoLogisticaDto, usuarioCreacion: string): Promise<GastoLogistica>;
    actualizar(clienteId: string, ordenId: string, id: string, dto: UpdateGastoLogisticaDto, usuarioModificacion: string): Promise<GastoLogistica>;
    eliminar(clienteId: string, ordenId: string, id: string, usuarioModificacion: string): Promise<void>;
}
