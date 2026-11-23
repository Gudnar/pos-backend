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
exports.MovimientosFuenteService = exports.aCentavos = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const movimiento_fuente_entity_1 = require("../entity/movimiento-fuente.entity");
const fuente_entity_1 = require("../entity/fuente.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
const conversion_moneda_1 = require("../../../common/lib/conversion-moneda");
Object.defineProperty(exports, "aCentavos", { enumerable: true, get: function () { return conversion_moneda_1.aCentavos; } });
let MovimientosFuenteService = class MovimientosFuenteService {
    constructor(repo, fuenteRepo) {
        this.repo = repo;
        this.fuenteRepo = fuenteRepo;
    }
    async validarFuente(clienteId, fuenteId) {
        const f = await this.fuenteRepo.findOne({ where: { id: fuenteId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!f)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return f;
    }
    async calcularSaldoActual(clienteId, fuenteId, saldoInicial, manager) {
        const result = await (manager ? manager.getRepository(movimiento_fuente_entity_1.MovimientoFuente) : this.repo)
            .createQueryBuilder('m')
            .select(`
        SUM(CASE WHEN m.tipo IN ('INGRESO','TRANSFERENCIA_ENTRADA') THEN m.monto_nativo ELSE 0 END) as entradas,
        SUM(CASE WHEN m.tipo IN ('EGRESO','TRANSFERENCIA_SALIDA') THEN m.monto_nativo ELSE 0 END) as salidas
      `)
            .where('m.fuente_id = :fuenteId AND m.cliente_id = :clienteId AND m._estado = :estado', {
            fuenteId, clienteId, estado: constants_1.Status.ACTIVE,
        })
            .getRawOne();
        return Number((Number(saldoInicial) + Number(result?.entradas ?? 0) - Number(result?.salidas ?? 0)).toFixed(4));
    }
    async validarFondos(fuente, montoNativo, manager) {
        const saldo = await this.calcularSaldoActual(fuente.clienteId, fuente.id, fuente.saldoInicial, manager);
        if ((0, conversion_moneda_1.aCentavos)(montoNativo) > (0, conversion_moneda_1.aCentavos)(saldo)) {
            throw new common_1.BadRequestException(`Saldo insuficiente en "${fuente.nombre}". Disponible: ${(0, conversion_moneda_1.aCentavos)(saldo).toFixed(2)} — Requerido: ${(0, conversion_moneda_1.aCentavos)(montoNativo).toFixed(2)}`);
        }
    }
    async listar(clienteId, fuenteId, filters) {
        await this.validarFuente(clienteId, fuenteId);
        const qb = this.repo
            .createQueryBuilder('m')
            .where('m.fuente_id = :fuenteId AND m.cliente_id = :clienteId AND m._estado = :estado', {
            fuenteId, clienteId, estado: constants_1.Status.ACTIVE,
        })
            .orderBy('m.fecha', 'DESC')
            .addOrderBy('m.fechaCreacion', 'DESC');
        if (filters?.desde)
            qb.andWhere('m.fecha >= :desde', { desde: filters.desde });
        if (filters?.hasta)
            qb.andWhere('m.fecha <= :hasta', { hasta: filters.hasta });
        if (filters?.tipo)
            qb.andWhere('m.tipo = :tipo', { tipo: filters.tipo });
        if (filters?.categoria)
            qb.andWhere('m.categoria = :categoria', { categoria: filters.categoria });
        if (filters?.concepto)
            qb.andWhere('m.concepto ILIKE :concepto', { concepto: `%${filters.concepto}%` });
        return qb.getMany();
    }
    async registrar(clienteId, fuenteId, dto, usuarioCreacion) {
        const fuente = await this.validarFuente(clienteId, fuenteId);
        const tc = dto.tipoCambio ?? 1;
        const montoNativo = (0, conversion_moneda_1.aCentavos)(Number(dto.monto) * tc);
        if (dto.tipo === movimiento_fuente_entity_1.TipoMovimiento.EGRESO || dto.tipo === movimiento_fuente_entity_1.TipoMovimiento.TRANSFERENCIA_SALIDA) {
            await this.validarFondos(fuente, montoNativo);
        }
        return this.repo.save(this.repo.create({
            ...dto,
            fuenteId,
            clienteId,
            tipoCambio: tc,
            montoNativo,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
    }
    async registrarExterno(clienteId, fuenteId, tipo, concepto, monto, monedaId, tipoCambio, fecha, categoria, origenTipo, origenId, usuarioCreacion) {
        const montoNativo = (0, conversion_moneda_1.aCentavos)(monto * tipoCambio);
        if (tipo === movimiento_fuente_entity_1.TipoMovimiento.EGRESO || tipo === movimiento_fuente_entity_1.TipoMovimiento.TRANSFERENCIA_SALIDA) {
            const fuente = await this.validarFuente(clienteId, fuenteId);
            await this.validarFondos(fuente, montoNativo);
        }
        return this.repo.save(this.repo.create({
            fuenteId, clienteId, tipo, concepto, monto, monedaId,
            tipoCambio, montoNativo, fecha, categoria, origenTipo, origenId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
    }
    async registrarTransferencia(clienteId, fuenteOrigenId, dto, usuarioCreacion) {
        const fuenteOrigen = await this.validarFuente(clienteId, fuenteOrigenId);
        await this.validarFuente(clienteId, dto.fuenteDestinoId);
        const tcOrigen = dto.tipoCambio ?? 1;
        const tcDestino = dto.tipoCambioDestino ?? 1;
        await this.validarFondos(fuenteOrigen, (0, conversion_moneda_1.aCentavos)(Number(dto.monto) * tcOrigen));
        const base = { clienteId, concepto: dto.concepto, referencia: dto.referencia, monedaId: dto.monedaId, monto: dto.monto, fecha: dto.fecha, categoria: 'TRANSFERENCIA', estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion };
        const salida = await this.repo.save(this.repo.create({ ...base, tipo: movimiento_fuente_entity_1.TipoMovimiento.TRANSFERENCIA_SALIDA, fuenteId: fuenteOrigenId, tipoCambio: tcOrigen, montoNativo: (0, conversion_moneda_1.aCentavos)(Number(dto.monto) * tcOrigen), fuenteDestinoId: dto.fuenteDestinoId }));
        const entrada = await this.repo.save(this.repo.create({ ...base, tipo: movimiento_fuente_entity_1.TipoMovimiento.TRANSFERENCIA_ENTRADA, fuenteId: dto.fuenteDestinoId, tipoCambio: tcDestino, montoNativo: (0, conversion_moneda_1.aCentavos)(Number(dto.monto) * tcDestino), fuenteDestinoId: fuenteOrigenId }));
        return { salida, entrada };
    }
    async actualizar(clienteId, fuenteId, id, dto, usuarioModificacion) {
        const m = await this.repo.findOne({ where: { id, fuenteId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!m)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        const tc = dto.tipoCambio ?? Number(m.tipoCambio);
        const monto = dto.monto ?? Number(m.monto);
        Object.assign(m, { ...dto, tipoCambio: tc, montoNativo: (0, conversion_moneda_1.aCentavos)(monto * tc), transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(m);
    }
    async eliminar(clienteId, fuenteId, id, usuarioModificacion) {
        const m = await this.repo.findOne({ where: { id, fuenteId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!m)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        Object.assign(m, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.repo.save(m);
    }
    async montoEnMonedaFuente(fuente, mov, manager) {
        const c = mov.conversion;
        const [base] = await manager.query(`SELECT id FROM logistica_moneda WHERE cliente_id = $1 AND es_moneda_base = true AND _estado = 'ACTIVO' LIMIT 1`, [fuente.clienteId]);
        const monedaFuente = fuente.monedaId || base?.id || null;
        if (!fuente.monedaId || monedaFuente === base?.id) {
            return { monto: mov.total, monedaId: mov.monedaPagoId || undefined, tipoCambio: c.tipoCambio, montoNativo: c.montoBase };
        }
        if (c.monedaIntermediaId && monedaFuente === c.monedaIntermediaId) {
            const m = Number(c.montoIntermedio);
            return { monto: mov.total, monedaId: mov.monedaPagoId || undefined, tipoCambio: mov.total > 0 ? m / mov.total : 1, montoNativo: m };
        }
        if (mov.monedaPagoId && monedaFuente === mov.monedaPagoId) {
            return { monto: mov.total, monedaId: mov.monedaPagoId, tipoCambio: 1, montoNativo: (0, conversion_moneda_1.aCentavos)(mov.total) };
        }
        throw new common_1.BadRequestException(`La fuente "${fuente.nombre}" está en otra moneda. Registra el pago en esa moneda o usa la conversión en dos pasos con esa moneda como intermedia.`);
    }
    async reemplazarExterno(clienteId, origenTipo, origenId, nuevo, usuario, manager) {
        const ejecutar = async (m) => {
            const repo = m.getRepository(movimiento_fuente_entity_1.MovimientoFuente);
            const previos = await repo.find({ where: { clienteId, origenTipo, origenId, estado: constants_1.Status.ACTIVE } });
            for (const p of previos) {
                Object.assign(p, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion: usuario });
                await repo.save(p);
            }
            if (!nuevo)
                return null;
            const fuente = await m.getRepository(fuente_entity_1.Fuente).findOne({ where: { id: nuevo.fuenteId, clienteId, estado: constants_1.Status.ACTIVE } });
            if (!fuente)
                throw new common_1.BadRequestException('Fuente de fondos no válida o inactiva');
            const datos = await this.montoEnMonedaFuente(fuente, nuevo, m);
            if (nuevo.tipo === movimiento_fuente_entity_1.TipoMovimiento.EGRESO || nuevo.tipo === movimiento_fuente_entity_1.TipoMovimiento.TRANSFERENCIA_SALIDA) {
                await this.validarFondos(fuente, datos.montoNativo, m);
            }
            return repo.save(repo.create({
                fuenteId: fuente.id, clienteId, tipo: nuevo.tipo, concepto: nuevo.concepto,
                monto: datos.monto, monedaId: datos.monedaId, tipoCambio: datos.tipoCambio, montoNativo: datos.montoNativo,
                fecha: nuevo.fecha, categoria: nuevo.categoria, origenTipo, origenId,
                estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuario,
            }));
        };
        return manager ? ejecutar(manager) : this.repo.manager.transaction(ejecutar);
    }
    async cancelarPorOrigen(clienteId, origenTipo, origenId, usuarioModificacion) {
        const movimientos = await this.repo.find({ where: { clienteId, origenTipo, origenId, estado: constants_1.Status.ACTIVE } });
        for (const m of movimientos) {
            Object.assign(m, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
            await this.repo.save(m);
        }
    }
};
MovimientosFuenteService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(movimiento_fuente_entity_1.MovimientoFuente)),
    __param(1, (0, typeorm_1.InjectRepository)(fuente_entity_1.Fuente)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MovimientosFuenteService);
exports.MovimientosFuenteService = MovimientosFuenteService;
//# sourceMappingURL=movimientos-fuente.service.js.map