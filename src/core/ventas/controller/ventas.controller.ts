import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, Req, Res, UseGuards, HttpCode, HttpStatus,
  UseInterceptors, UploadedFile, ParseUUIDPipe,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { VentasService } from '../service/ventas.service'
import { VentaDocumentosService, MAX_TAMANO_DOCUMENTO } from '../service/venta-documentos.service'
import { VentaExtrasService } from '../service/venta-extras.service'
import { VentaPagosService } from '../service/venta-pagos.service'
import { RegistrarPagoVentaDto } from '../dto/venta-pago.dto'
import { DatosNotaVentaDto, HojaRutaDto, CrearComisionDto } from '../dto/venta-extras.dto'
import { CrearVentaDto, AnularVentaDto, VentaPosDto } from '../dto/venta.dto'
import { Messages } from '../../../common/constants/response-messages'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR')
@Controller('ventas')
export class VentasController {
  constructor(
    private readonly svc: VentasService,
    private readonly docsSvc: VentaDocumentosService,
    private readonly extrasSvc: VentaExtrasService,
    private readonly pagosSvc: VentaPagosService,
  ) {}

  @Get()
  async listar(
    @Req() req: any,
    @Query('sucursalId') sucursalId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('estadoVenta') estadoVenta?: string,
    @Query('nombreCliente') nombreCliente?: string,
    @Query('conSaldo') conSaldo?: string,
  ) {
    const conSaldoBool = conSaldo === 'true' ? true : conSaldo === 'false' ? false : undefined
    const ventas = await this.svc.listar(req.user.clienteId, sucursalId, fechaDesde, fechaHasta, estadoVenta, nombreCliente, conSaldoBool)
    const ids = ventas.map(v => v.id)
    const docs = await this.docsSvc.tiposPorVenta(req.user.clienteId, ids)
    const comisiones = await this.extrasSvc.totalComisionesPorVenta(req.user.clienteId, ids)
    const datos = ventas.map(v => ({ ...v, documentos: docs.get(v.id) || [], totalComisiones: comisiones.get(v.id) || 0 }))
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Get(':id')
  async obtener(@Req() req: any, @Param('id') id: string) {
    const venta = await this.svc.obtener(req.user.clienteId, id)
    const documentos = await this.docsSvc.listar(req.user.clienteId, id)
    const cotizacion = await this.extrasSvc.cotizacionDeVenta(req.user.clienteId, venta.venta.cotizacionId)
    const datos = { ...venta, documentos, cotizacion }
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Req() req: any, @Body() dto: CrearVentaDto) {
    const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  // ── POS ─────────────────────────────────────────────────────────────────────

  @Post('cobrar')
  @HttpCode(HttpStatus.CREATED)
  async cobrar(@Req() req: any, @Body() dto: VentaPosDto) {
    const datos = await this.svc.registrarDesdePOS(req.user.clienteId, dto, req.user.id, true)
    return { finalizado: true, mensaje: 'Venta cobrada', datos }
  }

  @Post('borrador')
  @HttpCode(HttpStatus.CREATED)
  async guardarSinCobro(@Req() req: any, @Body() dto: VentaPosDto) {
    const datos = await this.svc.registrarDesdePOS(req.user.clienteId, dto, req.user.id, false)
    return { finalizado: true, mensaje: 'Venta registrada como deuda', datos }
  }

  @Put(':id/anular')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO')
  async anular(@Req() req: any, @Param('id') id: string, @Body() dto: AnularVentaDto) {
    const datos = await this.svc.anular(req.user.clienteId, id, dto, req.user.id)
    await this.extrasSvc.cancelarComisionesDeVenta(req.user.clienteId, id, req.user.id)
    await this.pagosSvc.cancelarMovimientosDeVenta(req.user.clienteId, id, req.user.id)
    return { finalizado: true, mensaje: 'Venta anulada', datos }
  }

  // ── Documentos adjuntos ─────────────────────────────────────────────────────

  @Get(':id/documentos')
  async listarDocumentos(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const datos = await this.docsSvc.listar(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post(':id/documentos/:tipo')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_TAMANO_DOCUMENTO, files: 1 } }))
  async subirDocumento(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('tipo') tipo: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const datos = await this.docsSvc.subir(req.user.clienteId, id, tipo, file, req.user.id)
    return { finalizado: true, mensaje: 'Documento subido', datos }
  }

