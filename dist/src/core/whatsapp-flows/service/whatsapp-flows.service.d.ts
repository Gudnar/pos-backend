/// <reference types="node" />
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service';
import { IngresosService } from '../../ingresos/service/ingresos.service';
import { GastosService } from '../../gastos/service/gastos.service';
import { WaFlowEncryptedRequest, WaFlowActionPayload, WaFlowResponsePayload } from '../dto/whatsapp-flows.dto';
export declare class WhatsappFlowsService {
    private readonly confClienteService;
    private readonly ingresosService;
    private readonly gastosService;
    private readonly logger;
    constructor(confClienteService: ConfiguracionClienteService, ingresosService: IngresosService, gastosService: GastosService);
    enviarFlow(to: string, clienteId: string): Promise<void>;
    desencriptarRequest(body: WaFlowEncryptedRequest, privateKeyPem: string): {
        payload: WaFlowActionPayload;
        aesKey: Buffer;
        iv: Buffer;
    };
    encriptarResponse(responseData: object, aesKey: Buffer, iv: Buffer): string;
    procesarAccion(payload: WaFlowActionPayload, clienteId: string): Promise<WaFlowResponsePayload>;
    private guardarRegistro;
    obtenerClavePrivada(clienteId: string): Promise<string | null>;
}
