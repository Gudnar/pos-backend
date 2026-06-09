import { FacebookService } from './facebook.service';
import { ConversacionService } from '../../conversacion/service/conversacion.service';
import { AgenteService } from '../../agente/service/agente.service';
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service';
import { CampanaService } from '../../campana/service/campana.service';
import { AgentToolsService } from '../../herramienta/service/agent-tools.service';
export declare class FacebookWebhookService {
    private readonly fbService;
    private readonly conversacionService;
    private readonly agenteService;
    private readonly confClienteService;
    private readonly campanaService;
    private readonly agentTools;
    private readonly logger;
    constructor(fbService: FacebookService, conversacionService: ConversacionService, agenteService: AgenteService, confClienteService: ConfiguracionClienteService, campanaService: CampanaService, agentTools: AgentToolsService);
    procesarEntrada(entry: any, pageId: string): Promise<void>;
    private procesarMensajeMessenger;
    private procesarComentario;
    private resolverAgente;
    private encontrarOCrearConversacion;
    private llamarClaude;
}
