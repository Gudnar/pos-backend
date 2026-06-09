import { Repository } from 'typeorm';
import { MovimientoFuente } from '../entity/movimiento-fuente.entity';
import { Fuente } from '../entity/fuente.entity';
import { CreateMovimientoFuenteDto, CreateTransferenciaDto, UpdateMovimientoFuenteDto } from '../dto/movimiento-fuente.dto';
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
    }): Promise<MovimientoFuente[]>;
    registrar(clienteId: string, fuenteId: string, dto: CreateMovimientoFuenteDto, usuarioCreacion: string): Promise<MovimientoFuente>;
    registrarExterno(clienteId: string, fuenteId: string, tipo: string, concepto: string, monto: number, monedaId: string | undefined, tipoCambio: number, fecha: string, categoria: string, origenTipo: string, origenId: string, usuarioCreacion: string): Promise<MovimientoFuente>;
    registrarTransferencia(clienteId: string, fuenteOrigenId: string, dto: CreateTransferenciaDto, usuarioCreacion: string): Promise<{
        salida: MovimientoFuente;
        entrada: MovimientoFuente;
    }>;
    actualizar(clienteId: string, fuenteId: string, id: string, dto: UpdateMovimientoFuenteDto, usuarioModificacion: string): Promise<MovimientoFuente>;
    eliminar(clienteId: string, fuenteId: string, id: string, usuarioModificacion: string): Promise<void>;
    cancelarPorOrigen(clienteId: string, origenTipo: string, origenId: string, usuarioModificacion: string): Promise<void>;
}
