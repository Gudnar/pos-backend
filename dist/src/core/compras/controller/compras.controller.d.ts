import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { ComprasService } from '../service/compras.service';
import { CreateCompraDto, UpdateCompraDto, UpdateIngresoDto, MarcarPendienteDto, FinalizarCompraDto, EditarOrdenDto, CreatePagoProveedorDto, AnularCompraDto } from '../dto/compra.dto';
export declare class ComprasController {
    private readonly svc;
    constructor(svc: ComprasService);
    listar(req: any, tipo?: string, estado?: string, proveedorId?: string, fechaDesde?: string, fechaHasta?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    resumenPagosProveedores(req: any): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    historialPagos(req: any, proveedorId?: string, fechaDesde?: string, fechaHasta?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    exportarExcel(req: any, res: Response, tipo?: string, estado?: string, proveedorId?: string, fechaDesde?: string, fechaHasta?: string): Promise<StreamableFile>;
    exportarPdf(req: any, id: string, res: Response): Promise<StreamableFile>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    obtenerLogs(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/compra-log.entity").CompraLog[];
    }>;
    crear(req: any, dto: CreateCompraDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/compra.entity").Compra;
    }>;
    actualizar(req: any, id: string, dto: UpdateCompraDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/compra.entity").Compra;
    }>;
    editarOrden(req: any, id: string, dto: EditarOrdenDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/compra.entity").Compra;
    }>;
    editarIngreso(req: any, id: string, dto: UpdateIngresoDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/compra.entity").Compra;
    }>;
    eliminarIngreso(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
    anular(req: any, id: string, dto: AnularCompraDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
    marcarPendiente(req: any, id: string, dto: MarcarPendienteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/compra.entity").Compra;
    }>;
    finalizar(req: any, id: string, dto: FinalizarCompraDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/compra.entity").Compra;
    }>;
    listarPagos(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/pago-proveedor.entity").PagoProveedor[];
    }>;
    registrarPago(req: any, id: string, dto: CreatePagoProveedorDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/pago-proveedor.entity").PagoProveedor;
    }>;
    eliminarPago(req: any, id: string, pagoId: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
