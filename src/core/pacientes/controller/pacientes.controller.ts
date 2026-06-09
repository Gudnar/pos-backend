import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { PacientesService } from '../service/pacientes.service'
import {
  CreatePacienteDto,
  UpdatePacienteDto,
  CreateConsultaDto,
  UpdateConsultaDto,
} from '../dto/paciente.dto'
import { Messages } from '../../../common/constants/response-messages'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE', 'SUPER_ADMIN')
@Controller('pacientes')
export class PacientesController {
  constructor(private readonly svc: PacientesService) {}

  // ── Pacientes ──────────────────────────────────────────────────────────────

  @Get()
  async listar(@Req() req: any, @Query('q') q?: string) {
    const datos = await this.svc.listar(req.user.clienteId, q)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get('buscar')
  async buscar(@Req() req: any, @Query('q') q: string) {
    const datos = await this.svc.buscar(req.user.clienteId, q || '')
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get(':id')
  async obtener(@Req() req: any, @Param('id') id: string) {
    const datos = await this.svc.obtener(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Req() req: any, @Body() dto: CreatePacienteDto) {
    const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id')
  async actualizar(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePacienteDto) {
    const datos = await this.svc.actualizar(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Delete(':id')
  async eliminar(@Req() req: any, @Param('id') id: string) {
    await this.svc.eliminar(req.user.clienteId, id, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }

  // ── Historial de citas ─────────────────────────────────────────────────────

  @Get(':id/citas')
  async historialCitas(@Req() req: any, @Param('id') id: string) {
    const datos = await this.svc.historialCitas(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  // ── Consultas ──────────────────────────────────────────────────────────────

  @Get(':id/consultas')
  async listarConsultas(@Req() req: any, @Param('id') id: string) {
    const datos = await this.svc.listarConsultas(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post(':id/consultas')
  @HttpCode(HttpStatus.CREATED)
  async crearConsulta(@Req() req: any, @Param('id') id: string, @Body() dto: CreateConsultaDto) {
    const datos = await this.svc.crearConsulta(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id/consultas/:cId')
  async actualizarConsulta(
    @Req() req: any,
    @Param('id') id: string,
    @Param('cId') cId: string,
    @Body() dto: UpdateConsultaDto,
  ) {
    const datos = await this.svc.actualizarConsulta(req.user.clienteId, id, cId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Delete(':id/consultas/:cId')
  async eliminarConsulta(@Req() req: any, @Param('id') id: string, @Param('cId') cId: string) {
    await this.svc.eliminarConsulta(req.user.clienteId, id, cId, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }
}
