/// <reference types="multer" />
import { DataSource, Repository } from 'typeorm';
import { Venta } from '../entity/venta.entity';
import { VentaPago } from '../entity/venta-pago.entity';
import { VentaDocumentosService } from './venta-documentos.service';
import { MovimientosFuenteService } from '../../fuentes/service/movimientos-fuente.service';
import { RegistrarPagoVentaDto } from '../dto/venta-pago.dto';
export declare const ORIGEN_MOV_PAGO = "venta_pago";
export declare class VentaPagosService {
    private readonly ventaRepo;
    private readonly pagoRepo;
    private readonly docsSvc;
    private readonly movimientosSvc;
    private readonly ds;
    private schema;
    constructor(ventaRepo: Repository<Venta>, pagoRepo: Repository<VentaPago>, docsSvc: VentaDocumentosService, movimientosSvc: MovimientosFuenteService, ds: DataSource);
    private obtenerVenta;
    listar(clienteId: string, ventaId: string): Promise<any>;
    registrarAbono(clienteId: string, ventaId: string, dto: RegistrarPagoVentaDto, usuarioId: string): Promise<VentaPago>;
    eliminarAbono(clienteId: string, ventaId: string, pagoId: string, usuarioId: string): Promise<void>;
    cancelarMovimientosDeVenta(clienteId: string, ventaId: string, usuarioId: string): Promise<void>;
    detallarPagoInicialConComprobante(clienteId: string, ventaId: string, file: Express.Multer.File, usuarioId: string): Promise<VentaPago>;
    subirComprobante(clienteId: string, ventaId: string, pagoId: string, file: Express.Multer.File, usuarioId: string): Promise<any>;
    obtenerComprobante(clienteId: string, ventaId: string, pagoId: string): Promise<{
        nombre: string;
        mime: string;
        rutaAbsoluta: string;
    }>;
    eliminarComprobante(clienteId: string, ventaId: string, pagoId: string, usuarioId: string): Promise<void>;
    private buscarPago;
}
