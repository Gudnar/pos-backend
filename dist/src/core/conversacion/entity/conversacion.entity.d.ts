import { Cliente } from '../../cliente/entity/cliente.entity';
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Conversacion extends AuditoriaEntity {
    id: string;
    agenteId: string;
    contacto: string;
    canal: string;
    estadoConversacion: string;
    score: number;
    mensajes: Array<{
        role: string;
        content: string;
        timestamp: string;
    }>;
    totalMensajes: number;
    escalado: boolean;
    etiquetas: string[];
    notas?: string;
    resolucion?: string;
    intencion?: string;
    urgencia?: string;
    sentimiento?: string;
    servicioDetectado?: string;
    etapaFunnel?: string;
    datosCapturados?: Record<string, string>;
    scoreMotivo?: string;
    clienteId: string;
    cliente: Cliente;
    constructor(data?: Partial<Conversacion>);
}
