import { Body, Controller, Get, Param, Patch, Post, Put, Query, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ConversacionService } from '../service/conversacion.service'
import { CreateConversacionDto, AgregarMensajeDto } from '../dto/create-conversacion.dto'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

const CALIFICACION_CONFIG_KEY = 'CALIFICACION_CONFIG'

@ApiTags('Conversaciones')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('conversaciones')
export class ConversacionController {
  constructor(
    private readonly conversacionService: ConversacionService,
    private readonly confClienteService: ConfiguracionClienteService,
  ) {}

  @Get()
  async listar(@Query('agenteId') agenteId: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.conversacionService.listar(req.user.clienteId, agenteId)
    return new SuccessResponseDto(datos)
  }

  @Get('estadisticas')
  async estadisticas(@Query('agenteId') agenteId: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.conversacionService.estadisticas(req.user.clienteId, agenteId)
    return new SuccessResponseDto(datos)
  }

  @Get('metricas')
  async metricas(
    @Query('agenteId') agenteId: string,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.conversacionService.metricas(req.user.clienteId, agenteId, desde, hasta)
    return new SuccessResponseDto(datos)
  }

  @Get('calificacion-config')
  async getCalificacionConfig(@Request() req: any): Promise<SuccessResponseDto> {
    const registro = await this.confClienteService.obtenerPorClave(req.user.clienteId, CALIFICACION_CONFIG_KEY)
    const datos = registro?.valor ? JSON.parse(registro.valor) : null
    return new SuccessResponseDto(datos)
  }

  @Put('calificacion-config')
  async setCalificacionConfig(@Request() req: any, @Body() body: any): Promise<SuccessResponseDto> {
    await this.confClienteService.set(req.user.clienteId, {
      clave: CALIFICACION_CONFIG_KEY,
      valor: JSON.stringify(body),
      descripcion: 'Configuración de calificación IA',
      esSecreto: false,
    }, req.user.id)
    return new SuccessResponseDto(null, 'Configuración guardada')
  }

  @Get(':id')
  async obtener(@Param('id') id: string): Promise<SuccessResponseDto> {
    const datos = await this.conversacionService.obtener(id)
    return new SuccessResponseDto(datos)
  }

  @Post()
  async crear(@Body() dto: CreateConversacionDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.conversacionService.crear(dto, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(datos, 'Conversación creada')
  }

  @Post(':id/mensajes')
  async agregarMensaje(@Param('id') id: string, @Body() dto: AgregarMensajeDto): Promise<SuccessResponseDto> {
    const datos = await this.conversacionService.agregarMensaje(id, dto)
    return new SuccessResponseDto(datos)
  }

  @Patch(':id/estado')
  async actualizarEstado(@Param('id') id: string, @Body('estadoConversacion') estadoConversacion: string): Promise<SuccessResponseDto> {
    await this.conversacionService.actualizarEstado(id, estadoConversacion)
    return new SuccessResponseDto(null, 'Estado actualizado')
  }
}
