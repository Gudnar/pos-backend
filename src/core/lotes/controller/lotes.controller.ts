import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { LotesService } from '../service/lotes.service'
import { IngresoLoteDto, CambiarEstadoLoteDto } from '../dto/lote.dto'
import { Messages } from '../../../common/constants/response-messages'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR')
@Controller('lotes')
export class LotesController {
  constructor(private readonly svc: LotesService) {}

  @Get('stock')
  async stockResumen(@Req() req: any, @Query('sucursalId') sucursalId: string) {
    const datos = await this.svc.stockResumen(req.user.clienteId, sucursalId)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get('todos')
  async listarTodos(
    @Req() req: any,
    @Query('sucursalId') sucursalId?: string,
    @Query('estadoLote') estadoLote?: string,
    @Query('search') search?: string,
  ) {
    const datos = await this.svc.listarTodos(req.user.clienteId, { sucursalId, estadoLote, search })
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get('reporte-general')
  async reporteGeneral(@Req() req: any, @Query('sucursalId') sucursalId?: string) {
    const datos = await this.svc.reporteGeneral(req.user.clienteId, { sucursalId })
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get('historial-precios')
  async historialPrecios(@Req() req: any, @Query('productoId') productoId?: string) {
    const datos = await this.svc.historialPrecios(req.user.clienteId, { productoId })
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get('por-producto')
  async listarPorProducto(
    @Req() req: any,
    @Query('sucursalId') sucursalId: string,
    @Query('productoId') productoId: string,
  ) {
    const datos = await this.svc.listarPorProducto(req.user.clienteId, sucursalId, productoId)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get('proximos-vencer')
  async proximosAVencer(@Req() req: any, @Query('sucursalId') sucursalId?: string) {
    const datos = await this.svc.proximosAVencer(req.user.clienteId, sucursalId)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get(':id')
  async obtener(@Req() req: any, @Param('id') id: string) {
    const datos = await this.svc.obtener(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get(':id/trazabilidad')
  async trazabilidad(@Req() req: any, @Param('id') id: string) {
    const datos = await this.svc.trazabilidad(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post('ingresar')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO')
  @HttpCode(HttpStatus.CREATED)
  async ingresar(@Req() req: any, @Body() dto: IngresoLoteDto) {
    const datos = await this.svc.ingresar(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id/estado')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO')
  async cambiarEstado(@Req() req: any, @Param('id') id: string, @Body() dto: CambiarEstadoLoteDto) {
    const datos = await this.svc.cambiarEstado(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }
}
