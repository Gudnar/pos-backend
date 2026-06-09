import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  Req, Res, UseGuards, HttpCode, HttpStatus, StreamableFile,
} from '@nestjs/common'
import { Response } from 'express'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { ComprasService } from '../service/compras.service'
import {
  CreateCompraDto, UpdateCompraDto, UpdateIngresoDto,
  MarcarPendienteDto, FinalizarCompraDto, EditarOrdenDto,
  CreatePagoProveedorDto, AnularCompraDto,
} from '../dto/compra.dto'
import { Messages } from '../../../common/constants/response-messages'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE', 'SUPER_ADMIN')
@Controller('compras')
export class ComprasController {
  constructor(private readonly svc: ComprasService) {}

  // ── Compras ─────────────────────────────────────────────────────────────────

  @Get()
  async listar(
    @Req() req: any,
    @Query('tipo') tipo?: string,
    @Query('estado') estado?: string,
    @Query('proveedorId') proveedorId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    const datos = await this.svc.listar(req.user.clienteId, { tipo, estado, proveedorId, fechaDesde, fechaHasta })
    return { finalizado: true, mensaje: 'OK', datos }
  }

  // Must come before /:id to avoid route conflict
  @Get('pagos/resumen-proveedores')
  async resumenPagosProveedores(@Req() req: any) {
    const datos = await this.svc.resumenPagosProveedores(req.user.clienteId)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get('pagos/historial')
  async historialPagos(
    @Req() req: any,
    @Query('proveedorId') proveedorId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    const datos = await this.svc.historialPagos(req.user.clienteId, { proveedorId, fechaDesde, fechaHasta })
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get('reporte/excel')
  async exportarExcel(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @Query('tipo') tipo?: string,
    @Query('estado') estado?: string,
    @Query('proveedorId') proveedorId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    const buffer = await this.svc.exportarExcel(req.user.clienteId, { tipo, estado, proveedorId, fechaDesde, fechaHasta })
    const filename = `ordenes-compra-${new Date().toISOString().split('T')[0]}.xlsx`
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    })
    return new StreamableFile(Buffer.from(buffer))
  }

  @Get(':id/pdf')
  async exportarPdf(
    @Req() req: any,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.svc.generarPdf(req.user.clienteId, id)
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="orden-${id}.pdf"`,
    })
    return new StreamableFile(Buffer.from(buffer))
  }

  @Get(':id')
  async obtener(@Req() req: any, @Param('id') id: string) {
    const datos = await this.svc.obtener(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get(':id/logs')
  async obtenerLogs(@Req() req: any, @Param('id') id: string) {
    const datos = await this.svc.obtenerLogs(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Req() req: any, @Body() dto: CreateCompraDto) {
    const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id')
  async actualizar(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCompraDto) {
    const datos = await this.svc.actualizar(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  // Edit header + items when EN_TRANSITO or PENDIENTE
  @Put(':id/editar')
  async editarOrden(@Req() req: any, @Param('id') id: string, @Body() dto: EditarOrdenDto) {
    const datos = await this.svc.editarOrden(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Put(':id/ingreso')
  async editarIngreso(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateIngresoDto) {
    const datos = await this.svc.editarIngreso(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Delete(':id/ingreso')
  async eliminarIngreso(@Req() req: any, @Param('id') id: string) {
    await this.svc.eliminarIngreso(req.user.clienteId, id, req.user.id)
    return { finalizado: true, mensaje: 'Ingreso eliminado', datos: null }
  }

  @Delete(':id')
  async anular(@Req() req: any, @Param('id') id: string, @Body() dto: AnularCompraDto) {
    await this.svc.anular(req.user.clienteId, id, dto.motivo, req.user.id)
    return { finalizado: true, mensaje: 'Compra anulada', datos: null }
  }

  // EN_TRANSITO → PENDIENTE (goods arrived at warehouse)
  @Post(':id/recibir')
  async marcarPendiente(@Req() req: any, @Param('id') id: string, @Body() dto: MarcarPendienteDto) {
    const datos = await this.svc.marcarPendiente(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: 'Compra marcada como recibida en almacén', datos }
  }

  // PENDIENTE → FINALIZADO (assign lots, create stock)
  @Post(':id/finalizar')
  async finalizar(@Req() req: any, @Param('id') id: string, @Body() dto: FinalizarCompraDto) {
    const datos = await this.svc.finalizar(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: 'Compra finalizada. Inventario actualizado.', datos }
  }

  // ── Pagos ───────────────────────────────────────────────────────────────────

  @Get(':id/pagos')
  async listarPagos(@Req() req: any, @Param('id') id: string) {
    const datos = await this.svc.listarPagos(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post(':id/pagos')
  @HttpCode(HttpStatus.CREATED)
  async registrarPago(@Req() req: any, @Param('id') id: string, @Body() dto: CreatePagoProveedorDto) {
    const datos = await this.svc.registrarPago(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: 'Pago registrado', datos }
  }

  @Delete(':id/pagos/:pagoId')
  async eliminarPago(@Req() req: any, @Param('id') id: string, @Param('pagoId') pagoId: string) {
    await this.svc.eliminarPago(req.user.clienteId, id, pagoId, req.user.id)
    return { finalizado: true, mensaje: 'Pago eliminado', datos: null }
  }
}
