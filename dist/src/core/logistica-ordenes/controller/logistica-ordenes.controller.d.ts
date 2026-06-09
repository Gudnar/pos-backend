import { OrdenesImportacionService } from '../service/ordenes-importacion.service';
import { ItemsOrdenService } from '../service/items-orden.service';
import { PagosProveedorService } from '../service/pagos-proveedor.service';
import { GastosLogisticaService } from '../service/gastos-logistica.service';
import { CreateOrdenImportacionDto, UpdateOrdenImportacionDto, CerrarOrdenDto, ProponerPreciosDto } from '../dto/orden-importacion.dto';
import { CreateItemOrdenDto, UpdateItemOrdenDto } from '../dto/item-orden.dto';
import { CreatePagoProveedorDto, UpdatePagoProveedorDto } from '../dto/pago-proveedor.dto';
import { CreateGastoLogisticaDto, UpdateGastoLogisticaDto } from '../dto/gasto-logistica.dto';
export declare class LogisticaOrdenesController {
    private readonly ordenesSvc;
    private readonly itemsSvc;
    private readonly pagosSvc;
    private readonly gastosSvc;
    constructor(ordenesSvc: OrdenesImportacionService, itemsSvc: ItemsOrdenService, pagosSvc: PagosProveedorService, gastosSvc: GastosLogisticaService);
    listar(req: any, q?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/orden-importacion.entity").OrdenImportacion[];
    }>;
    trazabilidad(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    crear(req: any, dto: CreateOrdenImportacionDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/orden-importacion.entity").OrdenImportacion;
    }>;
    actualizar(req: any, id: string, dto: UpdateOrdenImportacionDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/orden-importacion.entity").OrdenImportacion;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
    calcular(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    proponerPrecios(req: any, id: string, dto: ProponerPreciosDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    cerrar(req: any, id: string, dto: CerrarOrdenDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    listarItems(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/item-orden-importacion.entity").ItemOrdenImportacion[];
    }>;
    crearItem(req: any, id: string, dto: CreateItemOrdenDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/item-orden-importacion.entity").ItemOrdenImportacion;
    }>;
    actualizarItem(req: any, id: string, itemId: string, dto: UpdateItemOrdenDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/item-orden-importacion.entity").ItemOrdenImportacion;
    }>;
    eliminarItem(req: any, id: string, itemId: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
    listarPagos(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/pago-proveedor-importacion.entity").PagoProveedorImportacion[];
    }>;
    crearPago(req: any, id: string, dto: CreatePagoProveedorDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/pago-proveedor-importacion.entity").PagoProveedorImportacion;
    }>;
    actualizarPago(req: any, id: string, pagoId: string, dto: UpdatePagoProveedorDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/pago-proveedor-importacion.entity").PagoProveedorImportacion;
    }>;
    eliminarPago(req: any, id: string, pagoId: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
    listarGastos(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/gasto-logistica.entity").GastoLogistica[];
    }>;
    crearGasto(req: any, id: string, dto: CreateGastoLogisticaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/gasto-logistica.entity").GastoLogistica;
    }>;
    actualizarGasto(req: any, id: string, gastoId: string, dto: UpdateGastoLogisticaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/gasto-logistica.entity").GastoLogistica;
    }>;
    eliminarGasto(req: any, id: string, gastoId: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
