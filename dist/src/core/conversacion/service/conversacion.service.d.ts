import { Repository } from 'typeorm';
import { Conversacion } from '../entity/conversacion.entity';
import { CreateConversacionDto, AgregarMensajeDto } from '../dto/create-conversacion.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class ConversacionService extends BaseService {
    private readonly conversacionRepository;
    constructor(conversacionRepository: Repository<Conversacion>);
    listar(clienteId: string, agenteId?: string): Promise<Conversacion[]>;
    obtener(id: string): Promise<Conversacion>;
    crear(dto: CreateConversacionDto, usuarioCreacion: string, clienteId: string): Promise<Conversacion>;
    agregarMensaje(id: string, dto: AgregarMensajeDto): Promise<Conversacion>;
    actualizarScore(id: string, score: number): Promise<void>;
    actualizarCalificacion(id: string, data: {
        score?: number;
        intencion?: string;
        urgencia?: string;
        sentimiento?: string;
        servicioDetectado?: string;
        etapaFunnel?: string;
        datosCapturados?: Record<string, string>;
        scoreMotivo?: string;
    }): Promise<void>;
    actualizarEstado(id: string, estadoConversacion: string): Promise<void>;
    actualizarEscalado(id: string, escalado: boolean, motivo?: string): Promise<void>;
    agregarNota(id: string, nota: string): Promise<void>;
    buscarAbiertaPorContacto(clienteId: string, contacto: string, canal?: string): Promise<Conversacion | null>;
    estadisticas(clienteId: string, agenteId?: string): Promise<any>;
    metricas(clienteId: string, agenteId?: string, desde?: string, hasta?: string): Promise<any>;
}
