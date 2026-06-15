import { Repository } from 'typeorm';
import { Usuario } from '../../usuario/entity/usuario.entity';
import { AdminGerenteToolsService } from './admin-gerente-tools.service';
import { AdminGerenteFuentesService } from './admin-gerente-fuentes.service';
import { AdminGerenteLogisticaService } from './admin-gerente-logistica.service';
import { AdminGerenteComprasService } from './admin-gerente-compras.service';
import { AdminGerenteCajaService } from './admin-gerente-caja.service';
export interface AdminContext {
    id: string;
    rol: string;
    nombres: string;
}
export declare class AdminGerenteService {
    private readonly usuarioRepo;
    private readonly adminTools;
    private readonly fuentesTools;
    private readonly logisticaTools;
    private readonly comprasTools;
    private readonly cajaTools;
    private readonly logger;
    constructor(usuarioRepo: Repository<Usuario>, adminTools: AdminGerenteToolsService, fuentesTools: AdminGerenteFuentesService, logisticaTools: AdminGerenteLogisticaService, comprasTools: AdminGerenteComprasService, cajaTools: AdminGerenteCajaService);
    resolverAdmin(telefono: string, clienteId: string): Promise<AdminContext | null>;
    obtenerRespuesta(texto: string, admin: AdminContext, clienteId: string, apiKey: string, nombreEmpresa: string): Promise<string | null>;
    private dispatch;
    private getAllToolDefs;
    private buildSystemPrompt;
}
