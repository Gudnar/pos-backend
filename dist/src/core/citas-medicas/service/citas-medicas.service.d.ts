import { Repository } from 'typeorm';
import { Cita } from '../entity/cita.entity';
import { Paciente } from '../../pacientes/entity/paciente.entity';
import { Cliente } from '../../cliente/entity/cliente.entity';
import { EspecialistaService } from '../../especialista/service/especialista.service';
import { CreateCitaDto, UpdateCitaDto, CreatePacienteDto } from '../dto/cita.dto';
export declare class CitasMedicasService {
    private readonly citaRepo;
    private readonly pacienteRepo;
    private readonly clienteRepo;
    private readonly especialistaSvc;
    constructor(citaRepo: Repository<Cita>, pacienteRepo: Repository<Paciente>, clienteRepo: Repository<Cliente>, especialistaSvc: EspecialistaService);
    private getCliente;
    obtenerServicios(clienteId: string): Promise<string[]>;
    buscarPacientes(clienteId: string, q: string): Promise<Paciente[]>;
    crearPaciente(clienteId: string, dto: CreatePacienteDto, usuarioCreacion: string, origenRegistro?: string): Promise<Paciente>;
    private upsertPaciente;
    citasPorTelefono(clienteId: string, telefono: string): Promise<Cita[]>;
    listar(clienteId: string, fecha?: string, especialistaId?: string): Promise<Cita[]>;
    disponibilidad(clienteId: string, fecha: string, especialistaId?: string): Promise<{
        horaInicio: string;
        horaFin: string;
    }[]>;
    crear(clienteId: string, dto: CreateCitaDto, usuarioCreacion: string): Promise<Cita>;
    actualizar(clienteId: string, id: string, dto: UpdateCitaDto, usuarioModificacion: string): Promise<Cita>;
    estadisticasConsultas(clienteId: string, desde?: string, hasta?: string): Promise<any>;
    eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
}
