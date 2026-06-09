import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { CitasMedicasService } from '../service/citas-medicas.service'
import { CreateCitaDto, UpdateCitaDto, CreatePacienteDto } from '../dto/cita.dto'
import { Messages } from '../../../common/constants/response-messages'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE', 'SUPER_ADMIN')
@Controller('citas-medicas')
export class CitasMedicasController {
  constructor(private readonly svc: CitasMedicasService) {}

  // ── Pacientes ──────────────────────────────────────────────────────────────

  @Get('pacientes')
  async buscarPacientes(@Req() req: any, @Query('q') q: string) {
    const datos = await this.svc.buscarPacientes(req.user.clienteId, q || '')
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post('pacientes')
  @HttpCode(HttpStatus.CREATED)
  async crearPaciente(@Req() req: any, @Body() dto: CreatePacienteDto) {
    const datos = await this.svc.crearPaciente(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  // ── Citas ──────────────────────────────────────────────────────────────────

  @Get('estadisticas')
  async estadisticas(
    @Req() req: any,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const datos = await this.svc.estadisticasConsultas(req.user.clienteId, desde, hasta)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get()
  async listar(@Req() req: any, @Query('fecha') fecha?: string, @Query('especialistaId') especialistaId?: string) {
    const datos = await this.svc.listar(req.user.clienteId, fecha, especialistaId)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get('disponibilidad')
  async disponibilidad(
    @Req() req: any,
    @Query('fecha') fecha: string,
    @Query('especialistaId') especialistaId?: string,
  ) {
    const datos = await this.svc.disponibilidad(req.user.clienteId, fecha, especialistaId)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Req() req: any, @Body() dto: CreateCitaDto) {
    const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id')
  async actualizar(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCitaDto) {
    const datos = await this.svc.actualizar(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Delete(':id')
  async eliminar(@Req() req: any, @Param('id') id: string) {
    await this.svc.eliminar(req.user.clienteId, id, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }
}
