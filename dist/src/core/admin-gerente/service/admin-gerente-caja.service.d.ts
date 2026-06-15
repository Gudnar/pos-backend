import { Repository } from 'typeorm';
import { Caja } from '../../caja/entity/caja.entity';
import { CajaSesion } from '../../caja/entity/caja-sesion.entity';
import { Usuario } from '../../usuario/entity/usuario.entity';
export declare class AdminGerenteCajaService {
    private readonly cajaRepo;
    private readonly sesionRepo;
    private readonly usuarioRepo;
    private readonly logger;
    constructor(cajaRepo: Repository<Caja>, sesionRepo: Repository<CajaSesion>, usuarioRepo: Repository<Usuario>);
    getToolDefs(): any[];
    ejecutar(nombre: string, input: any, clienteId: string, adminId: string): Promise<any>;
    private consultarSesion;
    private abrirCaja;
    private cerrarCaja;
}