  @Get(':id/documentos/:tipo/archivo')
  async verDocumento(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('tipo') tipo: string,
    @Res() res: Response,
  ) {
    const { doc, rutaAbsoluta } = await this.docsSvc.obtenerArchivo(req.user.clienteId, id, tipo)
    res.setHeader('Content-Type', doc.mimeType)
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(doc.nombreOriginal)}`)
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.sendFile(rutaAbsoluta)
  }

  @Delete(':id/documentos/:tipo')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO')
  async eliminarDocumento(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Param('tipo') tipo: string) {
    await this.docsSvc.eliminar(req.user.clienteId, id, tipo, req.user.id)
    return { finalizado: true, mensaje: 'Documento eliminado', datos: null }
  }

  // ── Nota de venta / hoja de ruta / comisiones ───────────────────────────────

  @Get(':id/impresion')
  async datosImpresion(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const datos = await this.extrasSvc.datosImpresion(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Put(':id/datos-nota')
  async actualizarDatosNota(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: DatosNotaVentaDto) {
    const datos = await this.extrasSvc.actualizarDatosNota(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Get(':id/hoja-ruta')
  async obtenerHojaRuta(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const datos = await this.extrasSvc.obtenerHojaRuta(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Put(':id/hoja-ruta')
  async guardarHojaRuta(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: HojaRutaDto) {
    const datos = await this.extrasSvc.guardarHojaRuta(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: 'Hoja de ruta guardada', datos }
  }

  @Get(':id/comisiones')
  async listarComisiones(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const datos = await this.extrasSvc.listarComisiones(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post(':id/comisiones')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async crearComision(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: CrearComisionDto) {
    const datos = await this.extrasSvc.crearComision(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: 'Comisión registrada', datos }
  }

  @Delete(':id/comisiones/:comisionId')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN')
  async eliminarComision(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('comisionId', ParseUUIDPipe) comisionId: string,
  ) {
    await this.extrasSvc.eliminarComision(req.user.clienteId, id, comisionId, req.user.id)
    return { finalizado: true, mensaje: 'Comisión eliminada', datos: null }
  }

  // ── Pagos (cobros del POS y abonos de ventas a crédito) ─────────────────────

  @Get(':id/pagos')
  async listarPagos(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const datos = await this.pagosSvc.listar(req.user.clienteId, id)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post(':id/pagos')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async registrarPago(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: RegistrarPagoVentaDto) {
    const datos = await this.pagosSvc.registrarAbono(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: 'Pago registrado', datos }
  }

  @Delete(':id/pagos/:pagoId')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN')
  async eliminarPago(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Param('pagoId', ParseUUIDPipe) pagoId: string) {
    await this.pagosSvc.eliminarAbono(req.user.clienteId, id, pagoId, req.user.id)
    return { finalizado: true, mensaje: 'Pago eliminado', datos: null }
  }

  // Debe ir antes de ':id/pagos/:pagoId/comprobante' para que 'inicial' no se tome como un id
  @Post(':id/pagos/inicial/comprobante')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_TAMANO_DOCUMENTO, files: 1 } }))
  async comprobantePagoInicial(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const datos = await this.pagosSvc.detallarPagoInicialConComprobante(req.user.clienteId, id, file, req.user.id)
    const { comprobanteRuta, ...pago } = datos as any
    return { finalizado: true, mensaje: 'Comprobante subido', datos: pago }
  }

  @Post(':id/pagos/:pagoId/comprobante')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_TAMANO_DOCUMENTO, files: 1 } }))
  async subirComprobantePago(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('pagoId', ParseUUIDPipe) pagoId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const datos = await this.pagosSvc.subirComprobante(req.user.clienteId, id, pagoId, file, req.user.id)
    return { finalizado: true, mensaje: 'Comprobante subido', datos }
  }

  @Get(':id/pagos/:pagoId/comprobante')
  async verComprobantePago(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('pagoId', ParseUUIDPipe) pagoId: string,
    @Res() res: Response,
  ) {
    const c = await this.pagosSvc.obtenerComprobante(req.user.clienteId, id, pagoId)
    res.setHeader('Content-Type', c.mime)
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(c.nombre)}`)
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.sendFile(c.rutaAbsoluta)
  }

  @Delete(':id/pagos/:pagoId/comprobante')
  @Roles('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO')
  async eliminarComprobantePago(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Param('pagoId', ParseUUIDPipe) pagoId: string) {
    await this.pagosSvc.eliminarComprobante(req.user.clienteId, id, pagoId, req.user.id)
    return { finalizado: true, mensaje: 'Comprobante eliminado', datos: null }
  }
}
