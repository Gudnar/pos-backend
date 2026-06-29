import { Response } from 'express';
import { WhatsappFlowsService } from '../service/whatsapp-flows.service';
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service';
import { WaFlowEncryptedRequest } from '../dto/whatsapp-flows.dto';
export declare class WhatsappFlowsController {
    private readonly flowsService;
    private readonly confClienteService;
    private readonly logger;
    constructor(flowsService: WhatsappFlowsService, confClienteService: ConfiguracionClienteService);
    manejarFlow(body: WaFlowEncryptedRequest, clienteIdParam: string, phoneNumberId: string, res: Response): Promise<void>;
}
