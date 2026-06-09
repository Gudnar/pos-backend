import { Repository } from 'typeorm';
import { Paciente } from '../entity/paciente.entity';
import { Consulta } from '../entity/consulta.entity';
import { Cita } from '../../citas-medicas/entity/cita.entity';
import { CreatePacienteDto, UpdatePacienteDto, CreateConsultaDto, UpdateConsultaDto } from '../dto/paciente.dto';
export declare class PacientesService {
    private readonly pacienteRepo;
    private readonly consultaRepo;
    private readonly citaRepo;
    constructor(pacienteRepo: Repository<Paciente>, consultaRepo: Repository<Consulta>, citaRepo: Repository<Cita>);
    listar(clienteId: string, q?: string): Promise<Paciente[]>;
    buscar(clienteId: string, q: string): Promise<Paciente[]>;
    obtener(clienteId: string, id: string): Promise<Paciente>;
    crear(clienteId: string, dto: CreatePacienteDto, usuarioCreacion: string): Promise<Paciente>;
    actualizar(clienteId: string, id: string, dto: UpdatePacienteDto, usuarioModificacion: string): Promise<Paciente>;
    eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
    historialCitas(clienteId: string, pacienteId: string): Promise<Cita[]>;
    listarConsultas(clienteId: string, pacienteId: string): Promise<Consulta[]>;
    crearConsulta(clienteId: string, pacienteId: string, dto: CreateConsultaDto, usuarioCreacion: string): Promise<Consulta>;
    actualizarConsulta(clienteId: string, pacienteId: string, consultaId: string, dto: UpdateConsultaDto, usuarioModificacion: string): Promise<Consulta>;
    eliminarConsulta(clienteId: string, pacienteId: string, consultaId: string, usuarioModificacion: string): Promise<void>;
}
