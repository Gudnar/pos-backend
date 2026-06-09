import { Repository } from 'typeorm';
import { Venta } from '../../ventas/entity/venta.entity';
import { Lote } from '../../lotes/entity/lote.entity';
import { Ingreso } from '../../ingresos/entity/ingreso.entity';
import { Gasto } from '../../gastos/entity/gasto.entity';
import { Fuente } from '../../fuentes/entity/fuente.entity';
import { MovimientoFuente } from '../../fuentes/entity/movimiento-fuente.entity';
import { Producto } from '../../productos/entity/producto.entity';
import { OrdenImportacion } from '../../logistica-ordenes/entity/orden-importacion.entity';
export declare class BizIntelToolsService {
    private ventaRepo;
    private loteRepo;
    private ingresoRepo;
    private gastoRepo;
    private fuenteRepo;
    private movRepo;
    private productoRepo;
    private ordenRepo;
    constructor(ventaRepo: Repository<Venta>, loteRepo: Repository<Lote>, ingresoRepo: Repository<Ingreso>, gastoRepo: Repository<Gasto>, fuenteRepo: Repository<Fuente>, movRepo: Repository<MovimientoFuente>, productoRepo: Repository<Producto>, ordenRepo: Repository<OrdenImportacion>);
    getToolDefs(): any[];
    ejecutar(nombre: string, input: any, clienteId: string): Promise<any>;
    private consultarVentas;
    private consultarStock;
    private consultarFinanzas;
    private consultarMateriales;
    private rangoDeFechas;
}
