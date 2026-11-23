/// <reference types="multer" />
import { Repository } from 'typeorm';
import { Cliente } from '../../cliente/entity/cliente.entity';
export declare const MAX_TAMANO_LOGO: number;
export declare class LogoEmpresaService {
    private readonly clienteRepo;
    private readonly baseDir;
    constructor(clienteRepo: Repository<Cliente>);
    subir(clienteId: string, file: Express.Multer.File, usuarioId: string): Promise<{
        logoUrl: string;
    }>;
    quitar(clienteId: string, usuarioId: string): Promise<void>;
    rutaPublica(clienteId: string, archivo: string): Promise<{
        ruta: string;
        mime: string;
    }>;
    private obtenerCliente;
    private borrarArchivoPropio;
}
