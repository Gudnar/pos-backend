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
import { GastosService } from '../service/gastos.service'
import { CreateGastoDto, UpdateGastoDto } from '../dto/gasto.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR')
@Controller('gastos')
export class GastosController {
  constructor(private readonly svc: GastosService) {}

  @Get()
  async listar(
    @Req() req: any,
    @Query('tipo') tipo?: string,
    @Query('categoria') categoria?: string,
    @Query('fecha') fecha?: string,
  ) {
    const datos = await this.svc.listar(req.user.clienteId, tipo, categoria, fecha)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get(':id')
  async obtener(@Req() req: any, @Param('id') id: string) {
    const datos = await this.svc.obtener(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post()
  async crear(@Req() req: any, @Body() dto: CreateGastoDto) {
    const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: 'Gasto registrado correctamente', datos }
  }

  @Put(':id')
  async actualizar(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateGastoDto) {
    const datos = await this.svc.actualizar(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: 'Gasto actualizado correctamente', datos }
  }

  @Delete(':id')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO')
  async eliminar(@Req() req: any, @Param('id') id: string) {
    await this.svc.eliminar(req.user.clienteId, id, req.user.id)
    return { finalizado: true, mensaje: 'Gasto eliminado correctamente', datos: null }
  }
}
