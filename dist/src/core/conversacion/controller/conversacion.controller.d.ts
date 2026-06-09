import { ConversacionService } from '../service/conversacion.service';
import { CreateConversacionDto, AgregarMensajeDto } from '../dto/create-conversacion.dto';
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class ConversacionController {
    private readonly conversacionService;
    private readonly confClienteService;
    constructor(conversacionService: ConversacionService, confClienteService: ConfiguracionClienteService);
    listar(agenteId: string, req: any): Promise<SuccessResponseDto>;
    estadisticas(agenteId: string, req: any): Promise<SuccessResponseDto>;
    metricas(agenteId: string, desde: string, hasta: string, req: any): Promise<SuccessResponseDto>;
    getCalificacionConfig(req: any): Promise<SuccessResponseDto>;
    setCalificacionConfig(req: any, body: any): Promise<SuccessResponseDto>;
    obtener(id: string): Promise<SuccessResponseDto>;
    crear(dto: CreateConversacionDto, req: any): Promise<SuccessResponseDto>;
    agregarMensaje(id: string, dto: AgregarMensajeDto): Promise<SuccessResponseDto>;
    actualizarEstado(id: string, estadoConversacion: string): Promise<SuccessResponseDto>;
}
