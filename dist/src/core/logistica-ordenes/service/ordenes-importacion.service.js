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
exports.OrdenesImportacionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const orden_importacion_entity_1 = require("../entity/orden-importacion.entity");
const item_orden_importacion_entity_1 = require("../entity/item-orden-importacion.entity");
const pago_proveedor_importacion_entity_1 = require("../entity/pago-proveedor-importacion.entity");
const gasto_logistica_entity_1 = require("../entity/gasto-logistica.entity");
const precio_producto_entity_1 = require("../../productos/entity/precio-producto.entity");
const lotes_service_1 = require("../../lotes/service/lotes.service");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
function aplicarRedondeo(precio, redondeo) {
    if (!redondeo || redondeo.tipo === 'ninguno')
        return precio;
    if (redondeo.tipo === 'entero')
        return Math.ceil(precio);
    if (redondeo.tipo === 'multiplo' && redondeo.multiplo)
        return Math.ceil(precio / redondeo.multiplo) * redondeo.multiplo;
    return precio;
}
function aplicarFormula(base, formula) {
    let precio = base;
    for (const paso of formula.pasos) {
        switch (paso.operacion) {
            case 'multiplicar':
                precio = precio * paso.valor;
                break;
            case 'dividir':
                precio = paso.valor !== 0 ? precio / paso.valor : precio;
                break;
            case 'sumar':
                precio = precio + paso.valor;
                break;
            case 'restar':
                precio = precio - paso.valor;
                break;
        }
    }
    if (formula.redondeo) {
        if (formula.redondeo.tipo === 'entero') {
            precio = Math.ceil(precio);
        }
        else if (formula.redondeo.tipo === 'multiplo' && formula.redondeo.multiplo) {
            precio = Math.ceil(precio / formula.redondeo.multiplo) * formula.redondeo.multiplo;
        }
    }
    return Math.max(0, precio);
}
let OrdenesImportacionService = class OrdenesImportacionService {
    constructor(ordenRepo, itemRepo, pagoRepo, gastoRepo, precioRepo, lotesSvc) {
        this.ordenRepo = ordenRepo;
        this.itemRepo = itemRepo;
        this.pagoRepo = pagoRepo;
        this.gastoRepo = gastoRepo;
        this.precioRepo = precioRepo;
        this.lotesSvc = lotesSvc;
    }
    async listar(clienteId, q) {
        const qb = this.ordenRepo
            .createQueryBuilder('o')
            .where('o.cliente_id = :clienteId AND o._estado = :estado', { clienteId, estado: constants_1.Status.ACTIVE })
            .orderBy('o.fecha_orden', 'DESC');
        if (q && q.trim()) {
            qb.andWhere('(LOWER(o.numero) LIKE LOWER(:q) OR LOWER(o.pais_origen) LIKE LOWER(:q))', { q: `%${q.trim()}%` });
        }
        return qb.getMany();
    }
    async obtener(clienteId, id) {
        const o = await this.ordenRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!o)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return o;
    }
    async obtenerDetalle(clienteId, id) {
        const orden = await this.obtener(clienteId, id);
        const [items, pagos, gastos] = await Promise.all([
            this.itemRepo.find({ where: { ordenImportacionId: id, clienteId, estado: constants_1.Status.ACTIVE } }),
            this.pagoRepo.find({ where: { ordenImportacionId: id, clienteId, estado: constants_1.Status.ACTIVE } }),
            this.gastoRepo.find({ where: { ordenImportacionId: id, clienteId, estado: constants_1.Status.ACTIVE } }),
        ]);
        return { ...orden, items, pagos, gastos };
    }
    async generarNumero(clienteId) {
        const anio = new Date().getFullYear();
        const count = await this.ordenRepo.count({ where: { clienteId, estado: constants_1.Status.ACTIVE } });
        return `IMP-${anio}-${String(count + 1).padStart(3, '0')}`;
    }
    async crear(clienteId, dto, usuarioCreacion) {
        const numero = dto.numero?.trim() || await this.generarNumero(clienteId);
        return this.ordenRepo.save(this.ordenRepo.create({
            ...dto,
            numero,
            clienteId,
            metodoDistribucion: dto.metodoDistribucion ?? 'POR_VALOR',
            estadoOrden: 'BORRADOR',
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
    }
    async actualizar(clienteId, id, dto, usuarioModificacion) {
        const o = await this.obtener(clienteId, id);
        if (o.estadoOrden === 'CERRADO')
            throw new common_1.BadRequestException('No se puede modificar una orden cerrada.');
        Object.assign(o, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.ordenRepo.save(o);
    }
    async eliminar(clienteId, id, usuarioModificacion) {
        const o = await this.obtener(clienteId, id);
        if (o.estadoOrden !== 'BORRADOR')
            throw new common_1.BadRequestException('Solo se pueden eliminar órdenes en estado BORRADOR.');
        Object.assign(o, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.ordenRepo.save(o);
    }
    async calcularCostos(clienteId, id, usuarioModificacion) {
        const orden = await this.obtener(clienteId, id);
        const items = await this.itemRepo.find({ where: { ordenImportacionId: id, clienteId, estado: constants_1.Status.ACTIVE } });
        const gastos = await this.gastoRepo.find({ where: { ordenImportacionId: id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!items.length)
            throw new common_1.BadRequestException('La orden no tiene productos registrados.');
        for (const item of items) {
            const tc = Number(item.tipoCambio);
            const pUnitCompra = Number(item.precioUnitarioMonedaCompra);
            const cant = Number(item.cantidadUnidades);
            item.precioUnitarioMonedaBase = pUnitCompra * tc;
            item.subtotalMonedaCompra = pUnitCompra * cant;
            item.subtotalMonedaBase = item.precioUnitarioMonedaBase * cant;
        }
        const totalProductosMonedaCompra = items.reduce((s, i) => s + Number(i.subtotalMonedaCompra), 0);
        const totalProductosMonedaBase = items.reduce((s, i) => s + Number(i.subtotalMonedaBase), 0);
        const totalGastosMonedaBase = gastos.reduce((s, g) => s + Number(g.monto) * Number(g.tipoCambio), 0);
        const costoTotalMonedaBase = totalProductosMonedaBase + totalGastosMonedaBase;
        const unidadesTotales = items.reduce((s, i) => s + Number(i.cantidadUnidades), 0);
        for (const item of items) {
            let factor;
            if (orden.metodoDistribucion === 'POR_CANTIDAD') {
                factor = unidadesTotales > 0 ? Number(item.cantidadUnidades) / unidadesTotales : 0;
            }
            else {
                factor = totalProductosMonedaBase > 0 ? Number(item.subtotalMonedaBase) / totalProductosMonedaBase : 0;
            }
            item.costoLogisticaAsignado = totalGastosMonedaBase * factor;
            const costoTotalItem = Number(item.subtotalMonedaBase) + item.costoLogisticaAsignado;
            item.costoTotalUnitario = Number(item.cantidadUnidades) > 0 ? costoTotalItem / Number(item.cantidadUnidades) : 0;
            Object.assign(item, { transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        }
        for (const g of gastos) {
            g.montoMonedaBase = Number(g.monto) * Number(g.tipoCambio);
            Object.assign(g, { transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        }
        await this.itemRepo.save(items);
        await this.gastoRepo.save(gastos);
        Object.assign(orden, {
            totalProductosMonedaCompra,
            totalProductosMonedaBase,
            totalGastosMonedaBase,
            costoTotalMonedaBase,
            unidadesTotales,
            transaccion: constants_1.Transacccion.ACTUALIZAR,
            usuarioModificacion,
        });
        await this.ordenRepo.save(orden);
        return { orden, items, gastos };
    }
    async cerrarOrden(clienteId, id, dto, usuarioModificacion) {
        const resultado = await this.calcularCostos(clienteId, id, usuarioModificacion);
        const { orden, items, gastos } = resultado;
        const gastosParaPrecio = (dto.gastosParaPrecio?.length)
            ? gastos.filter(g => dto.gastosParaPrecio.includes(g.id))
            : gastos;
        const tcPrecioMap = new Map();
        for (const g of gastos) {
            const override = dto.tiposCambioOverride?.find(o => o.gastoId === g.id);
            tcPrecioMap.set(g.id, override ? Number(override.tipoCambio) : Number(g.tipoCambio));
        }
        const totalGastosPrecioBase = gastosParaPrecio.reduce((s, g) => s + Number(g.monto) * (tcPrecioMap.get(g.id) ?? Number(g.tipoCambio)), 0);
        const totalProductosBase = items.reduce((s, i) => s + Number(i.subtotalMonedaBase ?? 0), 0);
        const unidadesTotales = items.reduce((s, i) => s + Number(i.cantidadUnidades), 0);
        const preciosPropuestos = [];
        for (const item of items) {
            if (!item.productoId || !item.costoTotalUnitario)
                continue;
            let factorPrecio;
            if (orden.metodoDistribucion === 'POR_CANTIDAD') {
                factorPrecio = unidadesTotales > 0 ? Number(item.cantidadUnidades) / unidadesTotales : 0;
            }
            else {
                factorPrecio = totalProductosBase > 0 ? Number(item.subtotalMonedaBase) / totalProductosBase : 0;
            }
            const gastoAsignadoPrecio = totalGastosPrecioBase * factorPrecio;
            const costoItemPrecio = Number(item.subtotalMonedaBase ?? 0) + gastoAsignadoPrecio;
            const costoUnitPrecio = Number(item.cantidadUnidades) > 0
                ? costoItemPrecio / Number(item.cantidadUnidades)
                : Number(item.costoTotalUnitario);
            let precioSugerido;
            let margen = 0;
            if (dto.formula) {
                const baseVal = dto.formula.base === 'costoProducto'
                    ? Number(item.precioUnitarioMonedaBase)
                    : costoUnitPrecio;
                precioSugerido = aplicarFormula(baseVal, dto.formula);
                margen = costoUnitPrecio > 0 ? ((precioSugerido / costoUnitPrecio) - 1) * 100 : 0;
            }
            else {
                margen = Number(dto.margenPorcentaje ?? 0);
                precioSugerido = costoUnitPrecio * (1 + margen / 100);
            }
            item.margenAplicado = margen;
            item.precioVentaSugerido = precioSugerido;
            Object.assign(item, { transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
            const gastosDesc = gastosParaPrecio.length < gastos.length
                ? ` | Gastos seleccionados: ${gastosParaPrecio.length}/${gastos.length}`
                : '';
            const tcDesc = dto.tiposCambioOverride?.length
                ? ` | TC overrides: ${dto.tiposCambioOverride.length}`
                : '';
            const notasPrecio = dto.formula
                ? `Costo precio: ${costoUnitPrecio.toFixed(4)}${gastosDesc}${tcDesc} | Fórmula: ${dto.formula.base} → ${dto.formula.pasos.map(p => `${p.operacion}(${p.valor})`).join(' → ')}${dto.formula.redondeo?.tipo !== 'ninguno' ? ` → redondeo(${dto.formula.redondeo?.tipo})` : ''}`
                : `Costo precio: ${costoUnitPrecio.toFixed(4)}${gastosDesc}${tcDesc} | Margen: ${margen.toFixed(2)}%`;
            let precio = await this.precioRepo.findOne({
                where: { productoId: item.productoId, clienteId, tipo: 'LOGISTICA', estado: constants_1.Status.ACTIVE },
            });
            if (precio) {
                Object.assign(precio, { precio: precioSugerido, notas: notasPrecio, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
            }
            else {
                precio = this.precioRepo.create({
                    productoId: item.productoId, clienteId, tipo: 'LOGISTICA',
                    precio: precioSugerido, moneda: 'BASE', cantidadMin: 1, activo: true,
                    notas: notasPrecio, estado: constants_1.Status.ACTIVE,
                    transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioModificacion,
                });
            }
            await this.precioRepo.save(precio);
            preciosPropuestos.push({
                productoId: item.productoId,
                costoContable: item.costoTotalUnitario,
                costoParaPrecio: costoUnitPrecio,
                margen,
                precioSugerido,
            });
        }
        await this.itemRepo.save(items);
        Object.assign(orden, { estadoOrden: 'CERRADO', transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        await this.ordenRepo.save(orden);
        const lotesCreados = [];
        if (dto.ingresarInventario && dto.sucursalId) {
            for (const item of items) {
                if (!item.productoId || !item.cantidadUnidades)
                    continue;
                const lote = await this.lotesSvc.ingresar(orden.clienteId, {
                    productoId: item.productoId,
                    sucursalId: dto.sucursalId,
                    cantidad: Number(item.cantidadUnidades),
                    nroLote: orden.numero,
                    proveedorId: orden.proveedorId,
                    paisOrigen: orden.paisOrigen,
                    nroPedidoCompra: orden.numero,
                    referenciaDocumento: orden.numero,
                    notas: `Ingreso desde orden de importación ${orden.numero}`,
                }, usuarioModificacion);
                lotesCreados.push({ productoId: item.productoId, loteId: lote.id, cantidad: item.cantidadUnidades });
            }
        }
        return { orden, items, preciosPropuestos, lotesCreados };
    }
    async proponerPrecios(clienteId, id, dto, usuarioModificacion) {
        const orden = await this.obtener(clienteId, id);
        const items = await this.itemRepo.find({ where: { ordenImportacionId: id, clienteId, estado: constants_1.Status.ACTIVE } });
        const gastos = await this.gastoRepo.find({ where: { ordenImportacionId: id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!items.length)
            throw new common_1.BadRequestException('La orden no tiene productos registrados.');
        const gastosActivos = dto.gastosParaPrecio?.length
            ? gastos.filter(g => dto.gastosParaPrecio.includes(g.id))
            : gastos;
        const tcMap = new Map();
        for (const g of gastos) {
            const ov = dto.tiposCambioOverride?.find(o => o.gastoId === g.id);
            tcMap.set(g.id, ov ? Number(ov.tipoCambio) : Number(g.tipoCambio));
        }
        const totalGastosPrecioBase = gastosActivos.reduce((s, g) => s + Number(g.monto) * (tcMap.get(g.id) ?? Number(g.tipoCambio)), 0);
        const totalProductosBase = items.reduce((s, i) => s + Number(i.subtotalMonedaBase ?? 0), 0);
        const unidadesTotales = items.reduce((s, i) => s + Number(i.cantidadUnidades), 0);
        const preciosPropuestos = [];
        for (const item of items) {
            if (!item.productoId)
                continue;
            let factor;
            if (orden.metodoDistribucion === 'POR_CANTIDAD') {
                factor = unidadesTotales > 0 ? Number(item.cantidadUnidades) / unidadesTotales : 0;
            }
            else {
                factor = totalProductosBase > 0 ? Number(item.subtotalMonedaBase ?? 0) / totalProductosBase : 0;
            }
            const logUnit = Number(item.cantidadUnidades) > 0
                ? (totalGastosPrecioBase * factor) / Number(item.cantidadUnidades) : 0;
            const compraUnit = Number(item.precioUnitarioMonedaBase ?? 0);
            const aplicarComponente = (base, comp) => base * Number(comp.multiplicador) + Number(comp.sumarFijo ?? 0);
            let precio = aplicarComponente(compraUnit, dto.componenteCompra)
                + aplicarComponente(logUnit, dto.componenteLogistica)
                + Number(dto.ajusteFijo ?? 0);
            precio = aplicarRedondeo(Math.max(0, precio), dto.redondeo);
            let precioReg = await this.precioRepo.findOne({
                where: { productoId: item.productoId, clienteId, tipo: 'LOGISTICA', estado: constants_1.Status.ACTIVE },
            });
            const notas = `CompraUnit:${compraUnit.toFixed(4)}×${dto.componenteCompra.multiplicador} | LogUnit:${logUnit.toFixed(4)}×${dto.componenteLogistica.multiplicador} | Gastos:${gastosActivos.length}/${gastos.length} | Ajuste:${dto.ajusteFijo ?? 0}`;
            if (precioReg) {
                Object.assign(precioReg, { precio, notas, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
            }
            else {
                precioReg = this.precioRepo.create({
                    productoId: item.productoId, clienteId, tipo: 'LOGISTICA',
                    precio, moneda: 'BASE', cantidadMin: 1, activo: true, notas,
                    estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioModificacion,
                });
            }
            await this.precioRepo.save(precioReg);
            preciosPropuestos.push({
                productoId: item.productoId,
                descripcion: item.descripcionProducto,
                compraUnit,
                logUnit,
                precio,
            });
        }
        return {
            totalGastosPrecioBase,
            totalProductosBase,
            gastosIncluidos: gastosActivos.length,
            totalGastos: gastos.length,
            preciosPropuestos,
        };
    }
    async trazabilidad(clienteId, id) {
        const orden = await this.obtener(clienteId, id);
        const [items, pagos, gastos] = await Promise.all([
            this.itemRepo.find({ where: { ordenImportacionId: id, clienteId, estado: constants_1.Status.ACTIVE } }),
            this.pagoRepo.find({ where: { ordenImportacionId: id, clienteId, estado: constants_1.Status.ACTIVE } }),
            this.gastoRepo.find({ where: { ordenImportacionId: id, clienteId, estado: constants_1.Status.ACTIVE } }),
        ]);
        const totalPagosMonedaBase = pagos.reduce((s, p) => s + Number(p.monto) * Number(p.tipoCambio), 0);
        const totalGastosMonedaBase = gastos.reduce((s, g) => s + Number(g.monto) * Number(g.tipoCambio), 0);
        const totalProductosMonedaBase = items.reduce((s, i) => s + Number(i.subtotalMonedaBase ?? 0), 0);
        return {
            orden,
            resumen: {
                totalPagosMonedaBase,
                totalGastosMonedaBase,
                totalProductosMonedaBase,
                costoTotalMonedaBase: totalProductosMonedaBase + totalGastosMonedaBase,
                unidadesTotales: items.reduce((s, i) => s + Number(i.cantidadUnidades), 0),
            },
            pagos: pagos.map(p => ({
                ...p,
                montoMonedaBase: Number(p.monto) * Number(p.tipoCambio),
            })),
            gastos: gastos.map(g => ({
                ...g,
                montoMonedaBase: Number(g.monto) * Number(g.tipoCambio),
            })),
            items: items.map(i => ({
                ...i,
                costoLogisticaAsignado: i.costoLogisticaAsignado ?? null,
                costoTotalUnitario: i.costoTotalUnitario ?? null,
                precioVentaSugerido: i.precioVentaSugerido ?? null,
            })),
        };
    }
};
OrdenesImportacionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(orden_importacion_entity_1.OrdenImportacion)),
    __param(1, (0, typeorm_1.InjectRepository)(item_orden_importacion_entity_1.ItemOrdenImportacion)),
    __param(2, (0, typeorm_1.InjectRepository)(pago_proveedor_importacion_entity_1.PagoProveedorImportacion)),
    __param(3, (0, typeorm_1.InjectRepository)(gasto_logistica_entity_1.GastoLogistica)),
    __param(4, (0, typeorm_1.InjectRepository)(precio_producto_entity_1.PrecioProducto)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        lotes_service_1.LotesService])
], OrdenesImportacionService);
exports.OrdenesImportacionService = OrdenesImportacionService;
//# sourceMappingURL=ordenes-importacion.service.js.map