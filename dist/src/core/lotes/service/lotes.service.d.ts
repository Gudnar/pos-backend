import { DataSource, Repository } from 'typeorm';
import { Lote } from '../entity/lote.entity';
import { MovimientoStock } from '../../movimientos-stock/entity/movimiento-stock.entity';
import { Producto } from '../../productos/entity/producto.entity';
import { IngresoLoteDto, CambiarEstadoLoteDto } from '../dto/lote.dto';
export declare class LotesService {
    private readonly loteRepo;
    private readonly movRepo;
    private readonly productoRepo;
    private readonly ds;
    constructor(loteRepo: Repository<Lote>, movRepo: Repository<MovimientoStock>, productoRepo: Repository<Producto>, ds: DataSource);
    stockResumen(clienteId: string, sucursalId?: string): Promise<any[]>;
    listarPorProducto(clienteId: string, sucursalId: string | undefined, productoId: string): Promise<Lote[]>;
    obtener(clienteId: string, id: string): Promise<Lote>;
    trazabilidad(clienteId: string, id: string): Promise<any>;
    ingresar(clienteId: string, dto: IngresoLoteDto, usuarioId: string): Promise<Lote>;
    cambiarEstado(clienteId: string, id: string, dto: CambiarEstadoLoteDto, usuarioModificacion: string): Promise<Lote>;
    listarTodos(clienteId: string, opts: {
        sucursalId?: string;
        estadoLote?: string;
        search?: string;
    }): Promise<any[]>;
    reporteGeneral(clienteId: string, opts: {
        sucursalId?: string;
    }): Promise<any[]>;
    historialPrecios(clienteId: string, opts: {
        productoId?: string;
    }): Promise<any[]>;
    marcarVencidos(): Promise<void>;
    proximosAVencer(clienteId: string, sucursalId?: string): Promise<any[]>;
}
