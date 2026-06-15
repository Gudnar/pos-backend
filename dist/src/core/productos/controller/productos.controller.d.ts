/// <reference types="multer" />
import { Response } from 'express';
import { ProductosService } from '../service/productos.service';
import { PreciosService } from '../service/precios.service';
import { ImportExportService } from '../service/importexport.service';
import { CreateProductoDto, UpdateProductoDto } from '../dto/producto.dto';
import { CreatePrecioProductoDto, CreatePrecioPromocionalDto, UpdatePrecioPromocionalDto } from '../dto/precio.dto';
export declare class ProductosController {
    private readonly svc;
    private readonly preciosSvc;
    private readonly importExportSvc;
    constructor(svc: ProductosService, preciosSvc: PreciosService, importExportSvc: ImportExportService);
    listar(req: any, subcategoriaId?: string, q?: string, soloActivos?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/producto.entity").Producto[];
    }>;
    listarParaPOS(req: any, q?: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    exportar(req: any, res: Response): Promise<void>;
    importar(req: any, file: Express.Multer.File): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: {
            importados: number;
            errores: {
                fila: number;
                error: string;
            }[];
        };
    }>;
    obtener(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/producto.entity").Producto;
    }>;
    crear(req: any, dto: CreateProductoDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/producto.entity").Producto;
    }>;
    actualizar(req: any, id: string, dto: UpdateProductoDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/producto.entity").Producto;
    }>;
    eliminar(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
    listarPrecios(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    agregarPrecio(req: any, id: string, dto: CreatePrecioProductoDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/precio-producto.entity").PrecioProducto[];
    }>;
    listarPromociones(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/precio-promocional.entity").PrecioPromocional[];
    }>;
    crearPromocion(req: any, id: string, dto: CreatePrecioPromocionalDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/precio-promocional.entity").PrecioPromocional;
    }>;
    actualizarPromocion(req: any, promoId: string, dto: UpdatePrecioPromocionalDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/precio-promocional.entity").PrecioPromocional;
    }>;
    togglePromocion(req: any, promoId: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/precio-promocional.entity").PrecioPromocional;
    }>;
    eliminarPromocion(req: any, promoId: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
