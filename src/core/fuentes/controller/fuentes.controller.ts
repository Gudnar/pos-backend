import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { FuentesService } from '../service/fuentes.service'
import { MovimientosFuenteService } from '../service/movimientos-fuente.service'
import { CreateFuenteDto, UpdateFuenteDto } from '../dto/fuente.dto'
import { CreateMovimientoFuenteDto, CreateTransferenciaDto, UpdateMovimientoFuenteDto } from '../dto/movimiento-fuente.dto'
import { Messages } from '../../../common/constants/response-messages'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE', 'SUPER_ADMIN')
@Controller('fuentes')
export class FuentesController {
  constructor(
    private readonly fuentesSvc: FuentesService,
    private readonly movimientosSvc: MovimientosFuenteService,
  ) {}

  // ── Fuentes ───────────────────────────────────────────────

  @Get()
  async listar(@Req() req: any) {
    const datos = await this.fuentesSvc.listar(req.user.clienteId)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get('resumen')
  async resumen(@Req() req: any) {
    const datos = await this.fuentesSvc.resumen(req.user.clienteId)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get(':id')
  async obtener(@Req() req: any, @Param('id') id: string) {
    const datos = await this.fuentesSvc.obtener(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Req() req: any, @Body() dto: CreateFuenteDto) {
    const datos = await this.fuentesSvc.crear(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id')
  async actualizar(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateFuenteDto) {
    const datos = await this.fuentesSvc.actualizar(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Delete(':id')
  async eliminar(@Req() req: any, @Param('id') id: string) {
    await this.fuentesSvc.eliminar(req.user.clienteId, id, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }

  // ── Movimientos ───────────────────────────────────────────

  @Get(':id/movimientos')
  async listarMovimientos(
    @Req() req: any,
    @Param('id') id: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('tipo') tipo?: string,
    @Query('categoria') categoria?: string,
  ) {
    const datos = await this.movimientosSvc.listar(req.user.clienteId, id, { desde, hasta, tipo, categoria })
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post(':id/movimientos')
  @HttpCode(HttpStatus.CREATED)
  async registrarMovimiento(@Req() req: any, @Param('id') id: string, @Body() dto: CreateMovimientoFuenteDto) {
    const datos = await this.movimientosSvc.registrar(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Post(':id/transferencia')
  @HttpCode(HttpStatus.CREATED)
  async registrarTransferencia(@Req() req: any, @Param('id') id: string, @Body() dto: CreateTransferenciaDto) {
    const datos = await this.movimientosSvc.registrarTransferencia(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: 'Transferencia registrada.', datos }
  }

  @Put(':id/movimientos/:movId')
  async actualizarMovimiento(@Req() req: any, @Param('id') id: string, @Param('movId') movId: string, @Body() dto: UpdateMovimientoFuenteDto) {
    const datos = await this.movimientosSvc.actualizar(req.user.clienteId, id, movId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Delete(':id/movimientos/:movId')
  async eliminarMovimiento(@Req() req: any, @Param('id') id: string, @Param('movId') movId: string) {
    await this.movimientosSvc.eliminar(req.user.clienteId, id, movId, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }
}
