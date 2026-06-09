import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service';
export interface FbConfig {
    pageAccessToken: string;
    pageId: string;
    verifyToken: string;
    messengerAgenteId: string;
    commentsAgenteId: string;
    enabled: boolean;
    replyComments: boolean;
}
export declare class FacebookService {
    private readonly confClienteService;
    private readonly logger;
    constructor(confClienteService: ConfiguracionClienteService);
    obtenerConfig(clienteId: string): Promise<FbConfig>;
    guardarConfig(clienteId: string, data: Partial<FbConfig>, usuarioId: string): Promise<void>;
    enviarMensajeMessenger(recipientPsid: string, text: string, config: FbConfig): Promise<void>;
    mostrarTypingMessenger(recipientPsid: string, config: FbConfig): Promise<void>;
    marcarLeidoMessenger(recipientPsid: string, config: FbConfig): Promise<void>;
    responderComentario(commentId: string, text: string, config: FbConfig): Promise<void>;
    obtenerPublicaciones(clienteId: string): Promise<any[]>;
    testConexion(pageAccessToken: string, pageId: string): Promise<{
        valida: boolean;
        info?: any;
        mensaje: string;
    }>;
}
