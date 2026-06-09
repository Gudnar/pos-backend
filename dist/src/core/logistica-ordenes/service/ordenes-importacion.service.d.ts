import { Repository } from 'typeorm';
import { OrdenImportacion } from '../entity/orden-importacion.entity';
import { ItemOrdenImportacion } from '../entity/item-orden-importacion.entity';
import { PagoProveedorImportacion } from '../entity/pago-proveedor-importacion.entity';
import { GastoLogistica } from '../entity/gasto-logistica.entity';
import { PrecioProducto } from '../../productos/entity/precio-producto.entity';
import { LotesService } from '../../lotes/service/lotes.service';
import { CreateOrdenImportacionDto, UpdateOrdenImportacionDto, CerrarOrdenDto, ProponerPreciosDto } from '../dto/orden-importacion.dto';
export declare class OrdenesImportacionService {
    private readonly ordenRepo;
    private readonly itemRepo;
    private readonly pagoRepo;
    private readonly gastoRepo;
    private readonly precioRepo;
    private readonly lotesSvc;
    constructor(ordenRepo: Repository<OrdenImportacion>, itemRepo: Repository<ItemOrdenImportacion>, pagoRepo: Repository<PagoProveedorImportacion>, gastoRepo: Repository<GastoLogistica>, precioRepo: Repository<PrecioProducto>, lotesSvc: LotesService);
    listar(clienteId: string, q?: string): Promise<OrdenImportacion[]>;
    obtener(clienteId: string, id: string): Promise<OrdenImportacion>;
    obtenerDetalle(clienteId: string, id: string): Promise<any>;
    private generarNumero;
    crear(clienteId: string, dto: CreateOrdenImportacionDto, usuarioCreacion: string): Promise<OrdenImportacion>;
    actualizar(clienteId: string, id: string, dto: UpdateOrdenImportacionDto, usuarioModificacion: string): Promise<OrdenImportacion>;
    eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
    calcularCostos(clienteId: string, id: string, usuarioModificacion: string): Promise<any>;
    cerrarOrden(clienteId: string, id: string, dto: CerrarOrdenDto, usuarioModificacion: string): Promise<any>;
    proponerPrecios(clienteId: string, id: string, dto: ProponerPreciosDto, usuarioModificacion: string): Promise<any>;
    trazabilidad(clienteId: string, id: string): Promise<any>;
}
