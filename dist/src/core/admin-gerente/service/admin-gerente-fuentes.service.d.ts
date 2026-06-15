import { Repository } from 'typeorm';
import { Fuente } from '../../fuentes/entity/fuente.entity';
import { MovimientoFuente } from '../../fuentes/entity/movimiento-fuente.entity';
export declare class AdminGerenteFuentesService {
    private readonly fuenteRepo;
    private readonly movRepo;
    private readonly logger;
    constructor(fuenteRepo: Repository<Fuente>, movRepo: Repository<MovimientoFuente>);
    getToolDefs(): any[];
    ejecutar(nombre: string, input: any, clienteId: string, adminId: string): Promise<any>;
    private consultarFuentes;
    private registrarMovimiento;
    private registrarTransferencia;
    private buscarFuentePorNombre;
    private calcularSaldo;
}
