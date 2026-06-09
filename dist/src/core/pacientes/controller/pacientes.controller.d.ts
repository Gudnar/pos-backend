import { PacientesService } from '../service/pacientes.service';
import { CreatePacienteDto, UpdatePacienteDto, CreateConsultaDto, UpdateConsultaDto } from '../dto/paciente.dto';
export declare class PacientesController {
    private readonly svc;
    constructor(svc: PacientesService);
    listar(req: any, q?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/paciente.entity").Paciente[];
    }>;
    buscar(req: any, q: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/paciente.entity").Paciente[];
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/paciente.entity").Paciente;
    }>;
    crear(req: any, dto: CreatePacienteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/paciente.entity").Paciente;
    }>;
    actualizar(req: any, id: string, dto: UpdatePacienteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/paciente.entity").Paciente;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
    historialCitas(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../../citas-medicas/entity/cita.entity").Cita[];
    }>;
    listarConsultas(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/consulta.entity").Consulta[];
    }>;
    crearConsulta(req: any, id: string, dto: CreateConsultaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/consulta.entity").Consulta;
    }>;
    actualizarConsulta(req: any, id: string, cId: string, dto: UpdateConsultaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/consulta.entity").Consulta;
    }>;
    eliminarConsulta(req: any, id: string, cId: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
