import { ConversacionService } from '../../conversacion/service/conversacion.service';
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service';
export declare class CalificacionBackgroundService {
    private readonly conversacionService;
    private readonly confClienteService;
    private readonly logger;
    constructor(conversacionService: ConversacionService, confClienteService: ConfiguracionClienteService);
    calificar(conversacionId: string, mensajes: Array<{
        role: string;
        content: string;
    }>, clienteId: string, apiKey: string, modelo: string): Promise<void>;
}
