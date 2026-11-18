import { DataSource, Repository } from 'typeorm';
import { Venta } from '../entity/venta.entity';
import { DetalleVenta } from '../entity/detalle-venta.entity';
import { VentaHojaRuta } from '../entity/venta-hoja-ruta.entity';
import { VentaComision } from '../entity/venta-comision.entity';
import { MovimientosFuenteService } from '../../fuentes/service/movimientos-fuente.service';
import { DatosNotaVentaDto, HojaRutaDto, CrearComisionDto } from '../dto/venta-extras.dto';
export declare const ORIGEN_COMISION = "venta_comision";
export declare class VentaExtrasService {
    private readonly ventaRepo;
    private readonly detalleRepo;
    private readonly hojaRepo;
    private readonly comisionRepo;
    private readonly movimientosSvc;
    private readonly ds;
    constructor(ventaRepo: Repository<Venta>, detalleRepo: Repository<DetalleVenta>, hojaRepo: Repository<VentaHojaRuta>, comisionRepo: Repository<VentaComision>, movimientosSvc: MovimientosFuenteService, ds: DataSource);
    private schema;
    private obtenerVenta;
    actualizarDatosNota(clienteId: string, ventaId: string, dto: DatosNotaVentaDto, usuarioId: string): Promise<Venta>;
    obtenerHojaRuta(clienteId: string, ventaId: string): Promise<VentaHojaRuta | null>;
    guardarHojaRuta(clienteId: string, ventaId: string, dto: HojaRutaDto, usuarioId: string): Promise<VentaHojaRuta>;
    listarComisiones(clienteId: string, ventaId: string): Promise<any[]>;
    crearComision(clienteId: string, ventaId: string, dto: CrearComisionDto, usuarioId: string): Promise<any>;
    eliminarComision(clienteId: string, ventaId: string, comisionId: string, usuarioId: string): Promise<void>;
    cancelarComisionesDeVenta(clienteId: string, ventaId: string, usuarioId: string): Promise<void>;
    totalComisionesPorVenta(clienteId: string, ventaIds: string[]): Promise<Map<string, number>>;
    datosImpresion(clienteId: string, ventaId: string): Promise<any>;
    private validarContacto;
}
