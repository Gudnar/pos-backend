import { HerramientaService } from './herramienta.service';
import { ConversacionService } from '../../conversacion/service/conversacion.service';
import { Herramienta } from '../entity/herramienta.entity';
export declare class AgentToolsService {
    private readonly herramientaService;
    private readonly conversacionService;
    private readonly logger;
    constructor(herramientaService: HerramientaService, conversacionService: ConversacionService);
    getToolDefs(agenteId: string): Promise<any[]>;
    buildDefs(herramientas: Herramienta[]): any[];
    getNombres(agenteId: string): Promise<Set<string>>;
    ejecutar(nombre: string, input: Record<string, any>, conversacionId: string): Promise<any>;
}
