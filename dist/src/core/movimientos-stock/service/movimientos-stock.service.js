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
exports.MovimientosStockService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const movimiento_stock_entity_1 = require("../entity/movimiento-stock.entity");
const lote_entity_1 = require("../../lotes/entity/lote.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let MovimientosStockService = class MovimientosStockService {
    constructor(movRepo, loteRepo, ds) {
        this.movRepo = movRepo;
        this.loteRepo = loteRepo;
        this.ds = ds;
    }
    async listarPorSucursal(clienteId, sucursalId, productoId) {
        const where = { clienteId, estado: constants_1.Status.ACTIVE };
        if (sucursalId)
            where.sucursalId = sucursalId;
        if (productoId)
            where.productoId = productoId;
        return this.movRepo.find({ where, order: { fechaCreacion: 'DESC' }, take: 100 });
    }
    async registrar(clienteId, dto, usuarioId) {
        const lote = await this.loteRepo.findOne({
            where: { id: dto.loteId, clienteId, sucursalId: dto.sucursalId, estado: constants_1.Status.ACTIVE },
        });
        if (!lote)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        if (lote.estadoLote === lote_entity_1.EstadoLote.CUARENTENA) {
            throw new common_1.BadRequestException('El lote está en cuarentena y no se puede mover');
        }
        if (lote.estadoLote === lote_entity_1.EstadoLote.RETIRADO || lote.estadoLote === lote_entity_1.EstadoLote.VENCIDO) {
            throw new common_1.BadRequestException(`El lote tiene estado ${lote.estadoLote} y no se puede operar`);
        }
        const esSalida = ['SALIDA', 'AJUSTE_NEGATIVO', 'RETIRO', 'DEVOLUCION_PROVEEDOR'].includes(dto.tipo);
        if (esSalida && dto.cantidad > Number(lote.cantidadActual)) {
            throw new common_1.BadRequestException(`Stock insuficiente. Disponible: ${lote.cantidadActual}, solicitado: ${dto.cantidad}`);
        }
        const cantidadAnterior = Number(lote.cantidadActual);
        const cantidadPosterior = esSalida
            ? cantidadAnterior - dto.cantidad
            : cantidadAnterior + dto.cantidad;
        lote.cantidadActual = cantidadPosterior;
        if (cantidadPosterior <= 0)
            lote.estadoLote = lote_entity_1.EstadoLote.AGOTADO;
        Object.assign(lote, { transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion: usuarioId });
        await this.loteRepo.save(lote);
        return this.movRepo.save(this.movRepo.create({
            clienteId,
            sucursalId: dto.sucursalId,
            productoId: lote.productoId,
            loteId: dto.loteId,
            unidadId: dto.unidadId,
            tipo: dto.tipo,
            cantidad: dto.cantidad,
            cantidadAnterior,
            cantidadPosterior,
            motivo: dto.motivo,
            referenciaDocumento: dto.referenciaDocumento,
            tipoDocumento: dto.tipoDocumento,
            usuarioId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: usuarioId,
        }));
    }
    async transferir(clienteId, dto, usuarioId) {
        const loteOrigen = await this.loteRepo.findOne({
            where: { id: dto.loteId, clienteId, sucursalId: dto.sucursalOrigenId, estado: constants_1.Status.ACTIVE },
        });
        if (!loteOrigen)
            throw new common_1.NotFoundException('Lote de origen no encontrado');
        if (dto.cantidad > Number(loteOrigen.cantidadActual)) {
            throw new common_1.BadRequestException(`Stock insuficiente. Disponible: ${loteOrigen.cantidadActual}, solicitado: ${dto.cantidad}`);
        }
        const cantAntOrigen = Number(loteOrigen.cantidadActual);
        loteOrigen.cantidadActual = cantAntOrigen - dto.cantidad;
        if (loteOrigen.cantidadActual <= 0)
            loteOrigen.estadoLote = lote_entity_1.EstadoLote.AGOTADO;
        Object.assign(loteOrigen, { transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion: usuarioId });
        await this.loteRepo.save(loteOrigen);
        const hoy = new Date().toISOString().split('T')[0];
        const loteDestino = await this.loteRepo.save(this.loteRepo.create({
            clienteId,
            sucursalId: dto.sucursalDestinoId,
            productoId: loteOrigen.productoId,
            nroLote: loteOrigen.nroLote,
            nroSerie: loteOrigen.nroSerie,
            loteInterno: `${loteOrigen.loteInterno}-TRANSF`,
            fechaFabricacion: loteOrigen.fechaFabricacion,
            fechaVencimiento: loteOrigen.fechaVencimiento,
            fechaIngreso: hoy,
            cantidadInicial: dto.cantidad,
            cantidadActual: dto.cantidad,
            unidadId: loteOrigen.unidadId,
            estadoLote: lote_entity_1.EstadoLote.ACTIVO,
            notas: dto.motivo,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: usuarioId,
        }));
        const movBase = {
            clienteId,
            productoId: loteOrigen.productoId,
            cantidad: dto.cantidad,
            motivo: dto.motivo,
            tipoDocumento: 'TRANSFERENCIA',
            usuarioId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: usuarioId,
        };
        const movOrigen = await this.movRepo.save(this.movRepo.create({
            ...movBase,
            sucursalId: dto.sucursalOrigenId,
            loteId: loteOrigen.id,
            tipo: movimiento_stock_entity_1.TipoMovimiento.TRANSFERENCIA_SALIDA,
            cantidadAnterior: cantAntOrigen,
            cantidadPosterior: Number(loteOrigen.cantidadActual),
            sucursalDestinoId: dto.sucursalDestinoId,
            loteDestinoId: loteDestino.id,
        }));
        const movDestino = await this.movRepo.save(this.movRepo.create({
            ...movBase,
            sucursalId: dto.sucursalDestinoId,
            loteId: loteDestino.id,
            tipo: movimiento_stock_entity_1.TipoMovimiento.TRANSFERENCIA_ENTRADA,
            cantidadAnterior: 0,
            cantidadPosterior: dto.cantidad,
        }));
        return { origen: movOrigen, destino: movDestino };
    }
    async kardex(clienteId, opts) {
        const schema = process.env.DB_SCHEMA || 'public';
        const params = [clienteId, constants_1.Status.ACTIVE];
        let idx = 3;
        const conds = [];
        if (opts.sucursalId) {
            conds.push(`m.sucursal_id = $${idx++}`);
            params.push(opts.sucursalId);
        }
        if (opts.productoId) {
            conds.push(`m.producto_id = $${idx++}`);
            params.push(opts.productoId);
        }
        if (opts.tipo) {
            conds.push(`m.tipo = $${idx++}`);
            params.push(opts.tipo);
        }
        if (opts.fechaDesde) {
            conds.push(`m._fecha_creacion::date >= $${idx++}::date`);
            params.push(opts.fechaDesde);
        }
        if (opts.fechaHasta) {
            conds.push(`m._fecha_creacion::date <= $${idx++}::date`);
            params.push(opts.fechaHasta);
        }
        const where = conds.length ? ' AND ' + conds.join(' AND ') : '';
        const sql = `
      SELECT m.id, m._fecha_creacion AS fecha, m.tipo, m.cantidad, m.cantidad_anterior AS "cantidadAnterior",
             m.cantidad_posterior AS "cantidadPosterior", m.motivo, m.referencia_documento AS "referenciaDocumento",
             m.tipo_documento AS "tipoDocumento", m.lote_id AS "loteId",
             p.nombre AS "productoNombre", p.codigo_tienda AS "codigo",
             l.nro_lote AS "nroLote", l.lote_interno AS "loteInterno"
      FROM ${schema}.movimiento_stock m
      LEFT JOIN ${schema}.producto p ON p.id = m.producto_id
      LEFT JOIN ${schema}.lote l ON l.id = m.lote_id
      WHERE m.cliente_id = $1 AND m._estado = $2
      ${where}
      ORDER BY m._fecha_creacion DESC
      LIMIT 500`;
        return this.ds.query(sql, params);
    }
    async sinMovimiento(clienteId, opts) {
        const schema = process.env.DB_SCHEMA || 'public';
        const dias = opts.dias ?? 30;
        const params = [clienteId, constants_1.Status.ACTIVE, lote_entity_1.EstadoLote.ACTIVO, dias];
        let sucursalCond = '';
        if (opts.sucursalId) {
            sucursalCond = `AND l.sucursal_id = $5`;
            params.push(opts.sucursalId);
        }
        const sql = `
      SELECT l.producto_id AS "productoId", l.sucursal_id AS "sucursalId",
             p.nombre AS "productoNombre", p.codigo_tienda AS "codigo",
             SUM(l.cantidad_actual) AS "stockTotal",
             MAX(m._fecha_creacion) AS "ultimoMovimiento"
      FROM ${schema}.lote l
      LEFT JOIN ${schema}.producto p ON p.id = l.producto_id
      LEFT JOIN ${schema}.movimiento_stock m ON m.lote_id = l.id AND m._estado = $2
      WHERE l.cliente_id = $1 AND l._estado = $2 AND l.estado_lote = $3
      ${sucursalCond}
      GROUP BY l.producto_id, l.sucursal_id, p.nombre, p.codigo_tienda
      HAVING MAX(m._fecha_creacion) IS NULL OR MAX(m._fecha_creacion) < NOW() - ($4 || ' days')::interval
      ORDER BY "ultimoMovimiento" ASC NULLS FIRST`;
        return this.ds.query(sql, params);
    }
    async reporteRotacion(clienteId, opts) {
        const schema = process.env.DB_SCHEMA || 'public';
        const params = [clienteId, constants_1.Status.ACTIVE];
        let idx = 3;
        const conds = [];
        if (opts.sucursalId) {
            conds.push(`m.sucursal_id = $${idx++}`);
            params.push(opts.sucursalId);
        }
        if (opts.fechaDesde) {
            conds.push(`m._fecha_creacion::date >= $${idx++}::date`);
            params.push(opts.fechaDesde);
        }
        if (opts.fechaHasta) {
            conds.push(`m._fecha_creacion::date <= $${idx++}::date`);
            params.push(opts.fechaHasta);
        }
        const where = conds.length ? ' AND ' + conds.join(' AND ') : '';
        const sql = `
      SELECT m.producto_id AS "productoId", p.nombre AS "productoNombre", p.codigo_tienda AS "codigo",
             COUNT(*) AS "totalMovimientos",
             SUM(CASE WHEN m.tipo IN ('INGRESO') THEN m.cantidad ELSE 0 END) AS "totalEntradas",
             SUM(CASE WHEN m.tipo IN ('SALIDA','RETIRO','DEVOLUCION_PROVEEDOR') THEN m.cantidad ELSE 0 END) AS "totalSalidas",
             SUM(CASE WHEN m.tipo IN ('AJUSTE_POSITIVO','AJUSTE_NEGATIVO') THEN 1 ELSE 0 END) AS "totalAjustes",
             SUM(CASE WHEN m.tipo IN ('TRANSFERENCIA_SALIDA','TRANSFERENCIA_ENTRADA') THEN 1 ELSE 0 END) AS "totalTransferencias"
      FROM ${schema}.movimiento_stock m
      LEFT JOIN ${schema}.producto p ON p.id = m.producto_id
      WHERE m.cliente_id = $1 AND m._estado = $2
      ${where}
      GROUP BY m.producto_id, p.nombre, p.codigo_tienda
      ORDER BY "totalMovimientos" DESC
      LIMIT 200`;
        return this.ds.query(sql, params);
    }
};
MovimientosStockService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(movimiento_stock_entity_1.MovimientoStock)),
    __param(1, (0, typeorm_1.InjectRepository)(lote_entity_1.Lote)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], MovimientosStockService);
exports.MovimientosStockService = MovimientosStockService;
//# sourceMappingURL=movimientos-stock.service.js.map