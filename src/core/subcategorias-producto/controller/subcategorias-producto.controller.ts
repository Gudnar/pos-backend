import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { SubcategoriasProductoService } from '../service/subcategorias-producto.service'
import { CreateSubcategoriaProductoDto, UpdateSubcategoriaProductoDto } from '../dto/subcategoria-producto.dto'
import { Messages } from '../../../common/constants/response-messages'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE', 'SUPER_ADMIN')
@Controller('subcategorias-producto')
export class SubcategoriasProductoController {
  constructor(private readonly svc: SubcategoriasProductoService) {}

  @Get()
  async listar(
    @Req() req: any,
    @Query('categoriaId') categoriaId?: string,
    @Query('soloActivos') soloActivos?: string,
  ) {
    const datos = await this.svc.listar(req.user.clienteId, categoriaId, soloActivos === 'true')
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get(':id')
  async obtener(@Req() req: any, @Param('id') id: string) {
    const datos = await this.svc.obtener(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Req() req: any, @Body() dto: CreateSubcategoriaProductoDto) {
    const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put(':id')
  async actualizar(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateSubcategoriaProductoDto) {
    const datos = await this.svc.actualizar(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Delete(':id')
  async eliminar(@Req() req: any, @Param('id') id: string) {
    await this.svc.eliminar(req.user.clienteId, id, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }
}
