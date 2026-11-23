import { EntityManager, Repository } from 'typeorm';
import { MovimientoFuente } from '../entity/movimiento-fuente.entity';
import { Fuente } from '../entity/fuente.entity';
import { CreateMovimientoFuenteDto, CreateTransferenciaDto, UpdateMovimientoFuenteDto } from '../dto/movimiento-fuente.dto';
import { aCentavos, ResultadoConversion } from '../../../common/lib/conversion-moneda';
export { aCentavos };
export interface MovimientoExternoConversion {
    fuenteId: string;
    tipo: string;
    concepto: string;
    fecha: string;
    categoria: string;
    monedaPagoId?: string | null;
    total: number;
    conversion: ResultadoConversion;
}
export declare class MovimientosFuenteService {
    private readonly repo;
    private readonly fuenteRepo;
    constructor(repo: Repository<MovimientoFuente>, fuenteRepo: Repository<Fuente>);
    private validarFuente;
    private calcularSaldoActual;
    private validarFondos;
    listar(clienteId: string, fuenteId: string, filters?: {
        desde?: string;
        hasta?: string;
        tipo?: string;
        categoria?: string;
        concepto?: string;
    }): Promise<MovimientoFuente[]>;
    registrar(clienteId: string, fuenteId: string, dto: CreateMovimientoFuenteDto, usuarioCreacion: string): Promise<MovimientoFuente>;
    registrarExterno(clienteId: string, fuenteId: string, tipo: string, concepto: string, monto: number, monedaId: string | undefined, tipoCambio: number, fecha: string, categoria: string, origenTipo: string, origenId: string, usuarioCreacion: string): Promise<MovimientoFuente>;
    registrarTransferencia(clienteId: string, fuenteOrigenId: string, dto: CreateTransferenciaDto, usuarioCreacion: string): Promise<{
        salida: MovimientoFuente;
        entrada: MovimientoFuente;
    }>;
    actualizar(clienteId: string, fuenteId: string, id: string, dto: UpdateMovimientoFuenteDto, usuarioModificacion: string): Promise<MovimientoFuente>;
    eliminar(clienteId: string, fuenteId: string, id: string, usuarioModificacion: string): Promise<void>;
    private montoEnMonedaFuente;
    reemplazarExterno(clienteId: string, origenTipo: string, origenId: string, nuevo: MovimientoExternoConversion | null, usuario: string, manager?: EntityManager): Promise<MovimientoFuente | null>;
    cancelarPorOrigen(clienteId: string, origenTipo: string, origenId: string, usuarioModificacion: string): Promise<void>;
}
