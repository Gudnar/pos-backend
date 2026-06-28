/// <reference types="node" />
import { Repository, DataSource } from 'typeorm';
import { Compra } from '../entity/compra.entity';
import { CompraDetalle } from '../entity/compra-detalle.entity';
import { PagoProveedor } from '../entity/pago-proveedor.entity';
import { CompraLog } from '../entity/compra-log.entity';
import { Lote } from '../../lotes/entity/lote.entity';
import { MovimientoStock } from '../../movimientos-stock/entity/movimiento-stock.entity';
import { CreateCompraDto, UpdateCompraDto, UpdateIngresoDto, MarcarPendienteDto, FinalizarCompraDto, EditarOrdenDto, CreatePagoProveedorDto } from '../dto/compra.dto';
import { MovimientosFuenteService } from '../../fuentes/service/movimientos-fuente.service';
export declare class ComprasService {
    private readonly compraRepo;
    private readonly detalleRepo;
    private readonly pagoRepo;
    private readonly logRepo;
    private readonly loteRepo;
    private readonly movimientoRepo;
    private readonly dataSource;
    private readonly movimientosFuenteService;
    constructor(compraRepo: Repository<Compra>, detalleRepo: Repository<CompraDetalle>, pagoRepo: Repository<PagoProveedor>, logRepo: Repository<CompraLog>, loteRepo: Repository<Lote>, movimientoRepo: Repository<MovimientoStock>, dataSource: DataSource, movimientosFuenteService: MovimientosFuenteService);
    listar(clienteId: string, filtros?: {
        tipo?: string;
        estado?: string;
        proveedorId?: string;
        fechaDesde?: string;
        fechaHasta?: string;
    }): Promise<any[]>;
    obtener(clienteId: string, id: string): Promise<any>;
    crear(clienteId: string, dto: CreateCompraDto, usuarioId: string): Promise<Compra>;
    editarOrden(clienteId: string, id: string, dto: EditarOrdenDto, usuarioId: string): Promise<Compra>;
    actualizar(clienteId: string, id: string, dto: UpdateCompraDto, usuarioId: string): Promise<Compra>;
    editarIngreso(clienteId: string, id: string, dto: UpdateIngresoDto, usuarioId: string): Promise<Compra>;
    eliminarIngreso(clienteId: string, id: string, usuarioId: string): Promise<void>;
    anular(clienteId: string, id: string, motivo: string | undefined, usuarioId: string): Promise<void>;
    marcarPendiente(clienteId: string, id: string, dto: MarcarPendienteDto, usuarioId: string): Promise<Compra>;
    finalizar(clienteId: string, id: string, dto: FinalizarCompraDto, usuarioId: string): Promise<Compra>;
    obtenerLogs(clienteId: string, compraId: string): Promise<CompraLog[]>;
    exportarExcel(clienteId: string, filtros?: {
        tipo?: string;
        estado?: string;
        proveedorId?: string;
        fechaDesde?: string;
        fechaHasta?: string;
    }): Promise<Buffer>;
    generarPdf(clienteId: string, id: string): Promise<Buffer>;
    historialPagos(clienteId: string, filtros?: {
        proveedorId?: string;
        fechaDesde?: string;
        fechaHasta?: string;
    }): Promise<any[]>;
    listarPagos(clienteId: string, compraId: string): Promise<PagoProveedor[]>;
    registrarPago(clienteId: string, compraId: string, dto: CreatePagoProveedorDto, usuarioId: string): Promise<PagoProveedor>;
    eliminarPago(clienteId: string, compraId: string, pagoId: string, usuarioId: string): Promise<void>;
    resumenPagosProveedores(clienteId: string): Promise<any[]>;
    private generarNro;
    private ingresarLotesEnManager;
    private recalcularPago;
    private log;
}
