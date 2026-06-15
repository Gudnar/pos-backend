import { Repository } from 'typeorm';
import { ComprasService } from '../../compras/service/compras.service';
import { Producto } from '../../productos/entity/producto.entity';
export declare class AdminGerenteComprasService {
    private readonly comprasService;
    private readonly productoRepo;
    private readonly logger;
    constructor(comprasService: ComprasService, productoRepo: Repository<Producto>);
    getToolDefs(): any[];
    ejecutar(nombre: string, input: any, clienteId: string, adminId: string): Promise<any>;
    private consultarCompras;
    private crearCompra;
    private recibirCompra;
    private finalizarCompra;
}
