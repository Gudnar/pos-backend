import { Repository } from 'typeorm';
import { PrecioProducto } from '../entity/precio-producto.entity';
import { PrecioPromocional } from '../entity/precio-promocional.entity';
import { CreatePrecioProductoDto, CreatePrecioPromocionalDto, UpdatePrecioPromocionalDto } from '../dto/precio.dto';
export declare class PreciosService {
    private readonly precioRepo;
    private readonly promoRepo;
    constructor(precioRepo: Repository<PrecioProducto>, promoRepo: Repository<PrecioPromocional>);
    listarPrecios(clienteId: string, productoId: string): Promise<any>;
    agregarEscalaPrecio(clienteId: string, productoId: string, dto: CreatePrecioProductoDto, usuarioCreacion: string): Promise<PrecioProducto[]>;
    listarPromociones(clienteId: string, productoId: string): Promise<PrecioPromocional[]>;
    crearPromocion(clienteId: string, productoId: string, dto: CreatePrecioPromocionalDto, usuarioCreacion: string): Promise<PrecioPromocional>;
    actualizarPromocion(clienteId: string, promoId: string, dto: UpdatePrecioPromocionalDto, usuarioModificacion: string): Promise<PrecioPromocional>;
    togglePromocion(clienteId: string, promoId: string, usuarioModificacion: string): Promise<PrecioPromocional>;
    eliminarPromocion(clienteId: string, promoId: string, usuarioModificacion: string): Promise<void>;
}
