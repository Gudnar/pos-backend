import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { CotizacionesService } from '../service/cotizaciones.service'
import { CrearCotizacionDto, AnularCotizacionDto } from '../dto/cotizacion.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR')
@Controller('cotizaciones')
export class CotizacionesController {
  constructor(private readonly svc: CotizacionesService) {}

  @Get()
  async listar(
    @Req() req: any,
    @Query('sucursalId') sucursalId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('estado') estado?: string,
    @Query('nombreCliente') nombreCliente?: string,
  ) {
    const datos = await this.svc.listar(req.user.clienteId, { sucursalId, fechaDesde, fechaHasta, estado, nombreCliente })
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Req() req: any, @Body() dto: CrearCotizacionDto) {
    const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: 'Cotización registrada', datos }
  }

  @Get(':id')
  async obtener(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const datos = await this.svc.obtener(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get(':id/impresion')
  async impresion(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const datos = await this.svc.datosImpresion(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Put(':id/anular')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO')
  async anular(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AnularCotizacionDto) {
    const datos = await this.svc.anular(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: 'Cotización anulada', datos }
  }
}
