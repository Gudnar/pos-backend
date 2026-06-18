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
exports.LotesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lote_entity_1 = require("../entity/lote.entity");
const movimiento_stock_entity_1 = require("../../movimientos-stock/entity/movimiento-stock.entity");
const producto_entity_1 = require("../../productos/entity/producto.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let LotesService = class LotesService {
    constructor(loteRepo, movRepo, productoRepo, ds) {
        this.loteRepo = loteRepo;
        this.movRepo = movRepo;
        this.productoRepo = productoRepo;
        this.ds = ds;
    }
    async stockResumen(clienteId, sucursalId) {
        const qb = this.loteRepo
            .createQueryBuilder('l')
            .select('l.producto_id', 'productoId')
            .addSelect('l.sucursal_id', 'sucursalId')
            .addSelect('SUM(l.cantidad_actual)', 'stockTotal')
            .addSelect('COUNT(l.id)', 'nroLotes')
            .addSelect('MIN(l.fecha_vencimiento)', 'proximoVencimiento')
            .where('l.cliente_id = :clienteId AND l.estado_lote = :estadoLote AND l._estado = :dbEstado', { clienteId, estadoLote: lote_entity_1.EstadoLote.ACTIVO, dbEstado: constants_1.Status.ACTIVE });
        if (sucursalId)
            qb.andWhere('l.sucursal_id = :sucursalId', { sucursalId });
        qb.groupBy('l.producto_id, l.sucursal_id');
        const rows = await qb.getRawMany();
        if (!rows.length)
            return [];
        const productoIds = rows.map(r => r.productoId);
        const productos = await this.productoRepo
            .createQueryBuilder('p')
            .where('p.id IN (:...ids) AND p._estado = :est', { ids: productoIds, est: constants_1.Status.ACTIVE })
            .getMany();
        const prodMap = new Map(productos.map(p => [p.id, p]));
        const subcategoriaIds = [...new Set(productos.map(p => p.subcategoriaId).filter(Boolean))];
        let subMap = new Map();
        let catMap = new Map();
        if (subcategoriaIds.length) {
            const schema = process.env.DB_SCHEMA || 'public';
            const subs = await this.productoRepo.manager.query(`SELECT id, nombre, categoria_id AS "categoriaId" FROM ${schema}.subcategoria_producto WHERE id = ANY($1)`, [subcategoriaIds]);
            subMap = new Map(subs.map(s => [s.id, { nombre: s.nombre, categoriaId: s.categoriaId }]));
            const categoriaIds = [...new Set(subs.map(s => s.categoriaId).filter(Boolean))];
            if (categoriaIds.length) {
                const cats = await this.productoRepo.manager.query(`SELECT id, nombre FROM ${schema}.categoria_producto WHERE id = ANY($1)`, [categoriaIds]);
                catMap = new Map(cats.map(c => [c.id, c.nombre]));
            }
        }
        return rows.map(r => {
            const prod = prodMap.get(r.productoId);
            const sub = subMap.get(prod?.subcategoriaId);
            return {
                productoId: r.productoId,
                sucursalId: r.sucursalId,
                nombre: prod?.nombre || '',
                categoriaNombre: sub ? (catMap.get(sub.categoriaId) || '') : '',
                subcategoriaNombre: sub?.nombre || '',
                codigo: prod?.codigoTienda || prod?.codigoBarras || '',
                requiereLote: prod?.requiereLote || false,
                metodoPicking: prod?.metodoPicking || 'FEFO',
                unidadNombre: '',
                stockTotal: Number(r.stockTotal) || 0,
                nroLotes: Number(r.nroLotes),
                proximoVencimiento: r.proximoVencimiento || null,
            };
        });
    }
    async listarPorProducto(clienteId, sucursalId, productoId) {
        const where = { clienteId, productoId, estado: constants_1.Status.ACTIVE };
        if (sucursalId)
            where.sucursalId = sucursalId;
        return this.loteRepo.find({ where, order: { fechaVencimiento: 'ASC', fechaIngreso: 'ASC' } });
    }
    async obtener(clienteId, id) {
        const l = await this.loteRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!l)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return l;
    }
    async trazabilidad(clienteId, id) {
        const lote = await this.obtener(clienteId, id);
        const movimientos = await this.movRepo.find({
            where: { clienteId, loteId: id, estado: constants_1.Status.ACTIVE },
            order: { fechaCreacion: 'ASC' },
        });
        return { lote, movimientos };
    }
    async ingresar(clienteId, dto, usuarioId) {
        const producto = await this.productoRepo.findOne({
            where: { id: dto.productoId, clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!producto)
            throw new common_1.NotFoundException('Producto no encontrado');
        const hoy = new Date().toISOString().split('T')[0];
        const loteInterno = `L-${Date.now()}`;
        const lote = await this.loteRepo.save(this.loteRepo.create({
            clienteId,
            sucursalId: dto.sucursalId,
            productoId: dto.productoId,
            nroLote: dto.nroLote,
            nroSerie: dto.nroSerie,
            loteInterno,
            fechaFabricacion: dto.fechaFabricacion,
            fechaVencimiento: dto.fechaVencimiento || null,
            fechaVencimientoGarantia: dto.fechaVencimientoGarantia || null,
            fechaIngreso: hoy,
            proveedorId: dto.proveedorId,
            nroFacturaProveedor: dto.nroFacturaProveedor,
            nroPedidoCompra: dto.nroPedidoCompra,
            nroRemision: dto.nroRemision,
            paisOrigen: dto.paisOrigen,
            certificadoCalidad: dto.certificadoCalidad,
            cantidadInicial: dto.cantidad,
            cantidadActual: dto.cantidad,
            unidadId: dto.unidadId,
            notas: dto.notas,
            estadoLote: lote_entity_1.EstadoLote.ACTIVO,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: usuarioId,
        }));
        await this.movRepo.save(this.movRepo.create({
            clienteId,
            sucursalId: dto.sucursalId,
            productoId: dto.productoId,
            loteId: lote.id,
            unidadId: dto.unidadId,
            tipo: movimiento_stock_entity_1.TipoMovimiento.INGRESO,
            cantidad: dto.cantidad,
            cantidadAnterior: 0,
            cantidadPosterior: dto.cantidad,
            referenciaDocumento: dto.referenciaDocumento,
            tipoDocumento: 'INGRESO',
            usuarioId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: usuarioId,
        }));
        return lote;
    }
    async cambiarEstado(clienteId, id, dto, usuarioModificacion) {
        const lote = await this.obtener(clienteId, id);
        Object.assign(lote, {
            estadoLote: dto.estadoLote,
            motivoCuarentena: dto.motivoCuarentena || null,
            transaccion: constants_1.Transacccion.ACTUALIZAR,
            usuarioModificacion,
        });
        return this.loteRepo.save(lote);
    }
    async listarTodos(clienteId, opts) {
        const schema = process.env.DB_SCHEMA || 'public';
        const params = [clienteId, constants_1.Status.ACTIVE];
        let idx = 3;
        const conds = [];
        if (opts.sucursalId) {
            conds.push(`l.sucursal_id = $${idx++}`);
            params.push(opts.sucursalId);
        }
        if (opts.estadoLote) {
            conds.push(`l.estado_lote = $${idx++}`);
            params.push(opts.estadoLote);
        }
        if (opts.search) {
            conds.push(`(p.nombre ILIKE $${idx} OR l.nro_lote ILIKE $${idx} OR l.lote_interno ILIKE $${idx})`);
            params.push(`%${opts.search}%`);
            idx++;
        }
        const where = conds.length ? ' AND ' + conds.join(' AND ') : '';
        const sql = `
      SELECT l.id, l.nro_lote AS "nroLote", l.lote_interno AS "loteInterno",
             l.fecha_ingreso AS "fechaIngreso", l.fecha_vencimiento AS "fechaVencimiento",
             l.cantidad_inicial AS "cantidadInicial", l.cantidad_actual AS "cantidadActual",
             l.estado_lote AS "estadoLote", l.sucursal_id AS "sucursalId", l.producto_id AS "productoId",
             p.nombre AS "productoNombre", p.codigo_tienda AS "codigo",
             l.notas
      FROM ${schema}.lote l
      LEFT JOIN ${schema}.producto p ON p.id = l.producto_id
      WHERE l.cliente_id = $1 AND l._estado = $2
      ${where}
      ORDER BY l._fecha_creacion DESC
      LIMIT 500`;
        return this.ds.query(sql, params);
    }
    async reporteGeneral(clienteId, opts) {
        const schema = process.env.DB_SCHEMA || 'public';
        const params = [clienteId, constants_1.Status.ACTIVE, lote_entity_1.EstadoLote.ACTIVO];
        let sucursalCond = '';
        if (opts.sucursalId) {
            sucursalCond = `AND l.sucursal_id = $4`;
            params.push(opts.sucursalId);
        }
        const sql = `
      SELECT l.producto_id AS "productoId", l.sucursal_id AS "sucursalId",
             p.nombre AS "productoNombre", p.codigo_tienda AS "codigo",
             (SELECT pp.precio FROM ${schema}.precio_producto pp
              WHERE pp.producto_id = l.producto_id AND pp.tipo = 'COMPRA' AND pp.activo = true AND pp._estado = $2
              ORDER BY pp._fecha_creacion DESC LIMIT 1) AS "precioCosto",
             SUM(l.cantidad_actual) AS "stockTotal",
             COUNT(l.id) AS "nroLotes",
             MIN(l.fecha_vencimiento) AS "proximoVencimiento"
      FROM ${schema}.lote l
      LEFT JOIN ${schema}.producto p ON p.id = l.producto_id
      WHERE l.cliente_id = $1 AND l._estado = $2 AND l.estado_lote = $3
      ${sucursalCond}
      GROUP BY l.producto_id, l.sucursal_id, p.nombre, p.codigo_tienda
      ORDER BY p.nombre ASC`;
        return this.ds.query(sql, params);
    }
    async historialPrecios(clienteId, opts) {
        const schema = process.env.DB_SCHEMA || 'public';
        const params = [clienteId, constants_1.Status.ACTIVE];
        let prodCond = '';
        if (opts.productoId) {
            prodCond = `AND pp.producto_id = $3`;
            params.push(opts.productoId);
        }
        const sql = `
      SELECT pp.id, pp.tipo, pp.precio, pp.moneda, pp.fecha_vigencia AS "fechaVigencia",
             pp.fecha_fin AS "fechaFin", pp.activo, pp._fecha_creacion AS "fechaCreacion",
             pp.producto_id AS "productoId",
             p.nombre AS "productoNombre", p.codigo_tienda AS "codigo"
      FROM ${schema}.precio_producto pp
      LEFT JOIN ${schema}.producto p ON p.id = pp.producto_id
      WHERE pp.cliente_id = $1 AND pp._estado = $2
      ${prodCond}
      ORDER BY pp._fecha_creacion DESC
      LIMIT 300`;
        return this.ds.query(sql, params);
    }
    async marcarVencidos() {
        const hoy = new Date().toISOString().split('T')[0];
        await this.loteRepo
            .createQueryBuilder()
            .update(lote_entity_1.Lote)
            .set({ estadoLote: lote_entity_1.EstadoLote.VENCIDO })
            .where('fecha_vencimiento IS NOT NULL AND fecha_vencimiento < :hoy AND estado_lote = :activo AND _estado = :dbEstado', { hoy, activo: lote_entity_1.EstadoLote.ACTIVO, dbEstado: constants_1.Status.ACTIVE })
            .execute();
    }
    async proximosAVencer(clienteId, sucursalId) {
        const qb = this.loteRepo
            .createQueryBuilder('l')
            .innerJoin(producto_entity_1.Producto, 'p', 'p.id = l.producto_id')
            .select([
            'l.id AS "loteId"', 'l.nro_lote AS "nroLote"', 'l.fecha_vencimiento AS "fechaVencimiento"',
            'l.cantidad_actual AS "cantidadActual"', 'l.sucursal_id AS "sucursalId"',
            'l.producto_id AS "productoId"',
            'p.nombre AS "productoNombre"',
            `(l.fecha_vencimiento::date - CURRENT_DATE) AS "diasRestantes"`,
        ])
            .where(`l.cliente_id = :clienteId AND l.estado_lote = :activo AND l._estado = :dbEstado
         AND l.fecha_vencimiento IS NOT NULL
         AND l.fecha_vencimiento::date <= (CURRENT_DATE + (p.alerta_vencimiento_dias || ' days')::interval)`, { clienteId, activo: lote_entity_1.EstadoLote.ACTIVO, dbEstado: constants_1.Status.ACTIVE })
            .orderBy('"diasRestantes"', 'ASC');
        if (sucursalId)
            qb.andWhere('l.sucursal_id = :sucursalId', { sucursalId });
        return qb.getRawMany();
    }
};
LotesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lote_entity_1.Lote)),
    __param(1, (0, typeorm_1.InjectRepository)(movimiento_stock_entity_1.MovimientoStock)),
    __param(2, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], LotesService);
exports.LotesService = LotesService;
//# sourceMappingURL=lotes.service.js.map