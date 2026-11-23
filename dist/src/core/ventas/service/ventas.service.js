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
const venta_pago_entity_1 = require("../entity/venta-pago.entity");
const cotizaciones_service_1 = require("./cotizaciones.service");
const movimiento_fuente_entity_1 = require("../../fuentes/entity/movimiento-fuente.entity");
const venta_pagos_service_1 = require("./venta-pagos.service");
const ingresos_service_1 = require("../../ingresos/service/ingresos.service");
const constants_1 = require("../../../common/constants");
const r2 = (n) => Math.round(n * 100) / 100;
const ETIQUETA_PAGO = {
    EFECTIVO: 'Efectivo', TRANSFERENCIA: 'Transferencia', CHEQUE: 'Cheque', QR: 'QR', TARJETA: 'Tarjeta', ADELANTO: 'Adelanto',
};
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
    async listar(clienteId, sucursalId, fechaDesde, fechaHasta, estadoVenta, nombreCliente, conSaldo) {
        let qb = this.ventaRepo.createQueryBuilder('v')
            .where('v.clienteId = :clienteId', { clienteId })
            .andWhere('v.estado = :est', { est: constants_1.Status.ACTIVE })
            .orderBy('v.fechaCreacion', 'DESC')
            .take(500);
        if (sucursalId)
            qb = qb.andWhere('v.sucursalId = :sucursalId', { sucursalId });
        if (estadoVenta)
            qb = qb.andWhere('v.estadoVenta = :estadoVenta', { estadoVenta });
        if (fechaDesde)
            qb = qb.andWhere('v.fecha >= :fechaDesde', { fechaDesde });
        if (fechaHasta)
            qb = qb.andWhere('v.fecha <= :fechaHasta', { fechaHasta });
        if (nombreCliente)
            qb = qb.andWhere('v.nombreCliente ILIKE :nombreCliente', { nombreCliente: `%${nombreCliente}%` });
        if (conSaldo !== undefined) {
            if (conSaldo) {
                qb = qb.andWhere('COALESCE(v.total, 0) > COALESCE(v.montoPagado, 0)');
            }
            else {
                qb = qb.andWhere('COALESCE(v.total, 0) <= COALESCE(v.montoPagado, 0)');
            }
        }
        return qb.getMany();
    }
    async obtener(clienteId, id) {
        const venta = await this.ventaRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!venta)
            throw new common_1.NotFoundException('Venta no encontrada');
        const detalles = await this.detalleRepo.find({ where: { ventaId: id, clienteId, estado: constants_1.Status.ACTIVE } });
        const productoIds = [...new Set(detalles.map(d => d.productoId))];
        const productos = productoIds.length > 0
            ? await this.productoRepo.find({ where: { id: (0, typeorm_2.In)(productoIds) } })
            : [];
        const prodMap = new Map(productos.map(p => [p.id, p]));
        return {
            venta,
            detalles: detalles.map(d => ({
                ...d,
                porcentajeFactura: prodMap.get(d.productoId)?.porcentajeFactura || 0,
            })),
        };
    }
    async crear(clienteId, dto, usuarioId, opciones = {}) {
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
                if (det.loteId) {
                    const elegido = lotes.find(l => l.id === det.loteId);
                    if (!elegido) {
                        throw new common_1.BadRequestException(`El lote seleccionado para "${producto.nombre}" no está disponible en esta sucursal`);
                    }
                    lotes.splice(lotes.indexOf(elegido), 1);
                    lotes.unshift(elegido);
                }
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
                fecha: opciones.fecha || new Date().toISOString().split('T')[0],
                estadoVenta: opciones.estadoVenta || venta_entity_1.EstadoVenta.PAGADA,
                metodoPago: dto.metodoPago,
                subtotal, descuento, impuesto, total,
                montoPagado: opciones.montoPagado ?? dto.montoPagado ?? null,
                cambio: opciones.cambio !== undefined ? opciones.cambio : cambio,
                montoEfectivo: opciones.montoEfectivoCaja ?? null,
                nitCi: opciones.nitCi || null, telefonoCliente: opciones.telefonoCliente || null,
                cotizacionId: opciones.cotizacionId || null,
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
            if (opciones.cotizacionId) {
                await cotizaciones_service_1.CotizacionesService.marcarConvertida(manager, clienteId, opciones.cotizacionId, venta.id);
            }
            for (const p of opciones.pagos || []) {
                if (!(p.monto > 0))
                    continue;
                const pago = await manager.save(venta_pago_entity_1.VentaPago, manager.create(venta_pago_entity_1.VentaPago, {
                    clienteId, ventaId: venta.id, origen: venta_pago_entity_1.OrigenPagoVenta.POS,
                    fecha: venta.fecha, metodoPago: p.metodoPago, monto: p.monto, referencia: p.referencia || undefined,
                    fuenteId: p.fuenteId,
                    estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioId,
                }));
                if (p.fuenteId) {
                    await manager.save(movimiento_fuente_entity_1.MovimientoFuente, manager.create(movimiento_fuente_entity_1.MovimientoFuente, {
                        clienteId, fuenteId: p.fuenteId, tipo: movimiento_fuente_entity_1.TipoMovimiento.INGRESO,
                        concepto: `Cobro venta ${venta.nroVenta}${venta.nombreCliente ? ` - ${venta.nombreCliente}` : ''} (${ETIQUETA_PAGO[p.metodoPago] || p.metodoPago}${p.referencia ? `, ref. ${p.referencia}` : ''})`,
                        referencia: venta.nroVenta, monto: p.monto, tipoCambio: 1, montoNativo: p.monto,
                        fecha: venta.fecha, categoria: movimiento_fuente_entity_1.CategoriaMovimiento.INGRESO_VENTA,
                        origenTipo: venta_pagos_service_1.ORIGEN_MOV_PAGO, origenId: pago.id,
                        estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioId,
                    }));
                }
            }
            if (dto.cajaSesionId) {
                await manager.increment(caja_sesion_entity_1.CajaSesion, { id: dto.cajaSesionId }, 'totalVentas', opciones.montoEfectivoCaja ?? total);
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
    async registrarDesdePOS(clienteId, dto, usuarioId, conCobro) {
        if (dto.tipoOperacion === 'COTIZACION') {
            throw new common_1.BadRequestException('Una cotización no se registra como venta: no descuenta stock ni genera cobro');
        }
        const total = r2(dto.detalles.reduce((s, d) => s + Number(d.precioUnitario) * Number(d.cantidad) - Number(d.descuento || 0), 0));
        const pagos = conCobro ? (dto.pagos || []).filter(p => Number(p.monto) > 0) : [];
        await this.validarFuentesCobro(clienteId, pagos);
        const adelantos = pagos.filter(p => p.metodoPago === 'ADELANTO');
        if (adelantos.length > 1)
            throw new common_1.BadRequestException('Solo se puede aplicar un adelanto por venta');
        if (adelantos.length && !adelantos[0].adelantoId)
            throw new common_1.BadRequestException('Selecciona el adelanto a aplicar');
        const totalPagado = r2(pagos.reduce((s, p) => s + Number(p.monto), 0));
        const efectivo = r2(pagos.filter(p => p.metodoPago === 'EFECTIVO').reduce((s, p) => s + Number(p.monto), 0));
        if (r2(totalPagado - efectivo) > total + 0.009) {
            throw new common_1.BadRequestException('Los pagos que no son en efectivo superan el total; solo el efectivo puede dar cambio');
        }
        const cambio = r2(Math.max(0, totalPagado - total));
        const saldo = r2(Math.max(0, total - totalPagado));
        if (conCobro && saldo > 0 && !dto.registrarDeuda) {
            throw new common_1.BadRequestException(`Faltan Bs ${saldo.toFixed(2)}. Completa el pago o regístralo como deuda`);
        }
        const sesion = await this.sesionRepo.findOne({
            where: { clienteId, usuarioId, estadoSesion: caja_sesion_entity_1.EstadoSesion.ABIERTA, estado: constants_1.Status.ACTIVE },
        });
        if (conCobro && !sesion)
            throw new common_1.BadRequestException('No tienes una caja abierta. Abre la caja antes de cobrar');
        if (sesion && sesion.sucursalId && sesion.sucursalId !== dto.sucursalId) {
            throw new common_1.BadRequestException('Tu caja abierta pertenece a otra sucursal');
        }
        const metodos = [...new Set(pagos.map(p => p.metodoPago))];
        const metodoPago = !metodos.length ? 'CREDITO' : metodos.length === 1 ? metodos[0] : 'MIXTO';
        const resumenPagos = pagos.length
            ? 'Pagos: ' + pagos.map(p => `${ETIQUETA_PAGO[p.metodoPago] || p.metodoPago} Bs ${Number(p.monto).toFixed(2)}${p.referencia ? ` (ref. ${p.referencia})` : ''}`).join(', ')
            : '';
        const ventaDto = {
            sucursalId: dto.sucursalId,
            cajaId: sesion?.cajaId,
            cajaSesionId: sesion?.id,
            metodoPago,
            contactoClienteId: dto.contactoClienteId,
            nombreCliente: dto.nombreCliente,
            observaciones: [dto.observaciones, resumenPagos].filter(Boolean).join(' | ') || undefined,
            adelantoId: adelantos[0]?.adelantoId,
            montoAdelanto: adelantos[0] ? Number(adelantos[0].monto) : undefined,
            detalles: dto.detalles,
        };
        let cambioPendiente = cambio;
        const pagosNetos = [...pagos].reverse().map(p => {
            let monto = Number(p.monto);
            if (p.metodoPago === 'EFECTIVO' && cambioPendiente > 0) {
                const descuento = Math.min(cambioPendiente, monto);
                monto = r2(monto - descuento);
                cambioPendiente = r2(cambioPendiente - descuento);
            }
            return { metodoPago: p.metodoPago, monto, referencia: p.referencia, fuenteId: p.metodoPago === 'ADELANTO' ? undefined : p.fuenteId };
        }).reverse();
        return this.crear(clienteId, ventaDto, usuarioId, {
            cotizacionId: dto.cotizacionId,
            pagos: pagosNetos,
            fecha: dto.fecha,
            estadoVenta: saldo > 0 ? venta_entity_1.EstadoVenta.PENDIENTE : venta_entity_1.EstadoVenta.PAGADA,
            montoPagado: totalPagado,
            cambio: cambio > 0 ? cambio : null,
            montoEfectivoCaja: r2(efectivo - cambio),
            nitCi: dto.nitCi,
            telefonoCliente: dto.telefonoCliente,
        });
    }
    async fuentesCobro(clienteId) {
        const schema = process.env.DB_SCHEMA || 'public';
        return this.dataSource.query(`SELECT id, nombre, tipo FROM ${schema}.fuente WHERE cliente_id = $1 AND activo = true AND _estado = $2 ORDER BY nombre`, [clienteId, constants_1.Status.ACTIVE]);
    }
    async validarFuentesCobro(clienteId, pagos) {
        const conDinero = pagos.filter(p => p.metodoPago !== 'ADELANTO');
        if (!conDinero.length)
            return;
        const fuentes = await this.fuentesCobro(clienteId);
        if (!fuentes.length)
            return;
        const validas = new Set(fuentes.map((f) => f.id));
        for (const p of conDinero) {
            if (!p.fuenteId)
                throw new common_1.BadRequestException(`Indica la fuente de fondos del pago en ${ETIQUETA_PAGO[p.metodoPago] || p.metodoPago}`);
            if (!validas.has(p.fuenteId))
                throw new common_1.BadRequestException('Fuente de fondos no válida o inactiva');
        }
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
                const efectivoCaja = venta.montoEfectivo != null ? Number(venta.montoEfectivo) : Number(venta.total);
                await manager.decrement(caja_sesion_entity_1.CajaSesion, { id: venta.cajaSesionId }, 'totalVentas', efectivoCaja);
                await manager.decrement(caja_sesion_entity_1.CajaSesion, { id: venta.cajaSesionId }, 'nroVentas', 1);
            }
            await cotizaciones_service_1.CotizacionesService.liberarPorVenta(manager, clienteId, venta.id);
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
            return { fechaIngreso: 'ASC', fechaCreacion: 'ASC' };
        if (metodoPicking === 'LIFO')
            return { fechaIngreso: 'DESC', fechaCreacion: 'DESC' };
        return { fechaVencimiento: 'ASC', fechaIngreso: 'ASC', fechaCreacion: 'ASC' };
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