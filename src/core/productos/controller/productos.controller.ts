import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, Req, Res, UseGuards, HttpCode, HttpStatus,
  UseInterceptors, UploadedFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { ProductosService } from '../service/productos.service'
import { PreciosService } from '../service/precios.service'
import { ImportExportService } from '../service/importexport.service'
import { CreateProductoDto, UpdateProductoDto } from '../dto/producto.dto'
import { CreatePrecioProductoDto, CreatePrecioPromocionalDto, UpdatePrecioPromocionalDto } from '../dto/precio.dto'
import { Messages } from '../../../common/constants/response-messages'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE', 'SUPER_ADMIN')
@Controller('productos')
export class ProductosController {
  constructor(
    private readonly svc: ProductosService,
    private readonly preciosSvc: PreciosService,
    private readonly importExportSvc: ImportExportService,
  ) {}

  // ── Productos CRUD ───────────────────────────────────────────────────────────

  @Get()
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR')
  async listar(@Req() req: any, @Query('subcategoriaId') subcategoriaId?: string, @Query('q') q?: string) {
    const datos = await this.svc.listar(req.user.clienteId, subcategoriaId, q)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get('pos')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR')
  async listarParaPOS(@Req() req: any, @Query('q') q?: string) {
    const datos = await this.svc.listarParaPOS(req.user.clienteId, q)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get('exportar')
  async exportar(@Req() req: any, @Res() res: Response) {
    const buffer = await this.importExportSvc.exportar(req.user.clienteId)
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="productos_${Date.now()}.xlsx"`,
      'Content-Length': buffer.length,
    })
    res.end(buffer)
  }

  @Post('importar')
  @UseInterceptors(FileInterceptor('file'))
  async importar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('Archivo requerido')
    const datos = await this.importExportSvc.importar(req.user.clienteId, req.user.id, file.buffer)
    return { finalizado: true, mensaje: `${datos.importados} producto(s) importados`, datos }
  }

  @Get(':id')
  async obtener(@Req() req: any, @Param('id') id: string) {
    const datos = await this.svc.obtener(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Req() req: any, @Body() dto: CreateProductoDto) {
    const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id')
  async actualizar(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProductoDto) {
    const datos = await this.svc.actualizar(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Delete(':id')
  async eliminar(@Req() req: any, @Param('id') id: string) {
    await this.svc.eliminar(req.user.clienteId, id, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }

  // ── Precios con escala ───────────────────────────────────────────────────────

  @Get(':id/precios')
  async listarPrecios(@Req() req: any, @Param('id') id: string) {
    const datos = await this.preciosSvc.listarPrecios(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post(':id/precios')
  @HttpCode(HttpStatus.CREATED)
  async agregarPrecio(@Req() req: any, @Param('id') id: string, @Body() dto: CreatePrecioProductoDto) {
    const datos = await this.preciosSvc.agregarEscalaPrecio(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  // ── Promociones ──────────────────────────────────────────────────────────────

  @Get(':id/promociones')
  async listarPromociones(@Req() req: any, @Param('id') id: string) {
    const datos = await this.preciosSvc.listarPromociones(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post(':id/promociones')
  @HttpCode(HttpStatus.CREATED)
  async crearPromocion(@Req() req: any, @Param('id') id: string, @Body() dto: CreatePrecioPromocionalDto) {
    const datos = await this.preciosSvc.crearPromocion(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id/promociones/:promoId')
  async actualizarPromocion(@Req() req: any, @Param('promoId') promoId: string, @Body() dto: UpdatePrecioPromocionalDto) {
    const datos = await this.preciosSvc.actualizarPromocion(req.user.clienteId, promoId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Patch(':id/promociones/:promoId/toggle')
  async togglePromocion(@Req() req: any, @Param('promoId') promoId: string) {
    const datos = await this.preciosSvc.togglePromocion(req.user.clienteId, promoId, req.user.id)
    return { finalizado: true, mensaje: 'Promoción actualizada', datos }
  }

  @Delete(':id/promociones/:promoId')
  async eliminarPromocion(@Req() req: any, @Param('promoId') promoId: string) {
    await this.preciosSvc.eliminarPromocion(req.user.clienteId, promoId, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }
}
