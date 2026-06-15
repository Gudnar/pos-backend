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
var AdminGerenteToolsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGerenteToolsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const producto_entity_1 = require("../../productos/entity/producto.entity");
const lote_entity_1 = require("../../lotes/entity/lote.entity");
const movimiento_stock_entity_1 = require("../../movimientos-stock/entity/movimiento-stock.entity");
const venta_entity_1 = require("../../ventas/entity/venta.entity");
const detalle_venta_entity_1 = require("../../ventas/entity/detalle-venta.entity");
const orden_importacion_entity_1 = require("../../logistica-ordenes/entity/orden-importacion.entity");
const constants_1 = require("../../../common/constants");
let AdminGerenteToolsService = AdminGerenteToolsService_1 = class AdminGerenteToolsService {
    constructor(productoRepo, loteRepo, movRepo, ventaRepo, detalleVentaRepo, ordenRepo) {
        this.productoRepo = productoRepo;
        this.loteRepo = loteRepo;
        this.movRepo = movRepo;
        this.ventaRepo = ventaRepo;
        this.detalleVentaRepo = detalleVentaRepo;
        this.ordenRepo = ordenRepo;
        this.logger = new common_1.Logger(AdminGerenteToolsService_1.name);
    }
    getToolDefs() {
        return [
            {
                name: 'consultar_stock_producto',
                description: 'Consulta el stock actual de uno o varios productos buscando por nombre o código. Retorna los lotes activos con sus cantidades disponibles.',
                input_schema: {
                    type: 'object',
                    properties: {
                        termino: {
                            type: 'string',
                            description: 'Nombre parcial o código del producto a buscar',
                        },
                    },
                    required: ['termino'],
                },
            },
            {
                name: 'registrar_venta',
                description: 'Registra una nueva venta al contado o a crédito. Descuenta el stock automáticamente usando FEFO (primero en vencer, primero en salir). Retorna el número de venta generado.',
                input_schema: {
                    type: 'object',
                    properties: {
                        nombre_cliente: {
                            type: 'string',
                            description: 'Nombre del cliente (opcional)',
                        },
                        metodo_pago: {
                            type: 'string',
                            enum: ['EFECTIVO', 'TARJETA', 'QR', 'TRANSFERENCIA', 'CREDITO'],
                            description: 'Método de pago. CREDITO deja la venta en estado PENDIENTE.',
                        },
                        items: {
                            type: 'array',
                            description: 'Productos a vender',
                            items: {
                                type: 'object',
                                properties: {
                                    nombre_producto: { type: 'string', description: 'Nombre del producto (búsqueda parcial)' },
                                    cantidad: { type: 'number', description: 'Cantidad a vender' },
                                    precio_unitario: { type: 'number', description: 'Precio de venta unitario' },
                                },
                                required: ['nombre_producto', 'cantidad', 'precio_unitario'],
                            },
                        },
                        sucursal_id: {
                            type: 'string',
                            description: 'UUID de la sucursal donde se realiza la venta',
                        },
                        observaciones: {
                            type: 'string',
                            description: 'Notas adicionales (opcional)',
                        },
                    },
                    required: ['metodo_pago', 'items', 'sucursal_id'],
                },
            },
            {
                name: 'consultar_deudas_cliente',
                description: 'Consulta las ventas a crédito pendientes de cobro de un cliente. Retorna el saldo total adeudado y el detalle por venta.',
                input_schema: {
                    type: 'object',
                    properties: {
                        nombre_cliente: {
                            type: 'string',
                            description: 'Nombre parcial del cliente para buscar',
                        },
                    },
                    required: ['nombre_cliente'],
                },
            },
            {
                name: 'consultar_pago_proveedor',
                description: 'Consulta las órdenes de importación con pagos pendientes (en tránsito, en aduana o recibidas pero no cerradas). Retorna el monto total y el estado de cada orden.',
                input_schema: {
                    type: 'object',
                    properties: {
                        nombre_proveedor: {
                            type: 'string',
                            description: 'Nombre parcial del proveedor para filtrar (opcional, omitir para ver todas)',
                        },
                    },
                },
            },
            {
                name: 'registrar_ingreso_mercaderia',
                description: 'Registra el ingreso de mercadería al inventario. Si ya existe un lote activo del producto en la sucursal, incrementa su cantidad. Si no, crea un lote nuevo. Genera el movimiento de stock correspondiente.',
                input_schema: {
                    type: 'object',
                    properties: {
                        nombre_producto: {
                            type: 'string',
                            description: 'Nombre del producto a ingresar (búsqueda parcial)',
                        },
                        cantidad: {
                            type: 'number',
                            description: 'Cantidad a ingresar',
                        },
                        sucursal_id: {
                            type: 'string',
                            description: 'UUID de la sucursal destino',
                        },
                        nro_factura: {
                            type: 'string',
                            description: 'Número de factura del proveedor (opcional)',
                        },
                        costo_unitario: {
                            type: 'number',
                            description: 'Costo unitario en moneda local (opcional, informativo)',
                        },
                    },
                    required: ['nombre_producto', 'cantidad', 'sucursal_id'],
                },
            },
        ];
    }
    async ejecutar(nombre, input, clienteId) {
        this.logger.log(`[AdminTools] Ejecutando: ${nombre} | input: ${JSON.stringify(input).slice(0, 120)}`);
        switch (nombre) {
            case 'consultar_stock_producto': return this.consultarStock(input, clienteId);
            case 'registrar_venta': return this.registrarVenta(input, clienteId);
            case 'consultar_deudas_cliente': return this.consultarDeudas(input, clienteId);
            case 'consultar_pago_proveedor': return this.consultarPagosProveedor(input, clienteId);
            case 'registrar_ingreso_mercaderia': return this.registrarIngreso(input, clienteId);
            default: return { error: `Herramienta desconocida: ${nombre}` };
        }
    }
    async consultarStock(input, clienteId) {
        const productos = await this.productoRepo.find({
            where: { clienteId, nombre: (0, typeorm_2.ILike)(`%${input.termino}%`), estado: constants_1.Status.ACTIVE },
        });
        if (!productos.length) {
            return { mensaje: `No se encontraron productos con el término "${input.termino}"`, productos: [] };
        }
        const resultados = await Promise.all(productos.slice(0, 10).map(async (p) => {
            const lotes = await this.loteRepo
                .createQueryBuilder('l')
                .where('l.cliente_id = :clienteId AND l.producto_id = :productoId AND l._estado = :activo AND l.estado_lote = :estadoLote', { clienteId, productoId: p.id, activo: constants_1.Status.ACTIVE, estadoLote: 'ACTIVO' })
                .orderBy('l.fecha_vencimiento', 'ASC', 'NULLS LAST')
                .getMany();
            const stockTotal = lotes.reduce((s, l) => s + Number(l.cantidadActual), 0);
            return {
                id: p.id,
                nombre: p.nombre,
                codigo: p.codigoBarras || p.codigoTienda || '',
                stockTotal,
                unidadMedida: p.unidadMedida || '',
                lotes: lotes.map(l => ({
                    loteInterno: l.loteInterno || l.nroLote || 'sin número',
                    cantidadActual: Number(l.cantidadActual),
                    fechaVencimiento: l.fechaVencimiento || null,
                })),
            };
        }));
        return { productos: resultados, total: resultados.length };
    }
    async registrarVenta(input, clienteId) {
        const detallesResueltos = [];
        for (const item of input.items) {
            const productos = await this.productoRepo.find({
                where: { clienteId, nombre: (0, typeorm_2.ILike)(`%${item.nombre_producto}%`), estado: constants_1.Status.ACTIVE },
            });
            if (!productos.length) {
                return { error: `Producto no encontrado: "${item.nombre_producto}". Verifica el nombre e intenta nuevamente.` };
            }
            const producto = productos[0];
            const lote = await this.loteRepo
                .createQueryBuilder('l')
                .where('l.cliente_id = :clienteId AND l.producto_id = :productoId AND l.sucursal_id = :sucursalId AND l._estado = :activo AND l.estado_lote = :estadoLote AND l.cantidad_actual > 0', { clienteId, productoId: producto.id, sucursalId: input.sucursal_id, activo: constants_1.Status.ACTIVE, estadoLote: 'ACTIVO' })
                .orderBy('l.fecha_vencimiento', 'ASC', 'NULLS LAST')
                .getOne();
            if (!lote) {
                return { error: `Sin stock disponible para "${producto.nombre}" en esa sucursal.` };
            }
            if (Number(lote.cantidadActual) < item.cantidad) {
                return { error: `Stock insuficiente para "${producto.nombre}". Disponible: ${lote.cantidadActual}, solicitado: ${item.cantidad}.` };
            }
            detallesResueltos.push({ producto, lote, cantidad: item.cantidad, precioUnitario: item.precio_unitario });
        }
        const subtotal = detallesResueltos.reduce((s, d) => s + d.cantidad * d.precioUnitario, 0);
        const nroVenta = `WA-${Date.now().toString().slice(-8)}`;
        const venta = this.ventaRepo.create({
            clienteId,
            sucursalId: input.sucursal_id,
            nroVenta,
            fecha: new Date().toISOString().split('T')[0],
            estadoVenta: input.metodo_pago === 'CREDITO' ? 'PENDIENTE' : 'PAGADA',
            metodoPago: input.metodo_pago,
            subtotal,
            descuento: 0,
            impuesto: 0,
            total: subtotal,
            montoPagado: input.metodo_pago === 'CREDITO' ? 0 : subtotal,
            cambio: 0,
            nombreCliente: input.nombre_cliente || 'Sin nombre',
            observaciones: input.observaciones || 'Venta registrada vía WhatsApp',
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: constants_1.USUARIO_SISTEMA,
        });
        const ventaGuardada = await this.ventaRepo.save(venta);
        for (const d of detallesResueltos) {
            const detalle = this.detalleVentaRepo.create({
                clienteId,
                ventaId: ventaGuardada.id,
                productoId: d.producto.id,
                loteId: d.lote.id,
                nombreProducto: d.producto.nombre,
                cantidad: d.cantidad,
                precioUnitario: d.precioUnitario,
                descuento: 0,
                subtotal: d.cantidad * d.precioUnitario,
                estado: constants_1.Status.ACTIVE,
                transaccion: constants_1.Transacccion.CREAR,
                usuarioCreacion: constants_1.USUARIO_SISTEMA,
            });
            await this.detalleVentaRepo.save(detalle);
            const cantAnterior = Number(d.lote.cantidadActual);
            const cantPosterior = cantAnterior - d.cantidad;
            d.lote.cantidadActual = cantPosterior;
            d.lote.estadoLote = cantPosterior <= 0 ? 'AGOTADO' : 'ACTIVO';
            d.lote.transaccion = constants_1.Transacccion.ACTUALIZAR;
            d.lote.usuarioModificacion = constants_1.USUARIO_SISTEMA;
            await this.loteRepo.save(d.lote);
            const mov = this.movRepo.create({
                clienteId,
                sucursalId: input.sucursal_id,
                productoId: d.producto.id,
                loteId: d.lote.id,
                tipo: movimiento_stock_entity_1.TipoMovimiento.SALIDA,
                cantidad: d.cantidad,
                cantidadAnterior: cantAnterior,
                cantidadPosterior: cantPosterior,
                referenciaDocumento: nroVenta,
                tipoDocumento: 'VENTA',
                motivo: `Venta ${nroVenta} registrada vía WhatsApp`,
                estado: constants_1.Status.ACTIVE,
                transaccion: constants_1.Transacccion.CREAR,
                usuarioCreacion: constants_1.USUARIO_SISTEMA,
            });
            await this.movRepo.save(mov);
        }
        return {
            exito: true,
            nroVenta,
            total: Number(subtotal.toFixed(2)),
            estado: ventaGuardada.estadoVenta,
            itemsVendidos: detallesResueltos.length,
            mensaje: `Venta ${nroVenta} registrada por ${subtotal.toFixed(2)}. Estado: ${ventaGuardada.estadoVenta}.`,
        };
    }
    async consultarDeudas(input, clienteId) {
        const ventas = await this.ventaRepo
            .createQueryBuilder('v')
            .where("v.cliente_id = :clienteId AND v._estado = :activo AND v.estado_venta = 'PENDIENTE' AND v.nombre_cliente ILIKE :nombre", { clienteId, activo: constants_1.Status.ACTIVE, nombre: `%${input.nombre_cliente}%` })
            .orderBy('v._fecha_creacion', 'DESC')
            .limit(25)
            .getMany();
        const totalDeuda = ventas.reduce((s, v) => s + (Number(v.total) - Number(v.montoPagado)), 0);
        return {
            cliente: input.nombre_cliente,
            totalDeuda: Number(totalDeuda.toFixed(2)),
            cantidadVentas: ventas.length,
            ventas: ventas.map(v => ({
                nroVenta: v.nroVenta,
                fecha: v.fecha,
                total: Number(v.total),
                montoPagado: Number(v.montoPagado),
                saldoPendiente: Number((Number(v.total) - Number(v.montoPagado)).toFixed(2)),
                metodoPago: v.metodoPago,
            })),
        };
    }
    async consultarPagosProveedor(input, clienteId) {
        const qb = this.ordenRepo
            .createQueryBuilder('o')
            .where("o.cliente_id = :clienteId AND o._estado = :activo AND o.estado NOT IN ('CERRADO', 'BORRADOR')", { clienteId, activo: constants_1.Status.ACTIVE })
            .orderBy('o._fecha_creacion', 'DESC')
            .limit(20);
        if (input.nombre_proveedor) {
            qb.andWhere('o.observaciones ILIKE :prov OR o.pais_origen ILIKE :prov', {
                prov: `%${input.nombre_proveedor}%`,
            });
        }
        const ordenes = await qb.getMany();
        const totalPendiente = ordenes.reduce((s, o) => s + Number(o.costoTotalMonedaBase || 0), 0);
        return {
            ordenesPendientes: ordenes.map(o => ({
                numero: o.numero,
                estado: o.estadoOrden,
                paisOrigen: o.paisOrigen,
                fechaOrden: o.fechaOrden,
                fechaEstimadaLlegada: o.fechaEstimadaLlegada || null,
                costoTotal: Number(o.costoTotalMonedaBase || 0),
                observaciones: o.observaciones || '',
            })),
            totalPendiente: Number(totalPendiente.toFixed(2)),
            cantidad: ordenes.length,
        };
    }
    async registrarIngreso(input, clienteId) {
        const productos = await this.productoRepo.find({
            where: { clienteId, nombre: (0, typeorm_2.ILike)(`%${input.nombre_producto}%`), estado: constants_1.Status.ACTIVE },
        });
        if (!productos.length) {
            return { error: `Producto no encontrado: "${input.nombre_producto}". Verifica el nombre e intenta nuevamente.` };
        }
        const producto = productos[0];
        const loteExistente = await this.loteRepo
            .createQueryBuilder('l')
            .where('l.cliente_id = :clienteId AND l.producto_id = :productoId AND l.sucursal_id = :sucursalId AND l._estado = :activo AND l.estado_lote = :estadoLote', { clienteId, productoId: producto.id, sucursalId: input.sucursal_id, activo: constants_1.Status.ACTIVE, estadoLote: 'ACTIVO' })
            .orderBy('l._fecha_creacion', 'DESC')
            .getOne();
        let loteId;
        let cantAnterior = 0;
        const cantPosterior = cantAnterior + Number(input.cantidad);
        if (loteExistente) {
            cantAnterior = Number(loteExistente.cantidadActual);
            const nuevaCant = cantAnterior + Number(input.cantidad);
            loteExistente.cantidadActual = nuevaCant;
            loteExistente.transaccion = constants_1.Transacccion.ACTUALIZAR;
            loteExistente.usuarioModificacion = constants_1.USUARIO_SISTEMA;
            await this.loteRepo.save(loteExistente);
            loteId = loteExistente.id;
        }
        else {
            const nuevoLote = this.loteRepo.create({
                clienteId,
                sucursalId: input.sucursal_id,
                productoId: producto.id,
                loteInterno: `ING-WA-${Date.now().toString().slice(-6)}`,
                nroFacturaProveedor: input.nro_factura || null,
                cantidadInicial: input.cantidad,
                cantidadActual: input.cantidad,
                fechaIngreso: new Date().toISOString().split('T')[0],
                estadoLote: 'ACTIVO',
                estado: constants_1.Status.ACTIVE,
                transaccion: constants_1.Transacccion.CREAR,
                usuarioCreacion: constants_1.USUARIO_SISTEMA,
            });
            const loteSaved = await this.loteRepo.save(nuevoLote);
            loteId = loteSaved.id;
        }
        const cantPost = cantAnterior + Number(input.cantidad);
        const mov = this.movRepo.create({
            clienteId,
            sucursalId: input.sucursal_id,
            productoId: producto.id,
            loteId,
            tipo: movimiento_stock_entity_1.TipoMovimiento.INGRESO,
            cantidad: input.cantidad,
            cantidadAnterior: cantAnterior,
            cantidadPosterior: cantPost,
            referenciaDocumento: input.nro_factura || `ING-WA-${Date.now()}`,
            tipoDocumento: 'INGRESO_WA',
            motivo: 'Ingreso registrado vía WhatsApp',
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: constants_1.USUARIO_SISTEMA,
        });
        await this.movRepo.save(mov);
        return {
            exito: true,
            producto: producto.nombre,
            cantidadIngresada: Number(input.cantidad),
            stockAnterior: cantAnterior,
            stockActual: cantPost,
            esLoteNuevo: !loteExistente,
            mensaje: `Ingreso de ${input.cantidad} unidades de "${producto.nombre}" registrado. Stock actual: ${cantPost}.`,
        };
    }
};
AdminGerenteToolsService = AdminGerenteToolsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __param(1, (0, typeorm_1.InjectRepository)(lote_entity_1.Lote)),
    __param(2, (0, typeorm_1.InjectRepository)(movimiento_stock_entity_1.MovimientoStock)),
    __param(3, (0, typeorm_1.InjectRepository)(venta_entity_1.Venta)),
    __param(4, (0, typeorm_1.InjectRepository)(detalle_venta_entity_1.DetalleVenta)),
    __param(5, (0, typeorm_1.InjectRepository)(orden_importacion_entity_1.OrdenImportacion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminGerenteToolsService);
exports.AdminGerenteToolsService = AdminGerenteToolsService;
//# sourceMappingURL=admin-gerente-tools.service.js.map