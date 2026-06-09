import { Repository } from 'typeorm';
import { PagoProveedorImportacion } from '../entity/pago-proveedor-importacion.entity';
import { OrdenImportacion } from '../entity/orden-importacion.entity';
import { CreatePagoProveedorDto, UpdatePagoProveedorDto } from '../dto/pago-proveedor.dto';
import { MovimientosFuenteService } from '../../fuentes/service/movimientos-fuente.service';
export declare class PagosProveedorService {
    private readonly repo;
    private readonly ordenRepo;
    private readonly movimientosSvc;
    constructor(repo: Repository<PagoProveedorImportacion>, ordenRepo: Repository<OrdenImportacion>, movimientosSvc: MovimientosFuenteService);
    private validarLimite;
    listar(clienteId: string, ordenId: string): Promise<PagoProveedorImportacion[]>;
    obtener(clienteId: string, ordenId: string, id: string): Promise<PagoProveedorImportacion>;
    crear(clienteId: string, ordenId: string, dto: CreatePagoProveedorDto, usuarioCreacion: string): Promise<PagoProveedorImportacion>;
    actualizar(clienteId: string, ordenId: string, id: string, dto: UpdatePagoProveedorDto, usuarioModificacion: string): Promise<PagoProveedorImportacion>;
    eliminar(clienteId: string, ordenId: string, id: string, usuarioModificacion: string): Promise<void>;
}
