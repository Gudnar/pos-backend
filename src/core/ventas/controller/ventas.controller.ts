import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { VentasService } from '../service/ventas.service'
import { CrearVentaDto, AnularVentaDto } from '../dto/venta.dto'
import { Messages } from '../../../common/constants/response-messages'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR')
@Controller('ventas')
export class VentasController {
  constructor(private readonly svc: VentasService) {}

  @Get()
  async listar(
    @Req() req: any,
    @Query('sucursalId') sucursalId?: string,
    @Query('fecha') fecha?: string,
    @Query('estadoVenta') estadoVenta?: string,
  ) {
    const datos = await this.svc.listar(req.user.clienteId, sucursalId, fecha, estadoVenta)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get(':id')
  async obtener(@Req() req: any, @Param('id') id: string) {
    const datos = await this.svc.obtener(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Req() req: any, @Body() dto: CrearVentaDto) {
    const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id/anular')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO')
  async anular(@Req() req: any, @Param('id') id: string, @Body() dto: AnularVentaDto) {
    const datos = await this.svc.anular(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: 'Venta anulada', datos }
  }
}
