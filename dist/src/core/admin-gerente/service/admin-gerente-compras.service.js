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
var AdminGerenteComprasService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGerenteComprasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const compras_service_1 = require("../../compras/service/compras.service");
const producto_entity_1 = require("../../productos/entity/producto.entity");
const constants_1 = require("../../../common/constants");
let AdminGerenteComprasService = AdminGerenteComprasService_1 = class AdminGerenteComprasService {
    constructor(comprasService, productoRepo) {
        this.comprasService = comprasService;
        this.productoRepo = productoRepo;
        this.logger = new common_1.Logger(AdminGerenteComprasService_1.name);
    }
    getToolDefs() {
        return [
            {
                name: 'consultar_compras',
                description: 'Lista las órdenes de compra con sus estados, totales y montos pagados. Filtra por estado para ver en tránsito, pendientes de recepción o finalizadas.',
                input_schema: {
                    type: 'object',
                    properties: {
                        estado: {
                            type: 'string',
                            enum: ['EN_TRANSITO', 'PENDIENTE', 'FINALIZADO', 'ANULADA'],
                            description: 'Filtrar por estado. Omitir para ver todas las activas.',
                        },
                        limite: { type: 'number', description: 'Máximo de resultados (default 10)' },
                    },
                },
            },
            {
                name: 'crear_compra',
                description: 'Crea una nueva orden de compra a un proveedor. Tipo COMPRA inicia en EN_TRANSITO (mercadería en camino). Tipo INICIAL carga directamente al inventario. Para crear la compra necesitas el sucursal_id.',
                input_schema: {
                    type: 'object',
                    properties: {
                        sucursal_id: { type: 'string', description: 'UUID de la sucursal destino' },
                        tipo_compra: {
                            type: 'string',
                            enum: ['COMPRA', 'INICIAL'],
                            description: 'COMPRA: mercadería en tránsito. INICIAL: carga directa al inventario.',
                        },
                        items: {
                            type: 'array',
                            description: 'Productos de la compra',
                            items: {
                                type: 'object',
                                properties: {
                                    nombre_producto: { type: 'string', description: 'Nombre del producto (búsqueda parcial)' },
                                    cantidad: { type: 'number', description: 'Cantidad a comprar' },
                                    precio_unitario: { type: 'number', description: 'Precio de compra unitario' },
                                    nro_lote: { type: 'string', description: 'Número de lote (opcional)' },
                                    fecha_vencimiento: { type: 'string', description: 'Fecha vencimiento del lote YYYY-MM-DD (opcional)' },
                                },
                                required: ['nombre_producto', 'cantidad', 'precio_unitario'],
                            },
                        },
                        proveedor_id: { type: 'string', description: 'UUID del proveedor (opcional)' },
                        nro_factura: { type: 'string', description: 'Número de factura del proveedor (opcional)' },
                        fecha: { type: 'string', description: 'Fecha de la compra YYYY-MM-DD (default: hoy)' },
                        fecha_estimada_llegada: { type: 'string', description: 'Fecha estimada de llegada YYYY-MM-DD (opcional)' },
                        observaciones: { type: 'string', description: 'Notas adicionales (opcional)' },
                    },
                    required: ['sucursal_id', 'tipo_compra', 'items'],
                },
            },
            {
                name: 'recibir_compra_almacen',
                description: 'Marca una compra como recibida en almacén (transición EN_TRANSITO → PENDIENTE). Después de esto se puede finalizar para cargar al inventario.',
                input_schema: {
                    type: 'object',
                    properties: {
                        nro_compra: { type: 'string', description: 'Número de la compra (ej. COM-0001)' },
                        condicion_mercancia: {
                            type: 'string',
                            enum: ['BUENA', 'DAÑADA', 'PARCIAL'],
                            description: 'Estado en que llegó la mercadería (default: BUENA)',
                        },
                        observaciones: { type: 'string', description: 'Observaciones de la recepción (opcional)' },
                    },
                    required: ['nro_compra'],
                },
            },
            {
                name: 'finalizar_compra_inventario',
                description: 'Finaliza una compra PENDIENTE y carga los productos al inventario. Crea los lotes y registra los movimientos de stock.',
                input_schema: {
                    type: 'object',
                    properties: {
                        nro_compra: { type: 'string', description: 'Número de la compra (ej. COM-0001)' },
                        observaciones: { type: 'string', description: 'Observaciones de la finalización (opcional)' },
                    },
                    required: ['nro_compra'],
                },
            },
        ];
    }
    async ejecutar(nombre, input, clienteId, adminId) {
        switch (nombre) {
            case 'consultar_compras': return this.consultarCompras(input, clienteId);
            case 'crear_compra': return this.crearCompra(input, clienteId, adminId);
            case 'recibir_compra_almacen': return this.recibirCompra(input, clienteId, adminId);
            case 'finalizar_compra_inventario': return this.finalizarCompra(input, clienteId, adminId);
            default: return null;
        }
    }
    async consultarCompras(input, clienteId) {
        const filtros = {};
        if (input.estado)
            filtros.estado = input.estado;
        const compras = await this.comprasService.listar(clienteId, filtros);
        const limite = input.limite || 10;
        return {
            compras: compras.slice(0, limite).map((c) => ({
                nroCompra: c.nroCompra,
                tipo: c.tipoCompra,
                estado: c.estadoCompra,
                estadoPago: c.estadoPago,
                fecha: c.fecha,
                fechaEstimadaLlegada: c.fechaEstimadaLlegada || null,
                total: Number(c.total || 0),
                montoPagado: Number(c.montoPagado || 0),
                saldoPendiente: Number(c.total || 0) - Number(c.montoPagado || 0),
                observaciones: c.observaciones || '',
            })),
            total: Math.min(compras.length, limite),
        };
    }
    async crearCompra(input, clienteId, adminId) {
        const hoy = new Date().toISOString().split('T')[0];
        const detalles = [];
        for (const item of input.items) {
            const productos = await this.productoRepo.find({
                where: { clienteId, nombre: (0, typeorm_2.ILike)(`%${item.nombre_producto}%`), estado: constants_1.Status.ACTIVE },
            });
            if (!productos.length) {
                return { error: `Producto no encontrado: "${item.nombre_producto}"` };
            }
            detalles.push({
                productoId: productos[0].id,
                cantidad: item.cantidad,
                precioUnitario: item.precio_unitario,
                descuento: 0,
                nroLote: item.nro_lote || null,
                fechaVencimiento: item.fecha_vencimiento || null,
            });
        }
        const dto = {
            sucursalId: input.sucursal_id,
            tipoCompra: input.tipo_compra,
            fecha: input.fecha || hoy,
            proveedorId: input.proveedor_id || null,
            nroFactura: input.nro_factura || null,
            fechaEstimadaLlegada: input.fecha_estimada_llegada || null,
            observaciones: input.observaciones || null,
            detalles,
        };
        const compra = await this.comprasService.crear(clienteId, dto, adminId);
        return {
            exito: true,
            nroCompra: compra.nroCompra,
            estado: compra.estadoCompra,
            total: Number(compra.total || 0),
            mensaje: `Compra ${compra.nroCompra} creada. Estado: ${compra.estadoCompra}.`,
        };
    }
    async recibirCompra(input, clienteId, adminId) {
        const compras = await this.comprasService.listar(clienteId, { estado: 'EN_TRANSITO' });
        const compra = compras.find((c) => c.nroCompra === input.nro_compra);
        if (!compra)
            return { error: `Compra "${input.nro_compra}" no encontrada en estado EN_TRANSITO` };
        const hoy = new Date().toISOString().split('T')[0];
        const dto = {
            fechaRecepcion: hoy,
            condicionMercancia: input.condicion_mercancia || 'BUENA',
            observacionesRecepcion: input.observaciones || null,
        };
        await this.comprasService.marcarPendiente(clienteId, compra.id, dto, adminId);
        return {
            exito: true,
            nroCompra: input.nro_compra,
            condicion: dto.condicionMercancia,
            mensaje: `Compra ${input.nro_compra} marcada como recibida. Ahora puedes finalizarla para cargar al inventario.`,
        };
    }
    async finalizarCompra(input, clienteId, adminId) {
        const compras = await this.comprasService.listar(clienteId, { estado: 'PENDIENTE' });
        const compra = compras.find((c) => c.nroCompra === input.nro_compra);
        if (!compra)
            return { error: `Compra "${input.nro_compra}" no encontrada en estado PENDIENTE` };
        const detalle = await this.comprasService.obtener(clienteId, compra.id);
        const dto = {
            observacionesFinalizacion: input.observaciones || null,
            detalles: (detalle.detalles || []).map((d) => ({
                id: d.id,
                nroLote: d.nroLote || null,
                fechaVencimiento: d.fechaVencimiento || null,
            })),
        };
        await this.comprasService.finalizar(clienteId, compra.id, dto, adminId);
        return {
            exito: true,
            nroCompra: input.nro_compra,
            itemsInventariados: dto.detalles.length,
            mensaje: `Compra ${input.nro_compra} finalizada. ${dto.detalles.length} producto(s) cargado(s) al inventario.`,
        };
    }
};
AdminGerenteComprasService = AdminGerenteComprasService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __metadata("design:paramtypes", [compras_service_1.ComprasService,
        typeorm_2.Repository])
], AdminGerenteComprasService);
exports.AdminGerenteComprasService = AdminGerenteComprasService;
//# sourceMappingURL=admin-gerente-compras.service.js.map