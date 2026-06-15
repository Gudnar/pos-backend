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
var AdminGerenteLogisticaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGerenteLogisticaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const orden_importacion_entity_1 = require("../../logistica-ordenes/entity/orden-importacion.entity");
const item_orden_importacion_entity_1 = require("../../logistica-ordenes/entity/item-orden-importacion.entity");
const pago_proveedor_importacion_entity_1 = require("../../logistica-ordenes/entity/pago-proveedor-importacion.entity");
const gasto_logistica_entity_1 = require("../../logistica-ordenes/entity/gasto-logistica.entity");
const moneda_entity_1 = require("../../logistica-monedas/entity/moneda.entity");
const fuente_entity_1 = require("../../fuentes/entity/fuente.entity");
const movimiento_fuente_entity_1 = require("../../fuentes/entity/movimiento-fuente.entity");
const constants_1 = require("../../../common/constants");
let AdminGerenteLogisticaService = AdminGerenteLogisticaService_1 = class AdminGerenteLogisticaService {
    constructor(ordenRepo, itemRepo, pagoRepo, gastoRepo, monedaRepo, fuenteRepo, movFuenteRepo) {
        this.ordenRepo = ordenRepo;
        this.itemRepo = itemRepo;
        this.pagoRepo = pagoRepo;
        this.gastoRepo = gastoRepo;
        this.monedaRepo = monedaRepo;
        this.fuenteRepo = fuenteRepo;
        this.movFuenteRepo = movFuenteRepo;
        this.logger = new common_1.Logger(AdminGerenteLogisticaService_1.name);
    }
    getToolDefs() {
        return [
            {
                name: 'consultar_orden_importacion',
                description: 'Consulta el detalle completo de una orden de importación: ítems, pagos realizados a proveedor y gastos de logística registrados.',
                input_schema: {
                    type: 'object',
                    properties: {
                        numero_orden: {
                            type: 'string',
                            description: 'Número de la orden (ej. IMP-2024-001). Si se omite, lista las últimas 10 órdenes activas.',
                        },
                    },
                },
            },
            {
                name: 'registrar_pago_proveedor_importacion',
                description: 'Registra un pago realizado al proveedor de una orden de importación. Si se indica una fuente de fondos, también registra el egreso en esa fuente.',
                input_schema: {
                    type: 'object',
                    properties: {
                        numero_orden: { type: 'string', description: 'Número de la orden de importación' },
                        monto: { type: 'number', description: 'Monto pagado en la moneda indicada' },
                        moneda_codigo: { type: 'string', description: 'Código ISO de la moneda (ej. USD, BOB, EUR)' },
                        tipo_cambio: { type: 'number', description: 'Tipo de cambio a moneda base (default: 1 si es moneda base)' },
                        metodo_pago: {
                            type: 'string',
                            enum: ['TRANSFERENCIA', 'CARTA_CREDITO', 'EFECTIVO', 'OTRO'],
                            description: 'Método de pago (default: TRANSFERENCIA)',
                        },
                        referencia: { type: 'string', description: 'Nro. de transferencia o referencia (opcional)' },
                        nombre_fuente: { type: 'string', description: 'Nombre de la fuente de fondos de donde sale el dinero (opcional)' },
                        fecha: { type: 'string', description: 'Fecha del pago YYYY-MM-DD (default: hoy)' },
                        observaciones: { type: 'string', description: 'Notas adicionales (opcional)' },
                    },
                    required: ['numero_orden', 'monto', 'moneda_codigo'],
                },
            },
            {
                name: 'registrar_gasto_logistica',
                description: 'Registra un gasto de logística asociado a una orden de importación (flete, aduana, almacenaje, etc.). Opcionalmente registra el egreso en una fuente de fondos.',
                input_schema: {
                    type: 'object',
                    properties: {
                        numero_orden: { type: 'string', description: 'Número de la orden de importación' },
                        descripcion: { type: 'string', description: 'Descripción del gasto (ej. Flete marítimo, Agente aduanas)' },
                        monto: { type: 'number', description: 'Monto del gasto en la moneda indicada' },
                        moneda_codigo: { type: 'string', description: 'Código ISO de la moneda (ej. USD, BOB)' },
                        tipo_cambio: { type: 'number', description: 'Tipo de cambio a moneda base (default: 1)' },
                        pais: { type: 'string', description: 'País donde se incurrió el gasto (opcional)' },
                        nombre_fuente: { type: 'string', description: 'Fuente de fondos de donde sale el pago (opcional)' },
                        fecha: { type: 'string', description: 'Fecha del gasto YYYY-MM-DD (default: hoy)' },
                        comprobante: { type: 'string', description: 'Nro. de comprobante (opcional)' },
                    },
                    required: ['numero_orden', 'descripcion', 'monto', 'moneda_codigo'],
                },
            },
        ];
    }
    async ejecutar(nombre, input, clienteId, adminId) {
        switch (nombre) {
            case 'consultar_orden_importacion': return this.consultarOrden(input, clienteId);
            case 'registrar_pago_proveedor_importacion': return this.registrarPago(input, clienteId, adminId);
            case 'registrar_gasto_logistica': return this.registrarGasto(input, clienteId, adminId);
            default: return null;
        }
    }
    async consultarOrden(input, clienteId) {
        if (input.numero_orden) {
            const orden = await this.ordenRepo.findOne({
                where: { numero: input.numero_orden, clienteId, estado: constants_1.Status.ACTIVE },
            });
            if (!orden)
                return { error: `Orden "${input.numero_orden}" no encontrada` };
            const [items, pagos, gastos] = await Promise.all([
                this.itemRepo.find({ where: { ordenImportacionId: orden.id, clienteId, estado: constants_1.Status.ACTIVE } }),
                this.pagoRepo.find({ where: { ordenImportacionId: orden.id, clienteId, estado: constants_1.Status.ACTIVE } }),
                this.gastoRepo.find({ where: { ordenImportacionId: orden.id, clienteId, estado: constants_1.Status.ACTIVE } }),
            ]);
            const totalPagado = pagos.reduce((s, p) => s + Number(p.monto) * Number(p.tipoCambio), 0);
            const totalGastos = gastos.reduce((s, g) => s + Number(g.monto) * Number(g.tipoCambio), 0);
            return {
                numero: orden.numero,
                estado: orden.estadoOrden,
                paisOrigen: orden.paisOrigen,
                fechaOrden: orden.fechaOrden,
                fechaEstimadaLlegada: orden.fechaEstimadaLlegada || null,
                costoProductosBase: Number(orden.totalProductosMonedaBase || 0),
                costoGastosBase: Number(orden.totalGastosMonedaBase || 0),
                costoTotalBase: Number(orden.costoTotalMonedaBase || 0),
                totalPagadoProveedor: Number(totalPagado.toFixed(2)),
                totalGastosLogistica: Number(totalGastos.toFixed(2)),
                items: items.map(i => ({
                    producto: i.descripcionProducto,
                    cantidadUnidades: i.cantidadUnidades,
                    costoUnitario: Number(i.costoTotalUnitario || 0),
                    precioVenta: Number(i.precioVentaManual || i.precioVentaSugerido || 0),
                })),
                pagos: pagos.map(p => ({
                    monto: Number(p.monto), tipoCambio: Number(p.tipoCambio),
                    montoBase: Number(p.montoMonedaBase || 0),
                    fecha: p.fechaPago, metodo: p.metodoPago,
                })),
                gastosLogistica: gastos.map(g => ({
                    descripcion: g.descripcion, monto: Number(g.monto),
                    tipoCambio: Number(g.tipoCambio), montoBase: Number(g.montoMonedaBase || 0),
                    fecha: g.fechaGasto, pais: g.pais || '',
                })),
            };
        }
        const ordenes = await this.ordenRepo
            .createQueryBuilder('o')
            .where("o.cliente_id = :clienteId AND o._estado = :activo AND o.estado != 'BORRADOR'", {
            clienteId, activo: constants_1.Status.ACTIVE,
        })
            .orderBy('o._fecha_creacion', 'DESC')
            .limit(10)
            .getMany();
        return {
            ordenes: ordenes.map(o => ({
                numero: o.numero,
                estado: o.estadoOrden,
                paisOrigen: o.paisOrigen,
                fechaOrden: o.fechaOrden,
                costoTotal: Number(o.costoTotalMonedaBase || 0),
            })),
        };
    }
    async registrarPago(input, clienteId, adminId) {
        const orden = await this.ordenRepo.findOne({
            where: { numero: input.numero_orden, clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!orden)
            return { error: `Orden "${input.numero_orden}" no encontrada` };
        const moneda = await this.monedaRepo.findOne({
            where: { codigo: input.moneda_codigo.toUpperCase(), clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!moneda)
            return { error: `Moneda "${input.moneda_codigo}" no encontrada. Verifica el código ISO.` };
        const tipoCambio = Number(input.tipo_cambio || 1);
        const montoBase = Number(input.monto) * tipoCambio;
        const hoy = new Date().toISOString().split('T')[0];
        const pago = this.pagoRepo.create({
            clienteId,
            ordenImportacionId: orden.id,
            monedaId: moneda.id,
            monto: input.monto,
            tipoCambio,
            montoMonedaBase: montoBase,
            fechaPago: input.fecha || hoy,
            metodoPago: input.metodo_pago || 'TRANSFERENCIA',
            referencia: input.referencia || null,
            observaciones: input.observaciones || null,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: adminId,
        });
        await this.pagoRepo.save(pago);
        if (input.nombre_fuente) {
            await this.registrarEgresoFuente(input.nombre_fuente, clienteId, adminId, montoBase, `Pago proveedor - Orden ${orden.numero}`, 'PAGO_PROVEEDOR', input.referencia || null, input.fecha || hoy);
        }
        return {
            exito: true,
            orden: orden.numero,
            monto: Number(input.monto),
            moneda: moneda.codigo,
            montoBase: Number(montoBase.toFixed(2)),
            mensaje: `Pago de ${input.monto} ${moneda.codigo} registrado en orden ${orden.numero}.${input.nombre_fuente ? ` Egreso registrado en fuente.` : ''}`,
        };
    }
    async registrarGasto(input, clienteId, adminId) {
        const orden = await this.ordenRepo.findOne({
            where: { numero: input.numero_orden, clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!orden)
            return { error: `Orden "${input.numero_orden}" no encontrada` };
        const moneda = await this.monedaRepo.findOne({
            where: { codigo: input.moneda_codigo.toUpperCase(), clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!moneda)
            return { error: `Moneda "${input.moneda_codigo}" no encontrada. Verifica el código ISO.` };
        const tipoCambio = Number(input.tipo_cambio || 1);
        const montoBase = Number(input.monto) * tipoCambio;
        const hoy = new Date().toISOString().split('T')[0];
        const gasto = this.gastoRepo.create({
            clienteId,
            ordenImportacionId: orden.id,
            descripcion: input.descripcion,
            monedaId: moneda.id,
            monto: input.monto,
            tipoCambio,
            montoMonedaBase: montoBase,
            fechaGasto: input.fecha || hoy,
            pais: input.pais || null,
            comprobante: input.comprobante || null,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: adminId,
        });
        await this.gastoRepo.save(gasto);
        if (input.nombre_fuente) {
            await this.registrarEgresoFuente(input.nombre_fuente, clienteId, adminId, montoBase, `Gasto logística - Orden ${orden.numero}: ${input.descripcion}`, 'GASTO_LOGISTICA', input.comprobante || null, input.fecha || hoy);
        }
        return {
            exito: true,
            orden: orden.numero,
            descripcion: input.descripcion,
            monto: Number(input.monto),
            moneda: moneda.codigo,
            montoBase: Number(montoBase.toFixed(2)),
            mensaje: `Gasto de logística de ${input.monto} ${moneda.codigo} registrado en orden ${orden.numero}.`,
        };
    }
    async registrarEgresoFuente(nombreFuente, clienteId, adminId, monto, concepto, categoria, referencia, fecha) {
        const fuentes = await this.fuenteRepo.find({ where: { clienteId, estado: constants_1.Status.ACTIVE } });
        const fuente = fuentes.find(f => f.nombre.toLowerCase().includes(nombreFuente.toLowerCase()));
        if (!fuente)
            return;
        await this.movFuenteRepo.save(this.movFuenteRepo.create({
            clienteId, fuenteId: fuente.id,
            tipo: 'EGRESO', concepto, referencia, categoria,
            monto, tipoCambio: 1, montoNativo: monto, fecha,
            estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: adminId,
        }));
    }
};
AdminGerenteLogisticaService = AdminGerenteLogisticaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(orden_importacion_entity_1.OrdenImportacion)),
    __param(1, (0, typeorm_1.InjectRepository)(item_orden_importacion_entity_1.ItemOrdenImportacion)),
    __param(2, (0, typeorm_1.InjectRepository)(pago_proveedor_importacion_entity_1.PagoProveedorImportacion)),
    __param(3, (0, typeorm_1.InjectRepository)(gasto_logistica_entity_1.GastoLogistica)),
    __param(4, (0, typeorm_1.InjectRepository)(moneda_entity_1.Moneda)),
    __param(5, (0, typeorm_1.InjectRepository)(fuente_entity_1.Fuente)),
    __param(6, (0, typeorm_1.InjectRepository)(movimiento_fuente_entity_1.MovimientoFuente)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminGerenteLogisticaService);
exports.AdminGerenteLogisticaService = AdminGerenteLogisticaService;
//# sourceMappingURL=admin-gerente-logistica.service.js.map