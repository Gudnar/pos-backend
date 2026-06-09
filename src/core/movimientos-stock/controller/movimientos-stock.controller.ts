import { Controller, Get, Post, Body, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { MovimientosStockService } from '../service/movimientos-stock.service'
import { RegistrarMovimientoDto, TransferirStockDto } from '../dto/movimiento-stock.dto'
import { Messages } from '../../../common/constants/response-messages'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR')
@Controller('movimientos-stock')
export class MovimientosStockController {
  constructor(private readonly svc: MovimientosStockService) {}

  @Get('kardex')
  async kardex(
    @Req() req: any,
    @Query('sucursalId') sucursalId?: string,
    @Query('productoId') productoId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('tipo') tipo?: string,
  ) {
    const datos = await this.svc.kardex(req.user.clienteId, { sucursalId, productoId, fechaDesde, fechaHasta, tipo })
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get('sin-movimiento')
  async sinMovimiento(
    @Req() req: any,
    @Query('sucursalId') sucursalId?: string,
    @Query('dias') dias?: string,
  ) {
    const datos = await this.svc.sinMovimiento(req.user.clienteId, { sucursalId, dias: dias ? Number(dias) : undefined })
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get('reporte-rotacion')
  async reporteRotacion(
    @Req() req: any,
    @Query('sucursalId') sucursalId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    const datos = await this.svc.reporteRotacion(req.user.clienteId, { sucursalId, fechaDesde, fechaHasta })
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get()
  async listar(
    @Req() req: any,
    @Query('sucursalId') sucursalId: string,
    @Query('productoId') productoId?: string,
  ) {
    const datos = await this.svc.listarPorSucursal(req.user.clienteId, sucursalId, productoId)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post()
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO')
  @HttpCode(HttpStatus.CREATED)
  async registrar(@Req() req: any, @Body() dto: RegistrarMovimientoDto) {
    const datos = await this.svc.registrar(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Post('transferir')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO')
  @HttpCode(HttpStatus.CREATED)
  async transferir(@Req() req: any, @Body() dto: TransferirStockDto) {
    const datos = await this.svc.transferir(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: 'Transferencia registrada', datos }
  }
}
