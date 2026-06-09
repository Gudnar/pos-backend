import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { ClienteService } from '../service/cliente.service'
import { CreateClienteDto, UpdateClienteDto } from '../dto/cliente.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'
import { Messages } from '../../../common/constants/response-messages'
import { MiCuentaService } from '../../mi-cuenta/service/mi-cuenta.service'

@ApiTags('Clientes')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clientes')
export class ClienteController {
  constructor(
    private readonly clienteService: ClienteService,
    private readonly miCuentaService: MiCuentaService,
  ) {}

  @Get()
  @Roles('SUPER_ADMIN')
  async listar(): Promise<SuccessResponseDto> {
    const datos = await this.clienteService.listar()
    return new SuccessResponseDto(datos)
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async obtener(@Param('id') id: string): Promise<SuccessResponseDto> {
    const datos = await this.clienteService.obtener(id)
    return new SuccessResponseDto(datos)
  }

  @Post()
  @Roles('SUPER_ADMIN')
  async crear(@Body() dto: CreateClienteDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.clienteService.crear(dto, req.user.id)
    await this.miCuentaService.crearRolesBase(String((datos as any).id), req.user.id)
    return new SuccessResponseDto(datos, Messages.SUCCESS_CREATE)
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateClienteDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.clienteService.actualizar(id, dto, req.user.id)
    return new SuccessResponseDto(datos, Messages.SUCCESS_UPDATE)
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  async eliminar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.clienteService.eliminar(id, req.user.id)
    return new SuccessResponseDto(null, Messages.SUCCESS_DELETE)
  }
}
