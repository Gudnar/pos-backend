import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { ContactosClientesService } from '../service/contactos-clientes.service'
import { CreateContactoClienteDto, UpdateContactoClienteDto } from '../dto/contacto-cliente.dto'
import { RepresentantesService } from '../../representantes/service/representantes.service'
import {
  CreateRepresentanteDto,
  UpdateRepresentanteDto,
  DesactivarRepresentanteDto,
} from '../../representantes/dto/representante.dto'
import { Messages } from '../../../common/constants/response-messages'

const TIPO = 'CLIENTE'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR')
@Controller('contactos-clientes')
export class ContactosClientesController {
  constructor(
    private readonly svc: ContactosClientesService,
    private readonly repSvc: RepresentantesService,
  ) {}

  // ── Clientes ─────────────────────────────────────────────────────────────

  @Get()
  async listar(@Req() req: any, @Query('q') q?: string) {
    const datos = await this.svc.listar(req.user.clienteId, q)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get(':id')
  async obtener(@Req() req: any, @Param('id') id: string) {
    const datos = await this.svc.obtener(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Req() req: any, @Body() dto: CreateContactoClienteDto) {
    const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id')
  async actualizar(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateContactoClienteDto) {
    const datos = await this.svc.actualizar(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Delete(':id')
  async eliminar(@Req() req: any, @Param('id') id: string) {
    await this.svc.eliminar(req.user.clienteId, id, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }

  // ── Representantes ──────────────────────────────────────────────────────────

  @Get(':id/representantes')
  async listarReps(@Req() req: any, @Param('id') id: string) {
    const datos = await this.repSvc.listar(req.user.clienteId, TIPO, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post(':id/representantes')
  @HttpCode(HttpStatus.CREATED)
  async crearRep(@Req() req: any, @Param('id') id: string, @Body() dto: CreateRepresentanteDto) {
    const datos = await this.repSvc.crear(req.user.clienteId, TIPO, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id/representantes/:repId')
  async actualizarRep(
    @Req() req: any,
    @Param('repId') repId: string,
    @Body() dto: UpdateRepresentanteDto,
  ) {
    const datos = await this.repSvc.actualizar(req.user.clienteId, repId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Patch(':id/representantes/:repId/desactivar')
  async desactivarRep(
    @Req() req: any,
    @Param('repId') repId: string,
    @Body() dto: DesactivarRepresentanteDto,
  ) {
    const datos = await this.repSvc.desactivar(req.user.clienteId, repId, dto, req.user.id)
    return { finalizado: true, mensaje: 'Representante dado de baja', datos }
  }

  @Delete(':id/representantes/:repId')
  async eliminarRep(@Req() req: any, @Param('repId') repId: string) {
    await this.repSvc.eliminar(req.user.clienteId, repId, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }
}
