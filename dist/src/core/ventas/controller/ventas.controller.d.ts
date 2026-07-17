import { VentasService } from '../service/ventas.service';
import { CrearVentaDto, AnularVentaDto } from '../dto/venta.dto';
export declare class VentasController {
    private readonly svc;
    constructor(svc: VentasService);
    listar(req: any, sucursalId?: string, fechaDesde?: string, fechaHasta?: string, estadoVenta?: string, nombreCliente?: string, conSaldo?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/venta.entity").Venta[];
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
    anular(req: any, id: string, dto: AnularVentaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/venta.entity").Venta;
    }>;
}
