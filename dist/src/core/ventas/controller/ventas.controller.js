"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentasController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const ventas_service_1 = require("../service/ventas.service");
const venta_documentos_service_1 = require("../service/venta-documentos.service");
const venta_extras_service_1 = require("../service/venta-extras.service");
const venta_pagos_service_1 = require("../service/venta-pagos.service");
const venta_pago_dto_1 = require("../dto/venta-pago.dto");
const venta_extras_dto_1 = require("../dto/venta-extras.dto");
const venta_dto_1 = require("../dto/venta.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let VentasController = class VentasController {
    constructor(svc, docsSvc, extrasSvc, pagosSvc) {
        this.svc = svc;
        this.docsSvc = docsSvc;
        this.extrasSvc = extrasSvc;
        this.pagosSvc = pagosSvc;
    }
    async listar(req, sucursalId, fechaDesde, fechaHasta, estadoVenta, nombreCliente, conSaldo) {
        const conSaldoBool = conSaldo === 'true' ? true : conSaldo === 'false' ? false : undefined;
        const ventas = await this.svc.listar(req.user.clienteId, sucursalId, fechaDesde, fechaHasta, estadoVenta, nombreCliente, conSaldoBool);
        const ids = ventas.map(v => v.id);
        const docs = await this.docsSvc.tiposPorVenta(req.user.clienteId, ids);
        const comisiones = await this.extrasSvc.totalComisionesPorVenta(req.user.clienteId, ids);
        const datos = ventas.map(v => ({ ...v, documentos: docs.get(v.id) || [], totalComisiones: comisiones.get(v.id) || 0 }));
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async fuentesCobro(req) {
        const datos = await this.svc.fuentesCobro(req.user.clienteId);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async obtener(req, id) {
        const venta = await this.svc.obtener(req.user.clienteId, id);
        const documentos = await this.docsSvc.listar(req.user.clienteId, id);
        const cotizacion = await this.extrasSvc.cotizacionDeVenta(req.user.clienteId, venta.venta.cotizacionId);
        const datos = { ...venta, documentos, cotizacion };
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async crear(req, dto) {
        const datos = await this.svc.crear(req.user.clienteId, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async cobrar(req, dto) {
        const datos = await this.svc.registrarDesdePOS(req.user.clienteId, dto, req.user.id, true);
        return { finalizado: true, mensaje: 'Venta cobrada', datos };
    }
    async guardarSinCobro(req, dto) {
        const datos = await this.svc.registrarDesdePOS(req.user.clienteId, dto, req.user.id, false);
        return { finalizado: true, mensaje: 'Venta registrada como deuda', datos };
    }
    async anular(req, id, dto) {
        const datos = await this.svc.anular(req.user.clienteId, id, dto, req.user.id);
        await this.extrasSvc.cancelarComisionesDeVenta(req.user.clienteId, id, req.user.id);
        await this.pagosSvc.cancelarMovimientosDeVenta(req.user.clienteId, id, req.user.id);
        return { finalizado: true, mensaje: 'Venta anulada', datos };
    }
    async listarDocumentos(req, id) {
        const datos = await this.docsSvc.listar(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async subirDocumento(req, id, tipo, file) {
        const datos = await this.docsSvc.subir(req.user.clienteId, id, tipo, file, req.user.id);
        return { finalizado: true, mensaje: 'Documento subido', datos };
    }
    async verDocumento(req, id, tipo, res) {
        const { doc, rutaAbsoluta } = await this.docsSvc.obtenerArchivo(req.user.clienteId, id, tipo);
        res.setHeader('Content-Type', doc.mimeType);
        res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(doc.nombreOriginal)}`);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.sendFile(rutaAbsoluta);
    }
    async eliminarDocumento(req, id, tipo) {
        await this.docsSvc.eliminar(req.user.clienteId, id, tipo, req.user.id);
        return { finalizado: true, mensaje: 'Documento eliminado', datos: null };
    }
    async datosImpresion(req, id) {
        const datos = await this.extrasSvc.datosImpresion(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async actualizarDatosNota(req, id, dto) {
        const datos = await this.extrasSvc.actualizarDatosNota(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
    async obtenerHojaRuta(req, id) {
        const datos = await this.extrasSvc.obtenerHojaRuta(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async guardarHojaRuta(req, id, dto) {
        const datos = await this.extrasSvc.guardarHojaRuta(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: 'Hoja de ruta guardada', datos };
    }
    async listarComisiones(req, id) {
        const datos = await this.extrasSvc.listarComisiones(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async crearComision(req, id, dto) {
        const datos = await this.extrasSvc.crearComision(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: 'Comisión registrada', datos };
    }
    async eliminarComision(req, id, comisionId) {
        await this.extrasSvc.eliminarComision(req.user.clienteId, id, comisionId, req.user.id);
        return { finalizado: true, mensaje: 'Comisión eliminada', datos: null };
    }
    async listarPagos(req, id) {
        const datos = await this.pagosSvc.listar(req.user.clienteId, id);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async registrarPago(req, id, dto) {
        const datos = await this.pagosSvc.registrarAbono(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: 'Pago registrado', datos };
    }
    async eliminarPago(req, id, pagoId) {
        await this.pagosSvc.eliminarAbono(req.user.clienteId, id, pagoId, req.user.id);
        return { finalizado: true, mensaje: 'Pago eliminado', datos: null };
    }
    async comprobantePagoInicial(req, id, file) {
        const datos = await this.pagosSvc.detallarPagoInicialConComprobante(req.user.clienteId, id, file, req.user.id);
        const { comprobanteRuta, ...pago } = datos;
        return { finalizado: true, mensaje: 'Comprobante subido', datos: pago };
    }
    async subirComprobantePago(req, id, pagoId, file) {
        const datos = await this.pagosSvc.subirComprobante(req.user.clienteId, id, pagoId, file, req.user.id);
        return { finalizado: true, mensaje: 'Comprobante subido', datos };
    }
    async verComprobantePago(req, id, pagoId, res) {
        const c = await this.pagosSvc.obtenerComprobante(req.user.clienteId, id, pagoId);
        res.setHeader('Content-Type', c.mime);
        res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(c.nombre)}`);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.sendFile(c.rutaAbsoluta);
    }
    async eliminarComprobantePago(req, id, pagoId) {
        await this.pagosSvc.eliminarComprobante(req.user.clienteId, id, pagoId, req.user.id);
        return { finalizado: true, mensaje: 'Comprobante eliminado', datos: null };
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('sucursalId')),
    __param(2, (0, common_1.Query)('fechaDesde')),
    __param(3, (0, common_1.Query)('fechaHasta')),
    __param(4, (0, common_1.Query)('estadoVenta')),
    __param(5, (0, common_1.Query)('nombreCliente')),
    __param(6, (0, common_1.Query)('conSaldo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('fuentes-cobro'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "fuentesCobro", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, venta_dto_1.CrearVentaDto]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "crear", null);
__decorate([
    (0, common_1.Post)('cobrar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, venta_dto_1.VentaPosDto]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "cobrar", null);
__decorate([
    (0, common_1.Post)('borrador'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, venta_dto_1.VentaPosDto]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "guardarSinCobro", null);
__decorate([
    (0, common_1.Put)(':id/anular'),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, venta_dto_1.AnularVentaDto]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "anular", null);
__decorate([
    (0, common_1.Get)(':id/documentos'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "listarDocumentos", null);
__decorate([
    (0, common_1.Post)(':id/documentos/:tipo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: venta_documentos_service_1.MAX_TAMANO_DOCUMENTO, files: 1 } })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('tipo')),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "subirDocumento", null);
__decorate([
    (0, common_1.Get)(':id/documentos/:tipo/archivo'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('tipo')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "verDocumento", null);
__decorate([
    (0, common_1.Delete)(':id/documentos/:tipo'),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('tipo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "eliminarDocumento", null);
__decorate([
    (0, common_1.Get)(':id/impresion'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "datosImpresion", null);
__decorate([
    (0, common_1.Put)(':id/datos-nota'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, venta_extras_dto_1.DatosNotaVentaDto]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "actualizarDatosNota", null);
__decorate([
    (0, common_1.Get)(':id/hoja-ruta'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "obtenerHojaRuta", null);
__decorate([
    (0, common_1.Put)(':id/hoja-ruta'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, venta_extras_dto_1.HojaRutaDto]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "guardarHojaRuta", null);
__decorate([
    (0, common_1.Get)(':id/comisiones'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "listarComisiones", null);
__decorate([
    (0, common_1.Post)(':id/comisiones'),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, venta_extras_dto_1.CrearComisionDto]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "crearComision", null);
__decorate([
    (0, common_1.Delete)(':id/comisiones/:comisionId'),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('comisionId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "eliminarComision", null);
__decorate([
    (0, common_1.Get)(':id/pagos'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "listarPagos", null);
__decorate([
    (0, common_1.Post)(':id/pagos'),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, venta_pago_dto_1.RegistrarPagoVentaDto]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "registrarPago", null);
__decorate([
    (0, common_1.Delete)(':id/pagos/:pagoId'),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('pagoId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "eliminarPago", null);
__decorate([
    (0, common_1.Post)(':id/pagos/inicial/comprobante'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: venta_documentos_service_1.MAX_TAMANO_DOCUMENTO, files: 1 } })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "comprobantePagoInicial", null);
__decorate([
    (0, common_1.Post)(':id/pagos/:pagoId/comprobante'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: venta_documentos_service_1.MAX_TAMANO_DOCUMENTO, files: 1 } })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('pagoId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "subirComprobantePago", null);
__decorate([
    (0, common_1.Get)(':id/pagos/:pagoId/comprobante'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('pagoId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "verComprobantePago", null);
__decorate([
    (0, common_1.Delete)(':id/pagos/:pagoId/comprobante'),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('pagoId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], VentasController.prototype, "eliminarComprobantePago", null);
VentasController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE', 'SUPER_ADMIN', 'ENCARGADO', 'CAJERO', 'VENDEDOR'),
    (0, common_1.Controller)('ventas'),
    __metadata("design:paramtypes", [ventas_service_1.VentasService,
        venta_documentos_service_1.VentaDocumentosService,
        venta_extras_service_1.VentaExtrasService,
        venta_pagos_service_1.VentaPagosService])
], VentasController);
exports.VentasController = VentasController;
//# sourceMappingURL=ventas.controller.js.map