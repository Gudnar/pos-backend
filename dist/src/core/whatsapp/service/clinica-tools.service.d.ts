import { CitasMedicasService } from '../../citas-medicas/service/citas-medicas.service';
import { EspecialistaService } from '../../especialista/service/especialista.service';
import { ConversacionService } from '../../conversacion/service/conversacion.service';
export declare const CLINIC_TOOL_DEFS: ({
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            especialidad?: undefined;
            fecha?: undefined;
            especialistaId?: undefined;
            pacienteNombre?: undefined;
            pacienteTelefono?: undefined;
            horaInicio?: undefined;
            servicio?: undefined;
            notas?: undefined;
            telefono?: undefined;
            consultaId?: undefined;
            nuevaFecha?: undefined;
            nuevaHoraInicio?: undefined;
            motivo?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            especialidad: {
                type: string;
                description: string;
            };
            fecha?: undefined;
            especialistaId?: undefined;
            pacienteNombre?: undefined;
            pacienteTelefono?: undefined;
            horaInicio?: undefined;
            servicio?: undefined;
            notas?: undefined;
            telefono?: undefined;
            consultaId?: undefined;
            nuevaFecha?: undefined;
            nuevaHoraInicio?: undefined;
            motivo?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            fecha: {
                type: string;
                description: string;
            };
            especialistaId: {
                type: string;
                description: string;
            };
            especialidad?: undefined;
            pacienteNombre?: undefined;
            pacienteTelefono?: undefined;
            horaInicio?: undefined;
            servicio?: undefined;
            notas?: undefined;
            telefono?: undefined;
            consultaId?: undefined;
            nuevaFecha?: undefined;
            nuevaHoraInicio?: undefined;
            motivo?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            pacienteNombre: {
                type: string;
                description: string;
            };
            pacienteTelefono: {
                type: string;
                description: string;
            };
            fecha: {
                type: string;
                description: string;
            };
            horaInicio: {
                type: string;
                description: string;
            };
            servicio: {
                type: string;
                description: string;
            };
            especialistaId: {
                type: string;
                description: string;
            };
            notas: {
                type: string;
                description: string;
            };
            especialidad?: undefined;
            telefono?: undefined;
            consultaId?: undefined;
            nuevaFecha?: undefined;
            nuevaHoraInicio?: undefined;
            motivo?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            telefono: {
                type: string;
                description: string;
            };
            especialidad?: undefined;
            fecha?: undefined;
            especialistaId?: undefined;
            pacienteNombre?: undefined;
            pacienteTelefono?: undefined;
            horaInicio?: undefined;
            servicio?: undefined;
            notas?: undefined;
            consultaId?: undefined;
            nuevaFecha?: undefined;
            nuevaHoraInicio?: undefined;
            motivo?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            consultaId: {
                type: string;
                description: string;
            };
            nuevaFecha: {
                type: string;
                description: string;
            };
            nuevaHoraInicio: {
                type: string;
                description: string;
            };
            especialidad?: undefined;
            fecha?: undefined;
            especialistaId?: undefined;
            pacienteNombre?: undefined;
            pacienteTelefono?: undefined;
            horaInicio?: undefined;
            servicio?: undefined;
            notas?: undefined;
            telefono?: undefined;
            motivo?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            consultaId: {
                type: string;
                description: string;
            };
            motivo: {
                type: string;
                description: string;
            };
            especialidad?: undefined;
            fecha?: undefined;
            especialistaId?: undefined;
            pacienteNombre?: undefined;
            pacienteTelefono?: undefined;
            horaInicio?: undefined;
            servicio?: undefined;
            notas?: undefined;
            telefono?: undefined;
            nuevaFecha?: undefined;
            nuevaHoraInicio?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: {
            motivo: {
                type: string;
                description: string;
            };
            especialidad?: undefined;
            fecha?: undefined;
            especialistaId?: undefined;
            pacienteNombre?: undefined;
            pacienteTelefono?: undefined;
            horaInicio?: undefined;
            servicio?: undefined;
            notas?: undefined;
            telefono?: undefined;
            consultaId?: undefined;
            nuevaFecha?: undefined;
            nuevaHoraInicio?: undefined;
        };
        required?: undefined;
    };
})[];
export interface ToolContext {
    clienteId: string;
    agenteId: string;
    from: string;
    conversacionId: string;
}
export declare class ClinicaToolsService {
    private readonly citasSvc;
    private readonly especialistaSvc;
    private readonly conversacionSvc;
    private readonly logger;
    constructor(citasSvc: CitasMedicasService, especialistaSvc: EspecialistaService, conversacionSvc: ConversacionService);
    getToolDefs(clienteId: string): Promise<typeof CLINIC_TOOL_DEFS | undefined>;
    getSystemAddendum(clienteId: string): Promise<string>;
    ejecutar(nombre: string, input: Record<string, any>, ctx: ToolContext): Promise<any>;
    private _obtenerServicios;
    private _listarEspecialistas;
    private _consultarDisponibilidad;
    private _programarConsulta;
    private _consultarConsultasPaciente;
    private _reprogramarConsulta;
    private _cancelarConsulta;
    private _cerrarConversacion;
}
