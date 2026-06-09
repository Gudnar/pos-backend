import { Response } from 'express';
import { FacebookService } from '../service/facebook.service';
import { FacebookWebhookService } from '../service/facebook-webhook.service';
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class FacebookController {
    private readonly fbService;
    private readonly webhookService;
    private readonly confClienteService;
    private readonly logger;
    constructor(fbService: FacebookService, webhookService: FacebookWebhookService, confClienteService: ConfiguracionClienteService);
    verificarWebhook(query: any, res: Response): Promise<void>;
    recibirWebhook(body: any): Promise<string>;
    obtenerConfig(req: any): Promise<{
        pageAccessToken: string;
        pageId: string;
        verifyToken: string;
        messengerAgenteId: string;
        commentsAgenteId: string;
        enabled: boolean;
        replyComments: boolean;
    }>;
    guardarConfig(body: any, req: any): Promise<SuccessResponseDto>;
    testConexion(body: {
        pageAccessToken: string;
        pageId: string;
    }): Promise<{
        valida: boolean;
        info?: any;
        mensaje: string;
    }>;
    obtenerPublicaciones(req: any): Promise<SuccessResponseDto>;
    obtenerEstado(req: any): Promise<{
        valida: boolean;
        info?: any;
        mensaje: string;
    }>;
}
