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
exports.BizIntelToolsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const venta_entity_1 = require("../../ventas/entity/venta.entity");
const lote_entity_1 = require("../../lotes/entity/lote.entity");
const ingreso_entity_1 = require("../../ingresos/entity/ingreso.entity");
const gasto_entity_1 = require("../../gastos/entity/gasto.entity");
const fuente_entity_1 = require("../../fuentes/entity/fuente.entity");
const movimiento_fuente_entity_1 = require("../../fuentes/entity/movimiento-fuente.entity");
const producto_entity_1 = require("../../productos/entity/producto.entity");
const orden_importacion_entity_1 = require("../../logistica-ordenes/entity/orden-importacion.entity");
const constants_1 = require("../../../common/constants");
let BizIntelToolsService = class BizIntelToolsService {
    constructor(ventaRepo, loteRepo, ingresoRepo, gastoRepo, fuenteRepo, movRepo, productoRepo, ordenRepo) {
        this.ventaRepo = ventaRepo;
        this.loteRepo = loteRepo;
        this.ingresoRepo = ingresoRepo;
        this.gastoRepo = gastoRepo;
        this.fuenteRepo = fuenteRepo;
        this.movRepo = movRepo;
        this.productoRepo = productoRepo;
        this.ordenRepo = ordenRepo;
    }
    getToolDefs() {
        return [
            {
                name: 'consultar_ventas',
                description: 'Consulta el resumen de ventas del negocio por período. Retorna totales, cantidad de ventas, métodos de pago y monto promedio.',
                input_schema: {
                    type: 'object',
                    properties: {
                        periodo: {
                            type: 'string',
                            enum: ['hoy', 'semana', 'mes', 'ayer'],
                            description: 'Período a consultar',
                        },
                    },
                    required: ['periodo'],
                },
            },
            {
                name: 'consultar_stock',
                description: 'Consulta el estado del inventario/stock de productos. Puede filtrar por productos con stock bajo, agotados o ver todo.',
                input_schema: {
                    type: 'object',
                    properties: {
                        tipo: {
                            type: 'string',
                            enum: ['todos', 'bajo', 'agotado'],
                            description: 'todos=todo el inventario, bajo=stock bajo (menos de 10 unidades), agotado=sin stock',
                        },
                        limite: {
                            type: 'number',
                            description: 'Máximo de productos a retornar (default 15)',
                        },
                    },
                    required: ['tipo'],
                },
            },
            {
                name: 'consultar_finanzas',
                description: 'Consulta el resumen financiero: ingresos, gastos, saldo de fuentes de fondos.',
                input_schema: {
                    type: 'object',
                    properties: {
                        periodo: {
                            type: 'string',
                            enum: ['hoy', 'semana', 'mes'],
                            description: 'Período para los ingresos y gastos',
                        },
                    },
                    required: ['periodo'],
                },
            },
            {
                name: 'consultar_materiales',
                description: 'Consulta las órdenes de importación/compra de materiales recientes y su estado.',
                input_schema: {
                    type: 'object',
                    properties: {
                        estado: {
                            type: 'string',
                            enum: ['todos', 'pendiente', 'en_transito', 'recibida', 'cerrada'],
                            description: 'Filtrar por estado de la orden',
                        },
                        limite: {
                            type: 'number',
                            description: 'Máximo de órdenes a retornar (default 10)',
                        },
                    },
                    required: ['estado'],
                },
            },
        ];
    }
    async ejecutar(nombre, input, clienteId) {
        switch (nombre) {
            case 'consultar_ventas': return this.consultarVentas(input, clienteId);
            case 'consultar_stock': return this.consultarStock(input, clienteId);
            case 'consultar_finanzas': return this.consultarFinanzas(input, clienteId);
            case 'consultar_materiales': return this.consultarMateriales(input, clienteId);
            default: return { error: `Herramienta desconocida: ${nombre}` };
        }
    }
    async consultarVentas(input, clienteId) {
        const { inicio, fin, label } = this.rangoDeFechas(input.periodo);
        const ventas = await this.ventaRepo
            .createQueryBuilder('v')
            .where('v.cliente_id = :clienteId AND v._estado = :estado AND v.fecha BETWEEN :inicio AND :fin', {
            clienteId, estado: constants_1.Status.ACTIVE, inicio, fin,
        })
            .andWhere("v.estado_venta != 'ANULADA'")
            .getMany();
        const total = ventas.reduce((s, v) => s + Number(v.total), 0);
        const porMetodo = {};
        for (const v of ventas) {
            const m = v.metodoPago || 'N/A';
            porMetodo[m] = (porMetodo[m] || 0) + Number(v.total);
        }
        return {
            periodo: label,
            cantidadVentas: ventas.length,
            montoTotal: Number(total.toFixed(2)),
            promedioPorVenta: ventas.length ? Number((total / ventas.length).toFixed(2)) : 0,
            porMetodoPago: porMetodo,
        };
    }
    async consultarStock(input, clienteId) {
        const limite = input.limite || 15;
        const qb = this.loteRepo
            .createQueryBuilder('l')
            .select(['l.productoId', 'SUM(l.cantidadActual) AS total'])
            .where('l.cliente_id = :clienteId AND l._estado = :estado', { clienteId, estado: constants_1.Status.ACTIVE })
            .andWhere("l.estado_lote = 'ACTIVO'")
            .groupBy('l.productoId')
            .orderBy('total', 'ASC');
        if (input.tipo === 'bajo')
            qb.having('SUM(l.cantidadActual) < 10').andHaving('SUM(l.cantidadActual) > 0');
        if (input.tipo === 'agotado')
            qb.having('SUM(l.cantidadActual) = 0');
        const rows = await qb.limit(limite).getRawMany();
        const productoIds = rows.map(r => r.l_producto_id);
        const productos = productoIds.length
            ? await this.productoRepo.find({ where: productoIds.map(id => ({ id, clienteId, estado: constants_1.Status.ACTIVE })) })
            : [];
        const prodMap = new Map(productos.map(p => [p.id, p.nombre]));
        return {
            tipo: input.tipo,
            productos: rows.map(r => ({
                nombre: prodMap.get(r.l_producto_id) || r.l_producto_id,
                stockActual: Number(r.total),
            })),
            total: rows.length,
        };
    }
    async consultarFinanzas(input, clienteId) {
        const { inicio, fin, label } = this.rangoDeFechas(input.periodo);
        const [ingresos, gastos, fuentes] = await Promise.all([
            this.ingresoRepo
                .createQueryBuilder('i')
                .where('i.cliente_id = :clienteId AND i._estado = :estado AND i.fecha BETWEEN :inicio AND :fin', {
                clienteId, estado: constants_1.Status.ACTIVE, inicio, fin,
            })
                .getMany(),
            this.gastoRepo
                .createQueryBuilder('g')
                .where('g.cliente_id = :clienteId AND g._estado = :estado AND g.fecha BETWEEN :inicio AND :fin', {
                clienteId, estado: constants_1.Status.ACTIVE, inicio, fin,
            })
                .getMany(),
            this.fuenteRepo.find({ where: { clienteId, estado: constants_1.Status.ACTIVE } }),
        ]);
        const totalIngresos = ingresos.reduce((s, i) => s + Number(i.monto), 0);
        const totalGastos = gastos.reduce((s, g) => s + Number(g.monto), 0);
        const fuentesConSaldo = await Promise.all(fuentes.map(async (f) => {
            const res = await this.movRepo
                .createQueryBuilder('m')
                .select([
                "SUM(CASE WHEN m.tipo IN ('INGRESO','TRANSFERENCIA_ENTRADA') THEN m.monto_nativo ELSE 0 END) AS entradas",
                "SUM(CASE WHEN m.tipo IN ('EGRESO','TRANSFERENCIA_SALIDA') THEN m.monto_nativo ELSE 0 END) AS salidas",
            ])
                .where('m.cliente_id = :clienteId AND m.fuente_id = :fuenteId AND m._estado = :estado', {
                clienteId, fuenteId: f.id, estado: constants_1.Status.ACTIVE,
            })
                .getRawOne();
            const saldo = Number(f.saldoInicial) + Number(res?.entradas || 0) - Number(res?.salidas || 0);
            return { nombre: f.nombre, tipo: f.tipo, saldo: Number(saldo.toFixed(2)) };
        }));
        return {
            periodo: label,
            totalIngresos: Number(totalIngresos.toFixed(2)),
            totalGastos: Number(totalGastos.toFixed(2)),
            balance: Number((totalIngresos - totalGastos).toFixed(2)),
            fuentesDeFondos: fuentesConSaldo,
        };
    }
    async consultarMateriales(input, clienteId) {
        const limite = input.limite || 10;
        const qb = this.ordenRepo
            .createQueryBuilder('o')
            .where('o.cliente_id = :clienteId AND o._estado = :estado', { clienteId, estado: constants_1.Status.ACTIVE })
            .orderBy('o._fecha_creacion', 'DESC')
            .limit(limite);
        if (input.estado !== 'todos') {
            const estadoMap = {
                pendiente: 'PENDIENTE',
                en_transito: 'EN_TRANSITO',
                recibida: 'RECIBIDA',
                cerrada: 'CERRADA',
            };
            const estadoDB = estadoMap[input.estado];
            if (estadoDB)
                qb.andWhere('o.estado = :estadoO', { estadoO: estadoDB });
        }
        const ordenes = await qb.getMany();
        return {
            ordenes: ordenes.map(o => ({
                numero: o.numero,
                estado: o.estadoOrden,
                fechaOrden: o.fechaOrden,
                paisOrigen: o.paisOrigen,
                totalBase: Number(o.costoTotalMonedaBase || 0).toFixed(2),
                observaciones: o.observaciones || '',
            })),
            total: ordenes.length,
        };
    }
    rangoDeFechas(periodo) {
        const hoy = new Date();
        const fmt = (d) => d.toISOString().split('T')[0];
        switch (periodo) {
            case 'hoy':
                return { inicio: fmt(hoy), fin: fmt(hoy), label: 'hoy' };
            case 'ayer': {
                const ayer = new Date(hoy);
                ayer.setDate(ayer.getDate() - 1);
                return { inicio: fmt(ayer), fin: fmt(ayer), label: 'ayer' };
            }
            case 'semana': {
                const hace7 = new Date(hoy);
                hace7.setDate(hace7.getDate() - 7);
                return { inicio: fmt(hace7), fin: fmt(hoy), label: 'últimos 7 días' };
            }
            case 'mes': {
                const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                return { inicio: fmt(inicio), fin: fmt(hoy), label: 'este mes' };
            }
            default:
                return { inicio: fmt(hoy), fin: fmt(hoy), label: 'hoy' };
        }
    }
};
BizIntelToolsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(venta_entity_1.Venta)),
    __param(1, (0, typeorm_1.InjectRepository)(lote_entity_1.Lote)),
    __param(2, (0, typeorm_1.InjectRepository)(ingreso_entity_1.Ingreso)),
    __param(3, (0, typeorm_1.InjectRepository)(gasto_entity_1.Gasto)),
    __param(4, (0, typeorm_1.InjectRepository)(fuente_entity_1.Fuente)),
    __param(5, (0, typeorm_1.InjectRepository)(movimiento_fuente_entity_1.MovimientoFuente)),
    __param(6, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __param(7, (0, typeorm_1.InjectRepository)(orden_importacion_entity_1.OrdenImportacion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BizIntelToolsService);
exports.BizIntelToolsService = BizIntelToolsService;
//# sourceMappingURL=biz-intel-tools.service.js.map