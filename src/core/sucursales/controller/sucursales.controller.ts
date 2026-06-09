import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { SucursalesService } from '../service/sucursales.service'
import { CreateSucursalDto, UpdateSucursalDto } from '../dto/sucursal.dto'
import { Messages } from '../../../common/constants/response-messages'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sucursales')
export class SucursalesController {
  constructor(private readonly svc: SucursalesService) {}

  @Get()
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR')
  async listar(@Req() req: any) {
    const datos = await this.svc.listar(req.user.clienteId)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get(':id')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO')
  async obtener(@Req() req: any, @Param('id') id: string) {
    const datos = await this.svc.obtener(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post()
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async crear(@Req() req: any, @Body() dto: CreateSucursalDto) {
    const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN')
  async actualizar(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateSucursalDto) {
    const datos = await this.svc.actualizar(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Delete(':id')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN')
  async eliminar(@Req() req: any, @Param('id') id: string) {
    await this.svc.eliminar(req.user.clienteId, id, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }
}
