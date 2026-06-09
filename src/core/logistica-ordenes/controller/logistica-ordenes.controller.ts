import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { OrdenesImportacionService } from '../service/ordenes-importacion.service'
import { ItemsOrdenService } from '../service/items-orden.service'
import { PagosProveedorService } from '../service/pagos-proveedor.service'
import { GastosLogisticaService } from '../service/gastos-logistica.service'
import { CreateOrdenImportacionDto, UpdateOrdenImportacionDto, CerrarOrdenDto, ProponerPreciosDto } from '../dto/orden-importacion.dto'
import { CreateItemOrdenDto, UpdateItemOrdenDto } from '../dto/item-orden.dto'
import { CreatePagoProveedorDto, UpdatePagoProveedorDto } from '../dto/pago-proveedor.dto'
import { CreateGastoLogisticaDto, UpdateGastoLogisticaDto } from '../dto/gasto-logistica.dto'
import { Messages } from '../../../common/constants/response-messages'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE', 'SUPER_ADMIN')
@Controller('logistica-ordenes')
export class LogisticaOrdenesController {
  constructor(
    private readonly ordenesSvc: OrdenesImportacionService,
    private readonly itemsSvc: ItemsOrdenService,
    private readonly pagosSvc: PagosProveedorService,
    private readonly gastosSvc: GastosLogisticaService,
  ) {}

  // ── Órdenes ──────────────────────────────────────────────────────────────

  @Get()
  async listar(@Req() req: any, @Query('q') q?: string) {
    const datos = await this.ordenesSvc.listar(req.user.clienteId, q)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get(':id/trazabilidad')
  async trazabilidad(@Req() req: any, @Param('id') id: string) {
    const datos = await this.ordenesSvc.trazabilidad(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get(':id')
  async obtener(@Req() req: any, @Param('id') id: string) {
    const datos = await this.ordenesSvc.obtenerDetalle(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Req() req: any, @Body() dto: CreateOrdenImportacionDto) {
    const datos = await this.ordenesSvc.crear(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id')
  async actualizar(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateOrdenImportacionDto) {
    const datos = await this.ordenesSvc.actualizar(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Delete(':id')
  async eliminar(@Req() req: any, @Param('id') id: string) {
    await this.ordenesSvc.eliminar(req.user.clienteId, id, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }

  @Post(':id/calcular')
  async calcular(@Req() req: any, @Param('id') id: string) {
    const datos = await this.ordenesSvc.calcularCostos(req.user.clienteId, id, req.user.id)
    return { finalizado: true, mensaje: 'Costos calculados correctamente.', datos }
  }

  @Post(':id/proponer-precios')
  async proponerPrecios(@Req() req: any, @Param('id') id: string, @Body() dto: ProponerPreciosDto) {
    const datos = await this.ordenesSvc.proponerPrecios(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: 'Precios LOGÍSTICA asignados correctamente.', datos }
  }

  @Post(':id/cerrar')
  async cerrar(@Req() req: any, @Param('id') id: string, @Body() dto: CerrarOrdenDto) {
    const datos = await this.ordenesSvc.cerrarOrden(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: 'Orden cerrada y precios propuestos.', datos }
  }

  // ── Ítems ─────────────────────────────────────────────────────────────────

  @Get(':id/items')
  async listarItems(@Req() req: any, @Param('id') id: string) {
    const datos = await this.itemsSvc.listar(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  async crearItem(@Req() req: any, @Param('id') id: string, @Body() dto: CreateItemOrdenDto) {
    const datos = await this.itemsSvc.crear(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id/items/:itemId')
  async actualizarItem(@Req() req: any, @Param('id') id: string, @Param('itemId') itemId: string, @Body() dto: UpdateItemOrdenDto) {
    const datos = await this.itemsSvc.actualizar(req.user.clienteId, id, itemId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Delete(':id/items/:itemId')
  async eliminarItem(@Req() req: any, @Param('id') id: string, @Param('itemId') itemId: string) {
    await this.itemsSvc.eliminar(req.user.clienteId, id, itemId, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }

  // ── Pagos al Proveedor ────────────────────────────────────────────────────

  @Get(':id/pagos')
  async listarPagos(@Req() req: any, @Param('id') id: string) {
    const datos = await this.pagosSvc.listar(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post(':id/pagos')
  @HttpCode(HttpStatus.CREATED)
  async crearPago(@Req() req: any, @Param('id') id: string, @Body() dto: CreatePagoProveedorDto) {
    const datos = await this.pagosSvc.crear(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id/pagos/:pagoId')
  async actualizarPago(@Req() req: any, @Param('id') id: string, @Param('pagoId') pagoId: string, @Body() dto: UpdatePagoProveedorDto) {
    const datos = await this.pagosSvc.actualizar(req.user.clienteId, id, pagoId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Delete(':id/pagos/:pagoId')
  async eliminarPago(@Req() req: any, @Param('id') id: string, @Param('pagoId') pagoId: string) {
    await this.pagosSvc.eliminar(req.user.clienteId, id, pagoId, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }

  // ── Gastos de Logística ───────────────────────────────────────────────────

  @Get(':id/gastos')
  async listarGastos(@Req() req: any, @Param('id') id: string) {
    const datos = await this.gastosSvc.listar(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post(':id/gastos')
  @HttpCode(HttpStatus.CREATED)
  async crearGasto(@Req() req: any, @Param('id') id: string, @Body() dto: CreateGastoLogisticaDto) {
    const datos = await this.gastosSvc.crear(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id/gastos/:gastoId')
  async actualizarGasto(@Req() req: any, @Param('id') id: string, @Param('gastoId') gastoId: string, @Body() dto: UpdateGastoLogisticaDto) {
    const datos = await this.gastosSvc.actualizar(req.user.clienteId, id, gastoId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Delete(':id/gastos/:gastoId')
  async eliminarGasto(@Req() req: any, @Param('id') id: string, @Param('gastoId') gastoId: string) {
    await this.gastosSvc.eliminar(req.user.clienteId, id, gastoId, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }
}
