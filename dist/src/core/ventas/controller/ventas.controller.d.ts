/// <reference types="multer" />
import { Response } from 'express';
import { VentasService } from '../service/ventas.service';
import { VentaDocumentosService } from '../service/venta-documentos.service';
import { VentaExtrasService } from '../service/venta-extras.service';
import { DatosNotaVentaDto, HojaRutaDto, CrearComisionDto } from '../dto/venta-extras.dto';
import { CrearVentaDto, AnularVentaDto, VentaPosDto } from '../dto/venta.dto';
export declare class VentasController {
    private readonly svc;
    private readonly docsSvc;
    private readonly extrasSvc;
    constructor(svc: VentasService, docsSvc: VentaDocumentosService, extrasSvc: VentaExtrasService);
    listar(req: any, sucursalId?: string, fechaDesde?: string, fechaHasta?: string, estadoVenta?: string, nombreCliente?: string, conSaldo?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: {
            documentos: string[];
            totalComisiones: number;
            id: string;
            clienteId: string;
            sucursalId: string;
            cajaId?: string | undefined;
            cajaSesionId?: string | undefined;
            usuarioId: string;
            nroVenta: string;
            fecha: string;
            estadoVenta: string;
            metodoPago?: string | undefined;
            subtotal: number;
            descuento: number;
            impuesto: number;
            total: number;
            montoPagado?: number | undefined;
            cambio?: number | undefined;
            contactoClienteId?: string | undefined;
            nombreCliente?: string | undefined;
            observaciones?: string | undefined;
            adelantoId?: string | undefined;
            montoAdelanto?: number | undefined;
            montoEfectivo?: number | undefined;
            nitCi?: string | undefined;
            telefonoCliente?: string | undefined;
            direccionCliente?: string | undefined;
            nroPesaje?: string | undefined;
            nroFactura?: string | undefined;
            estado: string;
            transaccion: string;
            usuarioCreacion: string;
            fechaCreacion: Date;
            usuarioModificacion?: string | null | undefined;
            fechaModificacion?: Date | null | undefined;
        }[];
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    crear(req: any, dto: CrearVentaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/venta.entity").Venta;
    }>;
    cobrar(req: any, dto: VentaPosDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/venta.entity").Venta;
    }>;
    guardarSinCobro(req: any, dto: VentaPosDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/venta.entity").Venta;
    }>;
    anular(req: any, id: string, dto: AnularVentaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/venta.entity").Venta;
    }>;
    listarDocumentos(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/venta-documento.entity").VentaDocumento[];
    }>;
    subirDocumento(req: any, id: string, tipo: string, file: Express.Multer.File): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/venta-documento.entity").VentaDocumento;
    }>;
    verDocumento(req: any, id: string, tipo: string, res: Response): Promise<void>;
    eliminarDocumento(req: any, id: string, tipo: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
    datosImpresion(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    actualizarDatosNota(req: any, id: string, dto: DatosNotaVentaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/venta.entity").Venta;
    }>;
    obtenerHojaRuta(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/venta-hoja-ruta.entity").VentaHojaRuta | null;
    }>;
    guardarHojaRuta(req: any, id: string, dto: HojaRutaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/venta-hoja-ruta.entity").VentaHojaRuta;
    }>;
    listarComisiones(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    crearComision(req: any, id: string, dto: CrearComisionDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    eliminarComision(req: any, id: string, comisionId: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
