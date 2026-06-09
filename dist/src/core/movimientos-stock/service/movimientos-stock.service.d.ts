import { DataSource, Repository } from 'typeorm';
import { MovimientoStock } from '../entity/movimiento-stock.entity';
import { Lote } from '../../lotes/entity/lote.entity';
import { RegistrarMovimientoDto, TransferirStockDto } from '../dto/movimiento-stock.dto';
export declare class MovimientosStockService {
    private readonly movRepo;
    private readonly loteRepo;
    private readonly ds;
    constructor(movRepo: Repository<MovimientoStock>, loteRepo: Repository<Lote>, ds: DataSource);
    listarPorSucursal(clienteId: string, sucursalId?: string, productoId?: string): Promise<MovimientoStock[]>;
    registrar(clienteId: string, dto: RegistrarMovimientoDto, usuarioId: string): Promise<MovimientoStock>;
    transferir(clienteId: string, dto: TransferirStockDto, usuarioId: string): Promise<{
        origen: MovimientoStock;
        destino: MovimientoStock;
    }>;
    kardex(clienteId: string, opts: {
        sucursalId?: string;
        productoId?: string;
        fechaDesde?: string;
        fechaHasta?: string;
        tipo?: string;
    }): Promise<any[]>;
    sinMovimiento(clienteId: string, opts: {
        sucursalId?: string;
        dias?: number;
    }): Promise<any[]>;
    reporteRotacion(clienteId: string, opts: {
        sucursalId?: string;
        fechaDesde?: string;
        fechaHasta?: string;
    }): Promise<any[]>;
}
