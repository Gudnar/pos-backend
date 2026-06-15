import { Repository } from 'typeorm';
import { OrdenImportacion } from '../../logistica-ordenes/entity/orden-importacion.entity';
import { ItemOrdenImportacion } from '../../logistica-ordenes/entity/item-orden-importacion.entity';
import { PagoProveedorImportacion } from '../../logistica-ordenes/entity/pago-proveedor-importacion.entity';
import { GastoLogistica } from '../../logistica-ordenes/entity/gasto-logistica.entity';
import { Moneda } from '../../logistica-monedas/entity/moneda.entity';
import { Fuente } from '../../fuentes/entity/fuente.entity';
import { MovimientoFuente } from '../../fuentes/entity/movimiento-fuente.entity';
export declare class AdminGerenteLogisticaService {
    private readonly ordenRepo;
    private readonly itemRepo;
    private readonly pagoRepo;
    private readonly gastoRepo;
    private readonly monedaRepo;
    private readonly fuenteRepo;
    private readonly movFuenteRepo;
    private readonly logger;
    constructor(ordenRepo: Repository<OrdenImportacion>, itemRepo: Repository<ItemOrdenImportacion>, pagoRepo: Repository<PagoProveedorImportacion>, gastoRepo: Repository<GastoLogistica>, monedaRepo: Repository<Moneda>, fuenteRepo: Repository<Fuente>, movFuenteRepo: Repository<MovimientoFuente>);
    getToolDefs(): any[];
    ejecutar(nombre: string, input: any, clienteId: string, adminId: string): Promise<any>;
    private consultarOrden;
    private registrarPago;
    private registrarGasto;
    private registrarEgresoFuente;
}
