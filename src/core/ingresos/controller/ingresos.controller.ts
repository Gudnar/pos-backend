import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { IngresosService } from '../service/ingresos.service'
import { CreateIngresoDto, UpdateIngresoDto } from '../dto/ingreso.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR')
@Controller('ingresos')
export class IngresosController {
  constructor(private readonly svc: IngresosService) {}

  @Get()
  async listar(
    @Req() req: any,
    @Query('tipo') tipo?: string,
    @Query('categoria') categoria?: string,
  ) {
    const datos = await this.svc.listar(req.user.clienteId, tipo, categoria)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get('adelantos')
  async listarAdelantos(
    @Req() req: any,
    @Query('contactoClienteId') contactoClienteId?: string,
  ) {
    const datos = await this.svc.listarAdelantos(req.user.clienteId, contactoClienteId)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get(':id')
  async obtener(@Req() req: any, @Param('id') id: string) {
    const datos = await this.svc.obtener(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post()
  async crear(@Req() req: any, @Body() dto: CreateIngresoDto) {
    const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: 'Ingreso registrado correctamente', datos }
  }

  @Put(':id')
  async actualizar(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateIngresoDto) {
    const datos = await this.svc.actualizar(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: 'Ingreso actualizado correctamente', datos }
  }

  @Put(':id/anular')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO')
  async anular(@Req() req: any, @Param('id') id: string) {
    await this.svc.anular(req.user.clienteId, id, req.user.id)
    return { finalizado: true, mensaje: 'Ingreso anulado correctamente', datos: null }
  }
}
