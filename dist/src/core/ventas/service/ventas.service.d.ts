import { DataSource, Repository } from 'typeorm';
import { Venta } from '../entity/venta.entity';
import { DetalleVenta } from '../entity/detalle-venta.entity';
import { Lote } from '../../lotes/entity/lote.entity';
import { MovimientoStock } from '../../movimientos-stock/entity/movimiento-stock.entity';
import { Producto } from '../../productos/entity/producto.entity';
import { CajaSesion } from '../../caja/entity/caja-sesion.entity';
import { IngresosService } from '../../ingresos/service/ingresos.service';
import { CrearVentaDto, AnularVentaDto } from '../dto/venta.dto';
export declare class VentasService {
    private readonly ventaRepo;
    private readonly detalleRepo;
    private readonly loteRepo;
    private readonly movRepo;
    private readonly productoRepo;
    private readonly sesionRepo;
    private readonly ingresosService;
    private readonly dataSource;
    constructor(ventaRepo: Repository<Venta>, detalleRepo: Repository<DetalleVenta>, loteRepo: Repository<Lote>, movRepo: Repository<MovimientoStock>, productoRepo: Repository<Producto>, sesionRepo: Repository<CajaSesion>, ingresosService: IngresosService, dataSource: DataSource);
    listar(clienteId: string, sucursalId?: string, fecha?: string, estadoVenta?: string): Promise<Venta[]>;
    obtener(clienteId: string, id: string): Promise<{
        venta: Venta;
        detalles: DetalleVenta[];
    }>;
    crear(clienteId: string, dto: CrearVentaDto, usuarioId: string): Promise<Venta>;
    anular(clienteId: string, id: string, dto: AnularVentaDto, usuarioModificacion: string): Promise<Venta>;
    private _ordenPicking;
}
