import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { CampanaService } from '../service/campana.service'
import { CreateCampanaDto, UpdateCampanaDto } from '../dto/campana.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'
import { Messages } from '../../../common/constants/response-messages'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE', 'SUPER_ADMIN')
@Controller('campanas')
export class CampanaController {
  constructor(private readonly svc: CampanaService) {}

  @Get()
  async listar(@Request() req: any) {
    const datos = await this.svc.listar(req.user.clienteId)
    return new SuccessResponseDto(datos)
  }

  @Post()
  async crear(@Request() req: any, @Body() dto: CreateCampanaDto) {
    const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id)
    return new SuccessResponseDto(datos, Messages.SUCCESS_CREATE)
  }

  @Put(':id')
  async actualizar(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateCampanaDto) {
    const datos = await this.svc.actualizar(id, req.user.clienteId, dto, req.user.id)
    return new SuccessResponseDto(datos, Messages.SUCCESS_UPDATE)
  }

  @Delete(':id')
  async eliminar(@Request() req: any, @Param('id') id: string) {
    await this.svc.eliminar(id, req.user.clienteId, req.user.id)
    return new SuccessResponseDto(null, Messages.SUCCESS_DELETE)
  }
}
