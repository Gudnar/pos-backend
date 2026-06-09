import { Repository } from 'typeorm';
import { Caja } from '../entity/caja.entity';
import { CajaSesion } from '../entity/caja-sesion.entity';
import { Usuario } from '../../usuario/entity/usuario.entity';
import { CreateCajaDto, UpdateCajaDto, AbrirSesionDto, CerrarSesionDto } from '../dto/caja.dto';
export declare class CajaService {
    private readonly cajaRepo;
    private readonly sesionRepo;
    private readonly usuarioRepo;
    constructor(cajaRepo: Repository<Caja>, sesionRepo: Repository<CajaSesion>, usuarioRepo: Repository<Usuario>);
    listar(clienteId: string, sucursalId?: string): Promise<Caja[]>;
    crear(clienteId: string, dto: CreateCajaDto, usuarioCreacion: string): Promise<Caja>;
    actualizar(clienteId: string, id: string, dto: UpdateCajaDto, usuarioModificacion: string): Promise<Caja>;
    eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
    sesionActiva(clienteId: string, usuarioId: string): Promise<CajaSesion | null>;
    ultimasSesiones(clienteId: string, cajaId?: string, limit?: number): Promise<CajaSesion[]>;
    sesionesDia(clienteId: string, fecha?: string, sucursalId?: string): Promise<any[]>;
    abrirSesion(clienteId: string, dto: AbrirSesionDto, usuarioId: string): Promise<CajaSesion>;
    cerrarSesion(clienteId: string, sesionId: string, dto: CerrarSesionDto, usuarioModificacion: string): Promise<CajaSesion>;
    incrementarTotalesSesion(sesionId: string, total: number): Promise<void>;
}
