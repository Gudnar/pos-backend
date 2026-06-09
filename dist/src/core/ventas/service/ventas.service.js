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
exports.VentasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const venta_entity_1 = require("../entity/venta.entity");
const detalle_venta_entity_1 = require("../entity/detalle-venta.entity");
const lote_entity_1 = require("../../lotes/entity/lote.entity");
const movimiento_stock_entity_1 = require("../../movimientos-stock/entity/movimiento-stock.entity");
const producto_entity_1 = require("../../productos/entity/producto.entity");
const caja_sesion_entity_1 = require("../../caja/entity/caja-sesion.entity");
const ingresos_service_1 = require("../../ingresos/service/ingresos.service");
const constants_1 = require("../../../common/constants");
let VentasService = class VentasService {
    constructor(ventaRepo, detalleRepo, loteRepo, movRepo, productoRepo, sesionRepo, ingresosService, dataSource) {
        this.ventaRepo = ventaRepo;
        this.detalleRepo = detalleRepo;
        this.loteRepo = loteRepo;
        this.movRepo = movRepo;
        this.productoRepo = productoRepo;
        this.sesionRepo = sesionRepo;
        this.ingresosService = ingresosService;
        this.dataSource = dataSource;
    }
    async listar(clienteId, sucursalId, fecha, estadoVenta) {
        const where = { clienteId, estado: constants_1.Status.ACTIVE };
        if (sucursalId)
            where.sucursalId = sucursalId;
        if (fecha)
            where.fecha = fecha;
        if (estadoVenta)
            where.estadoVenta = estadoVenta;
        return this.ventaRepo.find({ where, order: { fechaCreacion: 'DESC' }, take: 200 });
    }
    async obtener(clienteId, id) {
        const venta = await this.ventaRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!venta)
            throw new common_1.NotFoundException('Venta no encontrada');
        const detalles = await this.detalleRepo.find({ where: { ventaId: id, clienteId, estado: constants_1.Status.ACTIVE } });
        return { venta, detalles };
    }
    async crear(clienteId, dto, usuarioId) {
        return this.dataSource.transaction(async (manager) => {
            const year = new Date().getFullYear();
            const count = await manager.count(venta_entity_1.Venta, { where: { clienteId } });
            const nroVenta = `V-${year}-${String(count + 1).padStart(5, '0')}`;
            const detallesResueltos = [];
            let subtotal = 0;
            for (const det of dto.detalles) {
                const producto = await manager.findOne(producto_entity_1.Producto, {
                    where: { id: det.productoId, clienteId, estado: constants_1.Status.ACTIVE },
                });
                if (!producto)
                    throw new common_1.NotFoundException(`Producto ${det.productoId} no encontrado`);
                const orden = this._ordenPicking(producto.metodoPicking);
                const lotes = await manager.find(lote_entity_1.Lote, {
                    where: {
                        clienteId,
                        sucursalId: dto.sucursalId,
                        productoId: det.productoId,
                        estadoLote: lote_entity_1.EstadoLote.ACTIVO,
                        estado: constants_1.Status.ACTIVE,
                    },
                    order: orden,
                });
                const asignaciones = [];
                let restante = Number(det.cantidad);
                for (const lote of lotes) {
                    if (restante <= 0)
                        break;
                    const usar = Math.min(restante, Number(lote.cantidadActual));
                    if (usar > 0) {
                        asignaciones.push({ loteId: lote.id, cantidad: usar, lote });
                        restante -= usar;
                    }
                }
                if (restante > 0 && lotes.length > 0) {
                    throw new common_1.BadRequestException(`Stock insuficiente para "${producto.nombre}". Disponible: ${lotes.reduce((s, l) => s + Number(l.cantidadActual), 0)}`);
                }
                const lineaSubtotal = Number(det.precioUnitario) * Number(det.cantidad) - Number(det.descuento || 0);
                subtotal += lineaSubtotal;
                detallesResueltos.push({
                    productoId: det.productoId,
                    nombreProducto: producto.nombre,
                    cantidadTotal: Number(det.cantidad),
                    precioUnitario: Number(det.precioUnitario),
                    descuento: Number(det.descuento || 0),
                    asignaciones,
                });
            }
            const descuento = Number(dto.descuento || 0);
            const impuesto = Number(dto.impuesto || 0);
            const total = subtotal - descuento + impuesto;
            const cambio = dto.montoPagado != null ? Number(dto.montoPagado) - total : null;
            const ventaEntity = manager.create(venta_entity_1.Venta, {
                clienteId, sucursalId: dto.sucursalId,
                cajaId: dto.cajaId, cajaSesionId: dto.cajaSesionId,
                usuarioId, nroVenta,
                fecha: new Date().toISOString().split('T')[0],
                estadoVenta: venta_entity_1.EstadoVenta.PAGADA,
                metodoPago: dto.metodoPago,
                subtotal, descuento, impuesto, total,
                montoPagado: dto.montoPagado ?? null, cambio,
                contactoClienteId: dto.contactoClienteId, nombreCliente: dto.nombreCliente,
                observaciones: dto.observaciones,
                estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioId,
            });
            const venta = await manager.save(venta_entity_1.Venta, ventaEntity);
            for (const det of detallesResueltos) {
                if (det.asignaciones.length === 0) {
                    await manager.save(detalle_venta_entity_1.DetalleVenta, manager.create(detalle_venta_entity_1.DetalleVenta, {
                        clienteId, ventaId: venta.id, productoId: det.productoId,
                        nombreProducto: det.nombreProducto,
                        cantidad: det.cantidadTotal, precioUnitario: det.precioUnitario,
                        descuento: det.descuento,
                        subtotal: det.precioUnitario * det.cantidadTotal - det.descuento,
                        estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioId,
                    }));
                }
                else {
                    for (const { loteId, cantidad, lote } of det.asignaciones) {
                        await manager.save(detalle_venta_entity_1.DetalleVenta, manager.create(detalle_venta_entity_1.DetalleVenta, {
                            clienteId, ventaId: venta.id, productoId: det.productoId, loteId,
                            nombreProducto: det.nombreProducto,
                            cantidad, precioUnitario: det.precioUnitario, descuento: 0,
                            subtotal: det.precioUnitario * cantidad,
                            estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioId,
                        }));
                        const cantAnterior = Number(lote.cantidadActual);
                        const cantPosterior = Math.max(0, cantAnterior - cantidad);
                        Object.assign(lote, {
                            cantidadActual: cantPosterior,
                            estadoLote: cantPosterior <= 0 ? lote_entity_1.EstadoLote.AGOTADO : lote.estadoLote,
                            transaccion: constants_1.Transacccion.ACTUALIZAR,
                            usuarioModificacion: usuarioId,
                        });
                        await manager.save(lote_entity_1.Lote, lote);
                        await manager.save(movimiento_stock_entity_1.MovimientoStock, manager.create(movimiento_stock_entity_1.MovimientoStock, {
                            clienteId, sucursalId: dto.sucursalId, productoId: det.productoId, loteId,
                            tipo: movimiento_stock_entity_1.TipoMovimiento.SALIDA,
                            cantidad, cantidadAnterior: cantAnterior, cantidadPosterior: cantPosterior,
                            referenciaDocumento: venta.nroVenta, tipoDocumento: 'VENTA',
                            motivo: `Venta ${venta.nroVenta}`,
                            usuarioId,
                            estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioId,
                        }));
                    }
                }
            }
            if (dto.cajaSesionId) {
                await manager.increment(caja_sesion_entity_1.CajaSesion, { id: dto.cajaSesionId }, 'totalVentas', total);
                await manager.increment(caja_sesion_entity_1.CajaSesion, { id: dto.cajaSesionId }, 'nroVentas', 1);
            }
            if (dto.adelantoId) {
                const montoAplicar = Number(dto.montoAdelanto ?? total);
                await this.ingresosService.aplicarMonto(manager, clienteId, dto.adelantoId, montoAplicar, usuarioId);
                venta.adelantoId = dto.adelantoId;
                venta.montoAdelanto = montoAplicar;
                await manager.save(venta_entity_1.Venta, venta);
            }
            return venta;
        });
    }
    async anular(clienteId, id, dto, usuarioModificacion) {
        return this.dataSource.transaction(async (manager) => {
            const venta = await manager.findOne(venta_entity_1.Venta, { where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
            if (!venta)
                throw new common_1.NotFoundException('Venta no encontrada');
            if (venta.estadoVenta === venta_entity_1.EstadoVenta.ANULADA)
                throw new common_1.BadRequestException('La venta ya está anulada');
            const detalles = await manager.find(detalle_venta_entity_1.DetalleVenta, { where: { ventaId: id, clienteId, estado: constants_1.Status.ACTIVE } });
            for (const det of detalles) {
                if (!det.loteId)
                    continue;
                const lote = await manager.findOne(lote_entity_1.Lote, { where: { id: det.loteId } });
                if (!lote)
                    continue;
                const cantAnterior = Number(lote.cantidadActual);
                const cantPosterior = cantAnterior + Number(det.cantidad);
                Object.assign(lote, {
                    cantidadActual: cantPosterior,
                    estadoLote: cantPosterior > 0 ? lote_entity_1.EstadoLote.ACTIVO : lote.estadoLote,
                    transaccion: constants_1.Transacccion.ACTUALIZAR,
                    usuarioModificacion,
                });
                await manager.save(lote_entity_1.Lote, lote);
                await manager.save(movimiento_stock_entity_1.MovimientoStock, manager.create(movimiento_stock_entity_1.MovimientoStock, {
                    clienteId, sucursalId: venta.sucursalId, productoId: det.productoId, loteId: det.loteId,
                    tipo: movimiento_stock_entity_1.TipoMovimiento.DEVOLUCION_CLIENTE,
                    cantidad: Number(det.cantidad), cantidadAnterior: cantAnterior, cantidadPosterior: cantPosterior,
                    referenciaDocumento: venta.nroVenta, tipoDocumento: 'ANULACION',
                    motivo: dto.motivo || `Anulación ${venta.nroVenta}`,
                    usuarioId: usuarioModificacion,
                    estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioModificacion,
                }));
            }
            if (venta.cajaSesionId) {
                await manager.decrement(caja_sesion_entity_1.CajaSesion, { id: venta.cajaSesionId }, 'totalVentas', Number(venta.total));
                await manager.decrement(caja_sesion_entity_1.CajaSesion, { id: venta.cajaSesionId }, 'nroVentas', 1);
            }
            Object.assign(venta, {
                estadoVenta: venta_entity_1.EstadoVenta.ANULADA,
                observaciones: dto.motivo ? `ANULADA: ${dto.motivo}${venta.observaciones ? ' | ' + venta.observaciones : ''}` : venta.observaciones,
                transaccion: constants_1.Transacccion.ACTUALIZAR,
                usuarioModificacion,
            });
            return manager.save(venta_entity_1.Venta, venta);
        });
    }
    _ordenPicking(metodoPicking) {
        if (metodoPicking === 'FIFO')
            return { fechaIngreso: 'ASC' };
        if (metodoPicking === 'LIFO')
            return { fechaIngreso: 'DESC' };
        return { fechaVencimiento: 'ASC', fechaIngreso: 'ASC' };
    }
};
VentasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(venta_entity_1.Venta)),
    __param(1, (0, typeorm_1.InjectRepository)(detalle_venta_entity_1.DetalleVenta)),
    __param(2, (0, typeorm_1.InjectRepository)(lote_entity_1.Lote)),
    __param(3, (0, typeorm_1.InjectRepository)(movimiento_stock_entity_1.MovimientoStock)),
    __param(4, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __param(5, (0, typeorm_1.InjectRepository)(caja_sesion_entity_1.CajaSesion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ingresos_service_1.IngresosService,
        typeorm_2.DataSource])
], VentasService);
exports.VentasService = VentasService;
//# sourceMappingURL=ventas.service.js.map