import { CitasMedicasService } from '../service/citas-medicas.service';
import { CreateCitaDto, UpdateCitaDto, CreatePacienteDto } from '../dto/cita.dto';
export declare class CitasMedicasController {
    private readonly svc;
    constructor(svc: CitasMedicasService);
    buscarPacientes(req: any, q: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../../pacientes/entity/paciente.entity").Paciente[];
    }>;
    crearPaciente(req: any, dto: CreatePacienteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../../pacientes/entity/paciente.entity").Paciente;
    }>;
    estadisticas(req: any, desde?: string, hasta?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    listar(req: any, fecha?: string, especialistaId?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/cita.entity").Cita[];
    }>;
    disponibilidad(req: any, fecha: string, especialistaId?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: {
            horaInicio: string;
            horaFin: string;
        }[];
    }>;
    crear(req: any, dto: CreateCitaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/cita.entity").Cita;
    }>;
    actualizar(req: any, id: string, dto: UpdateCitaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/cita.entity").Cita;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
