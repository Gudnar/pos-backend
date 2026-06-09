"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComprasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ExcelJS = __importStar(require("exceljs"));
const PDFDocument = require("pdfkit");
const compra_entity_1 = require("../entity/compra.entity");
const compra_detalle_entity_1 = require("../entity/compra-detalle.entity");
const pago_proveedor_entity_1 = require("../entity/pago-proveedor.entity");
const compra_log_entity_1 = require("../entity/compra-log.entity");
const lote_entity_1 = require("../../lotes/entity/lote.entity");
const movimiento_stock_entity_1 = require("../../movimientos-stock/entity/movimiento-stock.entity");
const constants_1 = require("../../../common/constants");
let ComprasService = class ComprasService {
    constructor(compraRepo, detalleRepo, pagoRepo, logRepo, loteRepo, dataSource) {
        this.compraRepo = compraRepo;
        this.detalleRepo = detalleRepo;
        this.pagoRepo = pagoRepo;
        this.logRepo = logRepo;
        this.loteRepo = loteRepo;
        this.dataSource = dataSource;
    }
    async listar(clienteId, filtros = {}) {
        const qb = this.compraRepo
            .createQueryBuilder('c')
            .where('c.cliente_id = :clienteId AND c._estado = :est', { clienteId, est: constants_1.Status.ACTIVE })
            .orderBy('c.fecha', 'DESC')
            .addOrderBy('c.nro_compra', 'DESC');
        if (filtros.tipo)
            qb.andWhere('c.tipo_compra = :tipo', { tipo: filtros.tipo });
        if (filtros.estado)
            qb.andWhere('c.estado_compra = :estado', { estado: filtros.estado });
        if (filtros.proveedorId)
            qb.andWhere('c.proveedor_id = :prov', { prov: filtros.proveedorId });
        if (filtros.fechaDesde)
            qb.andWhere('c.fecha >= :desde', { desde: filtros.fechaDesde });
        if (filtros.fechaHasta)
            qb.andWhere('c.fecha <= :hasta', { hasta: filtros.fechaHasta });
        return qb.getMany();
    }
    async obtener(clienteId, id) {
        const compra = await this.compraRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!compra)
            throw new common_1.NotFoundException('Compra no encontrada');
        const detalles = await this.detalleRepo.find({
            where: { compraId: id, clienteId, estado: constants_1.Status.ACTIVE },
        });
        const pagos = await this.pagoRepo.find({
            where: { compraId: id, clienteId, estado: constants_1.Status.ACTIVE },
        });
        return { ...compra, detalles, pagos };
    }
    async crear(clienteId, dto, usuarioId) {
        if (!dto.detalles?.length)
            throw new common_1.BadRequestException('Debe incluir al menos un detalle');
        const subtotal = dto.detalles.reduce((acc, d) => acc + (d.cantidad * d.precioUnitario - (d.descuento || 0)), 0);
        const esInicial = dto.tipoCompra === compra_entity_1.TipoCompra.INICIAL;
        const nroCompra = await this.generarNro(clienteId, dto.tipoCompra);
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();
        try {
            const compra = await qr.manager.save(compra_entity_1.Compra, {
                clienteId,
                sucursalId: dto.sucursalId,
                proveedorId: dto.proveedorId,
                nroCompra,
                tipoCompra: dto.tipoCompra,
                estadoCompra: esInicial ? compra_entity_1.EstadoCompra.FINALIZADO : compra_entity_1.EstadoCompra.EN_TRANSITO,
                estadoPago: compra_entity_1.EstadoPagoCompra.PENDIENTE,
                fecha: dto.fecha,
                nroFactura: dto.nroFactura,
                fechaEnvio: dto.fechaEnvio || null,
                fechaEstimadaLlegada: dto.fechaEstimadaLlegada || null,
                nroGuiaRemision: dto.nroGuiaRemision || null,
                transportista: dto.transportista || null,
                subtotal,
                descuento: 0,
                total: subtotal,
                montoPagado: 0,
                observaciones: dto.observaciones,
                estado: constants_1.Status.ACTIVE,
                transaccion: constants_1.Transacccion.CREAR,
                usuarioCreacion: usuarioId,
            });
            const detalles = await Promise.all(dto.detalles.map(d => {
                const sub = d.cantidad * d.precioUnitario - (d.descuento || 0);
                return qr.manager.save(compra_detalle_entity_1.CompraDetalle, {
                    clienteId,
                    compraId: compra.id,
                    productoId: d.productoId,
                    unidadId: d.unidadId,
                    cantidad: d.cantidad,
                    precioUnitario: d.precioUnitario,
                    descuento: d.descuento || 0,
                    subtotal: sub,
                    nroLote: d.nroLote || null,
                    fechaVencimiento: d.fechaVencimiento || null,
                    estado: constants_1.Status.ACTIVE,
                    transaccion: constants_1.Transacccion.CREAR,
                    usuarioCreacion: usuarioId,
                });
            }));
            if (esInicial) {
                await this.ingresarLotesEnManager(qr.manager, clienteId, compra, detalles, usuarioId);
            }
            await qr.commitTransaction();
            await this.log(clienteId, compra.id, compra_log_entity_1.TipoLog.CREACION, null, compra.estadoCompra, `${compra.tipoCompra === compra_entity_1.TipoCompra.INICIAL ? 'Ingreso inicial' : 'Orden de compra'} creada con ${dto.detalles.length} producto(s). Total: ${subtotal.toFixed(2)}`, usuarioId);
            return compra;
        }
        catch (err) {
            await qr.rollbackTransaction();
            throw err;
        }
        finally {
            await qr.release();
        }
    }
    async editarOrden(clienteId, id, dto, usuarioId) {
        const compra = await this.compraRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!compra)
            throw new common_1.NotFoundException('Compra no encontrada');
        if (compra.estadoCompra === compra_entity_1.EstadoCompra.FINALIZADO || compra.estadoCompra === compra_entity_1.EstadoCompra.ANULADA) {
            throw new common_1.BadRequestException('No se puede editar una compra finalizada o anulada');
        }
        if (!dto.detalles?.length)
            throw new common_1.BadRequestException('Debe incluir al menos un detalle');
        const cambios = [];
        if (dto.proveedorId && dto.proveedorId !== compra.proveedorId)
            cambios.push('Proveedor actualizado');
        if (dto.fecha && dto.fecha !== compra.fecha)
            cambios.push(`Fecha: ${compra.fecha} → ${dto.fecha}`);
        if (dto.nroFactura !== undefined && dto.nroFactura !== compra.nroFactura)
            cambios.push(`Nro Factura: "${compra.nroFactura || '—'}" → "${dto.nroFactura || '—'}"`);
        if (dto.nroGuiaRemision !== undefined && dto.nroGuiaRemision !== compra.nroGuiaRemision)
            cambios.push(`Guía: "${dto.nroGuiaRemision}"`);
        if (dto.transportista !== undefined && dto.transportista !== compra.transportista)
            cambios.push(`Transportista: "${dto.transportista}"`);
        if (dto.fechaEstimadaLlegada !== undefined && dto.fechaEstimadaLlegada !== compra.fechaEstimadaLlegada)
            cambios.push(`Llegada estimada: ${dto.fechaEstimadaLlegada || '—'}`);
        Object.assign(compra, {
            proveedorId: dto.proveedorId ?? compra.proveedorId,
            sucursalId: dto.sucursalId ?? compra.sucursalId,
            fecha: dto.fecha ?? compra.fecha,
            nroFactura: dto.nroFactura !== undefined ? dto.nroFactura || null : compra.nroFactura,
            fechaEnvio: dto.fechaEnvio !== undefined ? dto.fechaEnvio || null : compra.fechaEnvio,
            fechaEstimadaLlegada: dto.fechaEstimadaLlegada !== undefined ? dto.fechaEstimadaLlegada || null : compra.fechaEstimadaLlegada,
            nroGuiaRemision: dto.nroGuiaRemision !== undefined ? dto.nroGuiaRemision || null : compra.nroGuiaRemision,
            transportista: dto.transportista !== undefined ? dto.transportista || null : compra.transportista,
            observaciones: dto.observaciones !== undefined ? dto.observaciones : compra.observaciones,
            transaccion: constants_1.Transacccion.ACTUALIZAR,
            usuarioModificacion: usuarioId,
        });
        const detallesActuales = await this.detalleRepo.find({ where: { compraId: id, clienteId, estado: constants_1.Status.ACTIVE } });
        const idsEnviados = new Set(dto.detalles.filter(d => d.id).map(d => d.id));
        for (const det of detallesActuales) {
            if (!idsEnviados.has(det.id)) {
                await this.detalleRepo.update(det.id, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion: usuarioId });
                cambios.push(`Producto eliminado del detalle`);
            }
        }
        const detallesMap = new Map(detallesActuales.map(d => [d.id, d]));
        for (const d of dto.detalles) {
            const sub = d.cantidad * d.precioUnitario - (d.descuento || 0);
            if (d.id && detallesMap.has(d.id)) {
                const actual = detallesMap.get(d.id);
                if (Number(d.cantidad) !== Number(actual.cantidad))
                    cambios.push(`Cantidad: ${actual.cantidad} → ${d.cantidad}`);
                if (Number(d.precioUnitario) !== Number(actual.precioUnitario))
                    cambios.push(`Precio: ${actual.precioUnitario} → ${d.precioUnitario}`);
                await this.detalleRepo.update(d.id, {
                    productoId: d.productoId, unidadId: d.unidadId,
                    cantidad: d.cantidad, precioUnitario: d.precioUnitario, descuento: d.descuento || 0, subtotal: sub,
                    nroLote: d.nroLote || null, fechaVencimiento: d.fechaVencimiento || null,
                    transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion: usuarioId,
                });
            }
            else {
                await this.detalleRepo.save(this.detalleRepo.create({
                    clienteId, compraId: id, productoId: d.productoId, unidadId: d.unidadId,
                    cantidad: d.cantidad, precioUnitario: d.precioUnitario, descuento: d.descuento || 0, subtotal: sub,
                    nroLote: d.nroLote || null, fechaVencimiento: d.fechaVencimiento || null,
                    estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioId,
                }));
                cambios.push('Nuevo producto agregado');
            }
        }
        const todos = await this.detalleRepo.find({ where: { compraId: id, clienteId, estado: constants_1.Status.ACTIVE } });
        const subtotal = todos.reduce((acc, d) => acc + Number(d.subtotal), 0);
        compra.subtotal = subtotal;
        compra.total = subtotal;
        const guardada = await this.compraRepo.save(compra);
        if (cambios.length) {
            await this.log(clienteId, id, compra_log_entity_1.TipoLog.EDICION, compra.estadoCompra, null, `Editada (${compra.estadoCompra}): ${cambios.join('; ')}`, usuarioId);
        }
        return guardada;
    }
    async actualizar(clienteId, id, dto, usuarioId) {
        const compra = await this.compraRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!compra)
            throw new common_1.NotFoundException('Compra no encontrada');
        if (compra.estadoCompra === compra_entity_1.EstadoCompra.FINALIZADO || compra.estadoCompra === compra_entity_1.EstadoCompra.ANULADA) {
            throw new common_1.BadRequestException('Solo se puede editar una compra activa');
        }
        Object.assign(compra, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion: usuarioId });
        return this.compraRepo.save(compra);
    }
    async editarIngreso(clienteId, id, dto, usuarioId) {
        const compra = await this.compraRepo.findOne({
            where: { id, clienteId, estado: constants_1.Status.ACTIVE, tipoCompra: compra_entity_1.TipoCompra.INICIAL },
        });
        if (!compra)
            throw new common_1.NotFoundException('Ingreso inicial no encontrado');
        if (!dto.detalles?.length)
            throw new common_1.BadRequestException('Debe incluir al menos un detalle');
        if (dto.sucursalId)
            compra.sucursalId = dto.sucursalId;
        if (dto.fecha)
            compra.fecha = dto.fecha;
        if (dto.observaciones !== undefined)
            compra.observaciones = dto.observaciones;
        compra.transaccion = constants_1.Transacccion.ACTUALIZAR;
        compra.usuarioModificacion = usuarioId;
        const detallesActuales = await this.detalleRepo.find({
            where: { compraId: id, clienteId, estado: constants_1.Status.ACTIVE },
        });
        const idsEnviados = new Set(dto.detalles.filter(d => d.id).map(d => d.id));
        for (const det of detallesActuales) {
            if (!idsEnviados.has(det.id)) {
                await this.detalleRepo.update(det.id, {
                    estado: constants_1.Status.ELIMINATE,
                    transaccion: constants_1.Transacccion.ELIMINAR,
                    usuarioModificacion: usuarioId,
                });
                if (det.loteId) {
                    await this.loteRepo.update(det.loteId, {
                        estado: constants_1.Status.ELIMINATE,
                        transaccion: constants_1.Transacccion.ELIMINAR,
                        usuarioModificacion: usuarioId,
                    });
                }
            }
        }
        const detallesMap = new Map(detallesActuales.map(d => [d.id, d]));
        const nuevosDetalles = [];
        for (const d of dto.detalles) {
            const sub = d.cantidad * d.precioUnitario - (d.descuento || 0);
            if (d.id && detallesMap.has(d.id)) {
                const detActual = detallesMap.get(d.id);
                const delta = d.cantidad - Number(detActual.cantidad);
                await this.detalleRepo.update(d.id, {
                    productoId: d.productoId,
                    unidadId: d.unidadId,
                    cantidad: d.cantidad,
                    precioUnitario: d.precioUnitario,
                    descuento: d.descuento || 0,
                    subtotal: sub,
                    nroLote: d.nroLote,
                    fechaVencimiento: d.fechaVencimiento || null,
                    transaccion: constants_1.Transacccion.ACTUALIZAR,
                    usuarioModificacion: usuarioId,
                });
                if (detActual.loteId && delta !== 0) {
                    await this.loteRepo
                        .createQueryBuilder()
                        .update(lote_entity_1.Lote)
                        .set({
                        cantidadInicial: () => `cantidad_inicial + ${delta}`,
                        cantidadActual: () => `cantidad_actual + ${delta}`,
                        nroLote: d.nroLote,
                        fechaVencimiento: d.fechaVencimiento || null,
                        transaccion: constants_1.Transacccion.ACTUALIZAR,
                        usuarioModificacion: usuarioId,
                    })
                        .where('id = :loteId', { loteId: detActual.loteId })
                        .execute();
                }
            }
            else {
                const newDet = await this.detalleRepo.save(this.detalleRepo.create({
                    clienteId,
                    compraId: id,
                    productoId: d.productoId,
                    unidadId: d.unidadId,
                    cantidad: d.cantidad,
                    precioUnitario: d.precioUnitario,
                    descuento: d.descuento || 0,
                    subtotal: sub,
                    nroLote: d.nroLote || null,
                    fechaVencimiento: d.fechaVencimiento || null,
                    estado: constants_1.Status.ACTIVE,
                    transaccion: constants_1.Transacccion.CREAR,
                    usuarioCreacion: usuarioId,
                }));
                nuevosDetalles.push(newDet);
            }
        }
        if (nuevosDetalles.length) {
            await this.ingresarLotesEnManager(this.dataSource.manager, clienteId, compra, nuevosDetalles, usuarioId);
        }
        const todosDetalles = await this.detalleRepo.find({
            where: { compraId: id, clienteId, estado: constants_1.Status.ACTIVE },
        });
        const subtotal = todosDetalles.reduce((acc, d) => acc + Number(d.subtotal), 0);
        compra.subtotal = subtotal;
        compra.total = subtotal;
        return this.compraRepo.save(compra);
    }
    async eliminarIngreso(clienteId, id, usuarioId) {
        const compra = await this.compraRepo.findOne({
            where: { id, clienteId, estado: constants_1.Status.ACTIVE, tipoCompra: compra_entity_1.TipoCompra.INICIAL },
        });
        if (!compra)
            throw new common_1.NotFoundException('Ingreso inicial no encontrado');
        const detalles = await this.detalleRepo.find({
            where: { compraId: id, clienteId, estado: constants_1.Status.ACTIVE },
        });
        for (const det of detalles) {
            if (det.loteId) {
                await this.loteRepo.update(det.loteId, {
                    estado: constants_1.Status.ELIMINATE,
                    transaccion: constants_1.Transacccion.ELIMINAR,
                    usuarioModificacion: usuarioId,
                });
            }
            await this.detalleRepo.update(det.id, {
                estado: constants_1.Status.ELIMINATE,
                transaccion: constants_1.Transacccion.ELIMINAR,
                usuarioModificacion: usuarioId,
            });
        }
        Object.assign(compra, {
            estadoCompra: compra_entity_1.EstadoCompra.ANULADA,
            estado: constants_1.Status.ELIMINATE,
            transaccion: constants_1.Transacccion.ELIMINAR,
            usuarioModificacion: usuarioId,
        });
        await this.compraRepo.save(compra);
    }
    async anular(clienteId, id, motivo, usuarioId) {
        const compra = await this.compraRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!compra)
            throw new common_1.NotFoundException('Compra no encontrada');
        if (compra.estadoCompra === compra_entity_1.EstadoCompra.FINALIZADO) {
            throw new common_1.BadRequestException('No se puede anular una compra ya finalizada');
        }
        const estadoAnteriorAnular = compra.estadoCompra;
        Object.assign(compra, {
            estadoCompra: compra_entity_1.EstadoCompra.ANULADA,
            transaccion: constants_1.Transacccion.ACTUALIZAR,
            usuarioModificacion: usuarioId,
        });
        await this.compraRepo.save(compra);
        const descripcion = motivo ? `Compra anulada. Motivo: ${motivo}` : 'Compra anulada';
        await this.log(clienteId, id, compra_log_entity_1.TipoLog.ESTADO, estadoAnteriorAnular, compra_entity_1.EstadoCompra.ANULADA, descripcion, usuarioId);
    }
    async marcarPendiente(clienteId, id, dto, usuarioId) {
        const compra = await this.compraRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!compra)
            throw new common_1.NotFoundException('Compra no encontrada');
        if (compra.estadoCompra !== compra_entity_1.EstadoCompra.EN_TRANSITO) {
            throw new common_1.BadRequestException('La compra debe estar en estado EN_TRANSITO');
        }
        Object.assign(compra, {
            estadoCompra: compra_entity_1.EstadoCompra.PENDIENTE,
            fechaRecepcion: dto.fechaRecepcion,
            usuarioRecepcion: usuarioId,
            condicionMercancia: dto.condicionMercancia || null,
            observacionesRecepcion: dto.observacionesRecepcion || null,
            transaccion: constants_1.Transacccion.ACTUALIZAR,
            usuarioModificacion: usuarioId,
        });
        const guardada = await this.compraRepo.save(compra);
        const condTxt = dto.condicionMercancia ? ` · Condición: ${dto.condicionMercancia}` : '';
        const obsTxt = dto.observacionesRecepcion ? ` · ${dto.observacionesRecepcion}` : '';
        await this.log(clienteId, id, compra_log_entity_1.TipoLog.ESTADO, compra_entity_1.EstadoCompra.EN_TRANSITO, compra_entity_1.EstadoCompra.PENDIENTE, `Mercancía recibida en almacén el ${dto.fechaRecepcion}${condTxt}${obsTxt}`, usuarioId);
        return guardada;
    }
    async finalizar(clienteId, id, dto, usuarioId) {
        const compra = await this.compraRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!compra)
            throw new common_1.NotFoundException('Compra no encontrada');
        if (compra.estadoCompra !== compra_entity_1.EstadoCompra.PENDIENTE) {
            throw new common_1.BadRequestException('La compra debe estar en estado PENDIENTE para finalizar');
        }
        const detalles = await this.detalleRepo.find({
            where: { compraId: id, clienteId, estado: constants_1.Status.ACTIVE },
        });
        const loteMap = new Map(dto.detalles.map(d => [d.id, d]));
        for (const det of detalles) {
            const info = loteMap.get(det.id);
            if (info) {
                ;
                det.nroLote = info.nroLote || null;
                det.fechaVencimiento = info.fechaVencimiento || null;
            }
        }
        const today = new Date().toISOString().split('T')[0];
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();
        try {
            for (const det of detalles) {
                const info = loteMap.get(det.id);
                if (info) {
                    await qr.manager.update(compra_detalle_entity_1.CompraDetalle, det.id, {
                        nroLote: det.nroLote,
                        fechaVencimiento: det.fechaVencimiento,
                        transaccion: constants_1.Transacccion.ACTUALIZAR,
                        usuarioModificacion: usuarioId,
                    });
                }
            }
            await this.ingresarLotesEnManager(qr.manager, clienteId, compra, detalles, usuarioId);
            Object.assign(compra, {
                estadoCompra: compra_entity_1.EstadoCompra.FINALIZADO,
                fechaFinalizacion: today,
                usuarioFinalizacion: usuarioId,
                observacionesFinalizacion: dto.observacionesFinalizacion || null,
                transaccion: constants_1.Transacccion.ACTUALIZAR,
                usuarioModificacion: usuarioId,
            });
            const guardada = await qr.manager.save(compra);
            await qr.commitTransaction();
            await this.log(clienteId, id, compra_log_entity_1.TipoLog.ESTADO, compra_entity_1.EstadoCompra.PENDIENTE, compra_entity_1.EstadoCompra.FINALIZADO, `Compra finalizada el ${today}. Lotes de inventario generados. ${dto.observacionesFinalizacion || ''}`.trim(), usuarioId);
            return guardada;
        }
        catch (err) {
            await qr.rollbackTransaction();
            throw err;
        }
        finally {
            await qr.release();
        }
    }
    async obtenerLogs(clienteId, compraId) {
        return this.logRepo.find({
            where: { clienteId, compraId },
            order: { createdAt: 'DESC' },
        });
    }
    async exportarExcel(clienteId, filtros = {}) {
        const compras = await this.listar(clienteId, filtros);
        const wb = new ExcelJS.Workbook();
        wb.creator = 'Sistema POS';
        wb.created = new Date();
        const ws = wb.addWorksheet('Órdenes de Compra');
        ws.columns = [
            { header: 'Nro Compra', key: 'nroCompra', width: 14 },
            { header: 'Tipo', key: 'tipoCompra', width: 10 },
            { header: 'Estado', key: 'estadoCompra', width: 14 },
            { header: 'Fecha Orden', key: 'fecha', width: 14 },
            { header: 'Nro Factura', key: 'nroFactura', width: 16 },
            { header: 'Guía Remisión', key: 'nroGuiaRemision', width: 16 },
            { header: 'Transportista', key: 'transportista', width: 18 },
            { header: 'Fec. Envío', key: 'fechaEnvio', width: 14 },
            { header: 'Fec. Est. Llegada', key: 'fechaEstimadaLlegada', width: 16 },
            { header: 'Fec. Recepción', key: 'fechaRecepcion', width: 16 },
            { header: 'Condición', key: 'condicionMercancia', width: 12 },
            { header: 'Fec. Finalización', key: 'fechaFinalizacion', width: 16 },
            { header: 'Subtotal', key: 'subtotal', width: 14 },
            { header: 'Total', key: 'total', width: 14 },
            { header: 'Pagado', key: 'montoPagado', width: 14 },
            { header: 'Saldo', key: 'saldo', width: 14 },
            { header: 'Estado Pago', key: 'estadoPago', width: 14 },
        ];
        const headerRow = ws.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        headerRow.alignment = { vertical: 'middle' };
        headerRow.height = 20;
        compras.forEach(c => {
            const row = ws.addRow({
                ...c,
                saldo: (Number(c.total) - Number(c.montoPagado)).toFixed(2),
            });
            const estado = c.estadoCompra;
            if (estado === 'FINALIZADO')
                row.getCell('estadoCompra').font = { color: { argb: 'FF34D399' } };
            else if (estado === 'ANULADA')
                row.getCell('estadoCompra').font = { color: { argb: 'FFF87171' } };
            else if (estado === 'EN_TRANSITO')
                row.getCell('estadoCompra').font = { color: { argb: 'FF60A5FA' } };
            else
                row.getCell('estadoCompra').font = { color: { argb: 'FFFBBF24' } };
        });
        ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
        ws.autoFilter = { from: 'A1', to: 'Q1' };
        return wb.xlsx.writeBuffer();
    }
    async generarPdf(clienteId, id) {
        const compra = await this.compraRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!compra)
            throw new common_1.NotFoundException('Compra no encontrada');
        const [detalles, pagos] = await Promise.all([
            this.detalleRepo.find({ where: { compraId: id, clienteId, estado: constants_1.Status.ACTIVE } }),
            this.pagoRepo.find({ where: { compraId: id, clienteId, estado: constants_1.Status.ACTIVE }, order: { fecha: 'ASC' } }),
        ]);
        const schema = process.env.DB_SCHEMA || 'public';
        const productoIds = [...new Set(detalles.map(d => d.productoId))];
        const [productosRaw, provResult] = await Promise.all([
            productoIds.length
                ? this.dataSource.query(`SELECT id, nombre FROM "${schema}"."producto" WHERE id = ANY($1::uuid[])`, [productoIds])
                : Promise.resolve([]),
            compra.proveedorId
                ? this.dataSource.query(`SELECT nombre FROM "${schema}"."proveedor" WHERE id = $1`, [compra.proveedorId])
                : Promise.resolve([]),
        ]);
        const prodMap = new Map(productosRaw.map((p) => [p.id, p.nombre]));
        const proveedorNombre = provResult[0]?.nombre || 'Sin proveedor';
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 40,
                info: { Title: compra.nroCompra, Author: 'Sistema POS' },
            });
            const buffers = [];
            doc.on('data', (b) => buffers.push(b));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);
            const ML = 40;
            const W = doc.page.width - ML * 2;
            const MR = ML + W;
            const fmt = (v) => Number(v || 0).toFixed(2);
            const estadoLabel = {
                EN_TRANSITO: 'En Tránsito', PENDIENTE: 'En Almacén',
                FINALIZADO: 'Finalizado', ANULADA: 'Anulada',
            };
            doc.rect(ML, 40, W, 58).fill('#1e3a5f');
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(18)
                .text('ORDEN DE COMPRA', ML + 12, 50, { width: 320, lineBreak: false });
            doc.font('Helvetica').fontSize(9).fillColor('#94a3b8')
                .text(compra.nroCompra, ML + 12, 73, { width: 200, lineBreak: false });
            const estadoTxt = estadoLabel[compra.estadoCompra] || compra.estadoCompra;
            doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff')
                .text(estadoTxt, ML, 53, { width: W - 12, align: 'right', lineBreak: false });
            doc.font('Helvetica').fontSize(9).fillColor('#94a3b8')
                .text(`Fecha: ${compra.fecha}`, ML, 68, { width: W - 12, align: 'right', lineBreak: false });
            let y = 112;
            const drawInfo = (label, value, x, yy, colW) => {
                doc.font('Helvetica').fontSize(7).fillColor('#64748b')
                    .text(label.toUpperCase(), x, yy, { width: colW, lineBreak: false });
                doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#1e293b')
                    .text(value || '—', x, yy + 10, { width: colW, lineBreak: false });
            };
            const half = W / 2 - 8;
            drawInfo('Proveedor', proveedorNombre, ML, y, half);
            drawInfo('Fecha Orden', compra.fecha, ML + W / 2, y, half);
            y += 30;
            drawInfo('Nro Factura / Ref.', compra.nroFactura || '—', ML, y, half);
            drawInfo('Tipo', compra.tipoCompra === 'INICIAL' ? 'Ingreso Inicial' : 'Compra a Proveedor', ML + W / 2, y, half);
            y += 30;
            if (compra.transportista || compra.nroGuiaRemision) {
                drawInfo('Transportista', compra.transportista || '—', ML, y, half);
                drawInfo('Guía / Remisión', compra.nroGuiaRemision || '—', ML + W / 2, y, half);
                y += 30;
            }
            if (compra.fechaEnvio || compra.fechaEstimadaLlegada) {
                drawInfo('Fecha de Envío', compra.fechaEnvio || '—', ML, y, half);
                drawInfo('Llegada Estimada', compra.fechaEstimadaLlegada || '—', ML + W / 2, y, half);
                y += 30;
            }
            if (compra.observaciones) {
                drawInfo('Observaciones', compra.observaciones, ML, y, W);
                y += 30;
            }
            y += 4;
            doc.moveTo(ML, y).lineTo(MR, y).lineWidth(0.5).strokeColor('#e2e8f0').stroke();
            y += 10;
            doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#334155')
                .text('DETALLE DE PRODUCTOS', ML, y);
            y += 13;
            const colW = { prod: 195, cant: 45, pu: 72, desc: 62, sub: 72, lote: 69 };
            const cx = {
                prod: ML,
                cant: ML + colW.prod,
                pu: ML + colW.prod + colW.cant,
                desc: ML + colW.prod + colW.cant + colW.pu,
                sub: ML + colW.prod + colW.cant + colW.pu + colW.desc,
                lote: ML + colW.prod + colW.cant + colW.pu + colW.desc + colW.sub,
            };
            doc.rect(ML, y, W, 18).fill('#1e3a5f');
            const hdr = (txt, x, w, align = 'left') => doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#ffffff')
                .text(txt, x + 3, y + 5, { width: w - 6, align, lineBreak: false });
            hdr('PRODUCTO', cx.prod, colW.prod);
            hdr('CANT.', cx.cant, colW.cant, 'right');
            hdr('PRECIO U.', cx.pu, colW.pu, 'right');
            hdr('DESCUENTO', cx.desc, colW.desc, 'right');
            hdr('SUBTOTAL', cx.sub, colW.sub, 'right');
            hdr('LOTE', cx.lote, colW.lote, 'center');
            y += 18;
            for (let i = 0; i < detalles.length; i++) {
                const d = detalles[i];
                const nombre = prodMap.get(d.productoId) || 'Producto desconocido';
                const rH = 18;
                if (i % 2 === 1)
                    doc.rect(ML, y, W, rH).fill('#f8fafc');
                const cell = (txt, x, w, align = 'left') => doc.font('Helvetica').fontSize(8).fillColor('#1e293b')
                    .text(txt, x + 3, y + 5, { width: w - 6, align, lineBreak: false, ellipsis: true });
                cell(nombre, cx.prod, colW.prod);
                cell(fmt(d.cantidad), cx.cant, colW.cant, 'right');
                cell(`Bs ${fmt(d.precioUnitario)}`, cx.pu, colW.pu, 'right');
                cell(`Bs ${fmt(d.descuento)}`, cx.desc, colW.desc, 'right');
                cell(`Bs ${fmt(d.subtotal)}`, cx.sub, colW.sub, 'right');
                cell(d.nroLote || '—', cx.lote, colW.lote, 'center');
                y += rH;
            }
            doc.rect(ML, y, W, 22).fill('#0f172a');
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#f1f5f9')
                .text(`TOTAL:  Bs ${fmt(compra.total)}`, ML, y + 6, { width: W - 10, align: 'right', lineBreak: false });
            y += 30;
            if (compra.fechaRecepcion || compra.fechaFinalizacion) {
                doc.moveTo(ML, y).lineTo(MR, y).lineWidth(0.5).strokeColor('#e2e8f0').stroke();
                y += 10;
                doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#334155').text('TRAZABILIDAD', ML, y);
                y += 13;
                if (compra.fechaRecepcion) {
                    doc.rect(ML, y, W, 16).fill('#0f172a');
                    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#60a5fa')
                        .text('RECEPCIÓN EN ALMACÉN', ML + 6, y + 5, { lineBreak: false });
                    y += 16;
                    doc.rect(ML, y, W, 22).fill('#0d1526');
                    doc.font('Helvetica').fontSize(8).fillColor('#94a3b8')
                        .text(`Fecha: `, ML + 6, y + 4, { continued: true, lineBreak: false });
                    doc.fillColor('#e2e8f0').text(compra.fechaRecepcion, { continued: true, lineBreak: false });
                    if (compra.condicionMercancia) {
                        doc.fillColor('#94a3b8').text(`   Condición: `, { continued: true, lineBreak: false });
                        doc.fillColor('#e2e8f0').text(compra.condicionMercancia, { lineBreak: false });
                    }
                    if (compra.observacionesRecepcion) {
                        doc.font('Helvetica').fontSize(8).fillColor('#94a3b8')
                            .text(`Obs: ${compra.observacionesRecepcion}`, ML + 6, y + 13, { width: W - 12, lineBreak: false });
                    }
                    y += 28;
                }
                if (compra.fechaFinalizacion) {
                    doc.rect(ML, y, W, 16).fill('#0f172a');
                    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#34d399')
                        .text('FINALIZACIÓN', ML + 6, y + 5, { lineBreak: false });
                    y += 16;
                    doc.rect(ML, y, W, 20).fill('#0d1526');
                    doc.font('Helvetica').fontSize(8).fillColor('#94a3b8')
                        .text(`Fecha: `, ML + 6, y + 6, { continued: true, lineBreak: false });
                    doc.fillColor('#e2e8f0').text(compra.fechaFinalizacion, { lineBreak: false });
                    if (compra.observacionesFinalizacion) {
                        doc.font('Helvetica').fontSize(8).fillColor('#94a3b8')
                            .text(`Obs: ${compra.observacionesFinalizacion}`, ML + 6, y + 13, { width: W - 12, lineBreak: false });
                    }
                    y += 26;
                }
                y += 6;
            }
            if (pagos.length) {
                doc.moveTo(ML, y).lineTo(MR, y).lineWidth(0.5).strokeColor('#e2e8f0').stroke();
                y += 10;
                doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#334155').text('PAGOS REGISTRADOS', ML, y);
                y += 13;
                doc.rect(ML, y, W, 16).fill('#334155');
                const ph = (txt, x, w, align = 'left') => doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#ffffff')
                    .text(txt, x + 3, y + 4, { width: w - 6, align, lineBreak: false });
                ph('FECHA', ML, 100);
                ph('MÉTODO', ML + 100, 100);
                ph('REFERENCIA', ML + 200, 180);
                ph('MONTO', ML + 380, W - 380, 'right');
                y += 16;
                let totalPagado = 0;
                for (let i = 0; i < pagos.length; i++) {
                    const p = pagos[i];
                    if (i % 2 === 1)
                        doc.rect(ML, y, W, 18).fill('#f8fafc');
                    const pc = (txt, x, w, align = 'left') => doc.font('Helvetica').fontSize(8).fillColor('#1e293b')
                        .text(txt, x + 3, y + 5, { width: w - 6, align, lineBreak: false });
                    pc(p.fecha, ML, 100);
                    pc(p.metodoPago, ML + 100, 100);
                    pc(p.referencia || '—', ML + 200, 180);
                    pc(`Bs ${fmt(p.monto)}`, ML + 380, W - 380, 'right');
                    totalPagado += Number(p.monto);
                    y += 18;
                }
                const saldo = Math.max(0, Number(compra.total) - totalPagado);
                doc.rect(ML, y, W, 20).fill('#0f172a');
                doc.font('Helvetica-Bold').fontSize(9).fillColor('#4ade80')
                    .text(`Pagado: Bs ${fmt(totalPagado)}    Saldo: Bs ${fmt(saldo)}`, ML, y + 6, { width: W - 10, align: 'right', lineBreak: false });
                y += 26;
            }
            const footerY = doc.page.height - 40;
            doc.moveTo(ML, footerY - 8).lineTo(MR, footerY - 8).lineWidth(0.4).strokeColor('#e2e8f0').stroke();
            doc.font('Helvetica').fontSize(7.5).fillColor('#94a3b8')
                .text(`Generado el ${new Date().toLocaleString('es-BO')}  ·  ${compra.nroCompra}`, ML, footerY - 2, { width: W, align: 'center', lineBreak: false });
            doc.end();
        });
    }
    async historialPagos(clienteId, filtros = {}) {
        const schema = process.env.DB_SCHEMA || 'public';
        const params = [clienteId, constants_1.Status.ACTIVE];
        let sql = `
      SELECT
        p.id, p.fecha, p.monto,
        p.metodo_pago    AS "metodoPago",
        p.referencia,    p.notas,
        p.proveedor_id   AS "proveedorId",
        p.compra_id      AS "compraId",
        c.nro_compra     AS "nroCompra",
        c.nro_factura    AS "nroFactura",
        c.tipo_compra    AS "tipoCompra",
        c.estado_compra  AS "estadoCompra"
      FROM "${schema}"."pago_proveedor" p
      JOIN "${schema}"."compra" c ON c.id = p.compra_id
      WHERE p.cliente_id = $1 AND p._estado = $2
    `;
        let idx = 3;
        if (filtros.proveedorId) {
            sql += ` AND p.proveedor_id = $${idx++}`;
            params.push(filtros.proveedorId);
        }
        if (filtros.fechaDesde) {
            sql += ` AND p.fecha >= $${idx++}`;
            params.push(filtros.fechaDesde);
        }
        if (filtros.fechaHasta) {
            sql += ` AND p.fecha <= $${idx++}`;
            params.push(filtros.fechaHasta);
        }
        sql += ' ORDER BY p.fecha DESC, p.id DESC';
        return this.dataSource.query(sql, params);
    }
    async listarPagos(clienteId, compraId) {
        return this.pagoRepo.find({ where: { compraId, clienteId, estado: constants_1.Status.ACTIVE } });
    }
    async registrarPago(clienteId, compraId, dto, usuarioId) {
        const compra = await this.compraRepo.findOne({ where: { id: compraId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!compra)
            throw new common_1.NotFoundException('Compra no encontrada');
        const saldo = Number(compra.total) - Number(compra.montoPagado);
        if (dto.monto > saldo + 0.001) {
            throw new common_1.BadRequestException(`El monto (${dto.monto}) supera el saldo pendiente (${saldo.toFixed(2)})`);
        }
        const pago = await this.pagoRepo.save(this.pagoRepo.create({
            clienteId,
            compraId,
            proveedorId: compra.proveedorId,
            fecha: dto.fecha,
            monto: dto.monto,
            metodoPago: dto.metodoPago,
            referencia: dto.referencia,
            notas: dto.notas,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: usuarioId,
        }));
        await this.recalcularPago(clienteId, compraId, usuarioId);
        await this.log(clienteId, compraId, compra_log_entity_1.TipoLog.PAGO, null, null, `Pago registrado: ${dto.metodoPago} Bs ${dto.monto}${dto.referencia ? ' · Ref: ' + dto.referencia : ''}`, usuarioId);
        return pago;
    }
    async eliminarPago(clienteId, compraId, pagoId, usuarioId) {
        const pago = await this.pagoRepo.findOne({ where: { id: pagoId, compraId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!pago)
            throw new common_1.NotFoundException('Pago no encontrado');
        Object.assign(pago, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion: usuarioId });
        await this.pagoRepo.save(pago);
        await this.recalcularPago(clienteId, compraId, usuarioId);
        await this.log(clienteId, compraId, compra_log_entity_1.TipoLog.PAGO, null, null, `Pago eliminado: ${pago.metodoPago} Bs ${pago.monto}`, usuarioId);
    }
    async resumenPagosProveedores(clienteId) {
        return this.compraRepo
            .createQueryBuilder('c')
            .select('c.proveedor_id', 'proveedorId')
            .addSelect('SUM(c.total)', 'totalCompras')
            .addSelect('SUM(c.monto_pagado)', 'totalPagado')
            .addSelect('SUM(c.total - c.monto_pagado)', 'saldoPendiente')
            .addSelect('COUNT(c.id)', 'nroCompras')
            .where('c.cliente_id = :clienteId AND c._estado = :est AND c.proveedor_id IS NOT NULL AND c.estado_compra = :rec', {
            clienteId,
            est: constants_1.Status.ACTIVE,
            rec: compra_entity_1.EstadoCompra.FINALIZADO,
        })
            .andWhere('c.total > c.monto_pagado')
            .groupBy('c.proveedor_id')
            .getRawMany();
    }
    async generarNro(clienteId, tipo) {
        const prefix = tipo === compra_entity_1.TipoCompra.INICIAL ? 'INI' : 'COM';
        const count = await this.compraRepo.count({
            where: { clienteId, tipoCompra: tipo, estado: constants_1.Status.ACTIVE },
        });
        return `${prefix}-${String(count + 1).padStart(4, '0')}`;
    }
    async ingresarLotesEnManager(manager, clienteId, compra, detalles, usuarioId) {
        const hoy = new Date().toISOString().split('T')[0];
        for (const detalle of detalles) {
            const loteData = {
                clienteId,
                sucursalId: compra.sucursalId,
                productoId: detalle.productoId,
                nroLote: detalle.nroLote || null,
                loteInterno: `L-${Date.now()}`,
                fechaVencimiento: detalle.fechaVencimiento || null,
                fechaIngreso: hoy,
                proveedorId: compra.proveedorId || null,
                nroFacturaProveedor: compra.nroFactura || null,
                nroPedidoCompra: compra.nroCompra,
                cantidadInicial: detalle.cantidad,
                cantidadActual: detalle.cantidad,
                unidadId: detalle.unidadId || null,
                estadoLote: lote_entity_1.EstadoLote.ACTIVO,
                estado: constants_1.Status.ACTIVE,
                transaccion: constants_1.Transacccion.CREAR,
                usuarioCreacion: usuarioId,
            };
            const lote = await manager.save(lote_entity_1.Lote, loteData);
            const movData = {
                clienteId,
                sucursalId: compra.sucursalId,
                productoId: detalle.productoId,
                loteId: lote.id,
                unidadId: detalle.unidadId || null,
                tipo: movimiento_stock_entity_1.TipoMovimiento.INGRESO,
                cantidad: detalle.cantidad,
                cantidadAnterior: 0,
                cantidadPosterior: detalle.cantidad,
                referenciaDocumento: compra.nroCompra,
                tipoDocumento: 'INGRESO',
                usuarioId,
                estado: constants_1.Status.ACTIVE,
                transaccion: constants_1.Transacccion.CREAR,
                usuarioCreacion: usuarioId,
            };
            await manager.save(movimiento_stock_entity_1.MovimientoStock, movData);
            await manager.update(compra_detalle_entity_1.CompraDetalle, detalle.id, { loteId: lote.id });
        }
    }
    async recalcularPago(clienteId, compraId, usuarioId) {
        const { suma } = await this.pagoRepo
            .createQueryBuilder('p')
            .select('COALESCE(SUM(p.monto), 0)', 'suma')
            .where('p.compra_id = :compraId AND p.cliente_id = :clienteId AND p._estado = :est', {
            compraId, clienteId, est: constants_1.Status.ACTIVE,
        })
            .getRawOne();
        const compra = await this.compraRepo.findOne({ where: { id: compraId } });
        if (!compra)
            return;
        const montoPagado = Number(suma);
        const total = Number(compra.total);
        let estadoPago = compra_entity_1.EstadoPagoCompra.PENDIENTE;
        if (montoPagado >= total)
            estadoPago = compra_entity_1.EstadoPagoCompra.PAGADO;
        else if (montoPagado > 0)
            estadoPago = compra_entity_1.EstadoPagoCompra.PARCIAL;
        await this.compraRepo.update(compraId, {
            montoPagado,
            estadoPago,
            usuarioModificacion: usuarioId,
            transaccion: constants_1.Transacccion.ACTUALIZAR,
        });
    }
    async log(clienteId, compraId, tipo, estadoAnterior, estadoNuevo, descripcion, usuarioId) {
        try {
            await this.logRepo.save(this.logRepo.create({ clienteId, compraId, tipo, estadoAnterior, estadoNuevo, descripcion, usuarioId }));
        }
        catch (_) { }
    }
};
ComprasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(compra_entity_1.Compra)),
    __param(1, (0, typeorm_1.InjectRepository)(compra_detalle_entity_1.CompraDetalle)),
    __param(2, (0, typeorm_1.InjectRepository)(pago_proveedor_entity_1.PagoProveedor)),
    __param(3, (0, typeorm_1.InjectRepository)(compra_log_entity_1.CompraLog)),
    __param(4, (0, typeorm_1.InjectRepository)(lote_entity_1.Lote)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ComprasService);
exports.ComprasService = ComprasService;
//# sourceMappingURL=compras.service.js.map