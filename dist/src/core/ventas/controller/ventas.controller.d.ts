import { VentasService } from '../service/ventas.service';
import { CrearVentaDto, AnularVentaDto } from '../dto/venta.dto';
export declare class VentasController {
    private readonly svc;
    constructor(svc: VentasService);
    listar(req: any, sucursalId?: string, fecha?: string, estadoVenta?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/venta.entity").Venta[];
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: {
            venta: import("../entity/venta.entity").Venta;
            detalles: import("../entity/detalle-venta.entity").DetalleVenta[];
        };
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
