import { DataSource, EntityManager, Repository } from 'typeorm';
import { Cotizacion } from '../entity/cotizacion.entity';
import { CotizacionDetalle } from '../entity/cotizacion-detalle.entity';
import { CrearCotizacionDto, AnularCotizacionDto } from '../dto/cotizacion.dto';
export declare class CotizacionesService {
    private readonly repo;
    private readonly detalleRepo;
    private readonly ds;
    private schema;
    constructor(repo: Repository<Cotizacion>, detalleRepo: Repository<CotizacionDetalle>, ds: DataSource);
    crear(clienteId: string, dto: CrearCotizacionDto, usuarioId: string): Promise<Cotizacion>;
    listar(clienteId: string, f: {
        sucursalId?: string;
        fechaDesde?: string;
        fechaHasta?: string;
        estado?: string;
        nombreCliente?: string;
    }): Promise<any[]>;
    private estadoSql;
    obtener(clienteId: string, id: string): Promise<any>;
    anular(clienteId: string, id: string, dto: AnularCotizacionDto, usuarioId: string): Promise<Cotizacion>;
    datosImpresion(clienteId: string, id: string): Promise<any>;
    static marcarConvertida(manager: EntityManager, clienteId: string, cotizacionId: string, ventaId: string): Promise<void>;
    static liberarPorVenta(manager: EntityManager, clienteId: string, ventaId: string): Promise<void>;
    private fechaTexto;
}
