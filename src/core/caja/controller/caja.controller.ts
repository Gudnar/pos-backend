import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { CajaService } from '../service/caja.service'
import { CreateCajaDto, UpdateCajaDto, AbrirSesionDto, CerrarSesionDto } from '../dto/caja.dto'
import { Messages } from '../../../common/constants/response-messages'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR')
@Controller('caja')
export class CajaController {
  constructor(private readonly svc: CajaService) {}

  @Get()
  async listar(@Req() req: any, @Query('sucursalId') sucursalId?: string) {
    const datos = await this.svc.listar(req.user.clienteId, sucursalId)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post()
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO')
  @HttpCode(HttpStatus.CREATED)
  async crear(@Req() req: any, @Body() dto: CreateCajaDto) {
    const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO')
  async actualizar(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCajaDto) {
    const datos = await this.svc.actualizar(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Delete(':id')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN')
  async eliminar(@Req() req: any, @Param('id') id: string) {
    await this.svc.eliminar(req.user.clienteId, id, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }

  // ── Sesiones ──────────────────────────────────────────────────────────────

  @Get('sesion/activa')
  async sesionActiva(@Req() req: any) {
    const datos = await this.svc.sesionActiva(req.user.clienteId, req.user.id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get('sesiones/dia')
  async sesionesDia(@Req() req: any, @Query('fecha') fecha?: string, @Query('sucursalId') sucursalId?: string) {
    const datos = await this.svc.sesionesDia(req.user.clienteId, fecha, sucursalId)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get('sesiones')
  async ultimasSesiones(@Req() req: any, @Query('cajaId') cajaId?: string) {
    const datos = await this.svc.ultimasSesiones(req.user.clienteId, cajaId)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post('sesion/abrir')
  @HttpCode(HttpStatus.CREATED)
  async abrirSesion(@Req() req: any, @Body() dto: AbrirSesionDto) {
    const datos = await this.svc.abrirSesion(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: 'Sesión abierta', datos }
  }

  @Put('sesion/:id/cerrar')
  async cerrarSesion(@Req() req: any, @Param('id') id: string, @Body() dto: CerrarSesionDto) {
    const datos = await this.svc.cerrarSesion(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: 'Sesión cerrada', datos }
  }
}
