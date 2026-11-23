/// <reference types="multer" />
import { Repository } from 'typeorm';
import { Venta } from '../entity/venta.entity';
import { VentaDocumento } from '../entity/venta-documento.entity';
export declare const MAX_TAMANO_DOCUMENTO: number;
export type ArchivoGuardado = {
    rutaRelativa: string;
    mimeType: string;
    nombreOriginal: string;
    tamano: number;
};
export declare class VentaDocumentosService {
    private readonly ventaRepo;
    private readonly docRepo;
    private readonly baseDir;
    constructor(ventaRepo: Repository<Venta>, docRepo: Repository<VentaDocumento>);
    listar(clienteId: string, ventaId: string): Promise<VentaDocumento[]>;
    tiposPorVenta(clienteId: string, ventaIds: string[]): Promise<Map<string, string[]>>;
    subir(clienteId: string, ventaId: string, tipo: string, file: Express.Multer.File, usuarioId: string): Promise<VentaDocumento>;
    obtenerArchivo(clienteId: string, ventaId: string, ref: string): Promise<{
        doc: VentaDocumento;
        rutaAbsoluta: string;
    }>;
    eliminar(clienteId: string, ventaId: string, ref: string, usuarioId: string): Promise<void>;
    guardarArchivo(clienteId: string, ventaId: string, prefijo: string, file: Express.Multer.File): Promise<ArchivoGuardado>;
    rutaExistente(rutaRelativa: string): Promise<string>;
    borrarArchivo(rutaRelativa?: string | null): Promise<void>;
    private darDeBaja;
    private buscar;
    private obtenerVenta;
    private validarTipo;
    private limpiarNombre;
}
