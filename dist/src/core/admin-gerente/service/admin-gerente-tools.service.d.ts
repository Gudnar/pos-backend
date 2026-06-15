import { Repository } from 'typeorm';
import { Producto } from '../../productos/entity/producto.entity';
import { Lote } from '../../lotes/entity/lote.entity';
import { MovimientoStock } from '../../movimientos-stock/entity/movimiento-stock.entity';
import { Venta } from '../../ventas/entity/venta.entity';
import { DetalleVenta } from '../../ventas/entity/detalle-venta.entity';
import { OrdenImportacion } from '../../logistica-ordenes/entity/orden-importacion.entity';
export declare class AdminGerenteToolsService {
    private readonly productoRepo;
    private readonly loteRepo;
    private readonly movRepo;
    private readonly ventaRepo;
    private readonly detalleVentaRepo;
    private readonly ordenRepo;
    private readonly logger;
    constructor(productoRepo: Repository<Producto>, loteRepo: Repository<Lote>, movRepo: Repository<MovimientoStock>, ventaRepo: Repository<Venta>, detalleVentaRepo: Repository<DetalleVenta>, ordenRepo: Repository<OrdenImportacion>);
    getToolDefs(): any[];
    ejecutar(nombre: string, input: any, clienteId: string): Promise<any>;
    private consultarStock;
    private registrarVenta;
    private consultarDeudas;
    private consultarPagosProveedor;
    private registrarIngreso;
}
