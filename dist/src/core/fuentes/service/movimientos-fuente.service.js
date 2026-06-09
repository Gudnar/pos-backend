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
exports.MovimientosFuenteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const movimiento_fuente_entity_1 = require("../entity/movimiento-fuente.entity");
const fuente_entity_1 = require("../entity/fuente.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
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
    async calcularSaldoActual(clienteId, fuenteId, saldoInicial) {
        const result = await this.repo
            .createQueryBuilder('m')
            .select(`
        SUM(CASE WHEN m.tipo IN ('INGRESO','TRANSFERENCIA_ENTRADA') THEN m.monto_nativo ELSE 0 END) as entradas,
        SUM(CASE WHEN m.tipo IN ('EGRESO','TRANSFERENCIA_SALIDA') THEN m.monto_nativo ELSE 0 END) as salidas
      `)
            .where('m.fuente_id = :fuenteId AND m.cliente_id = :clienteId AND m._estado = :estado', {
            fuenteId, clienteId, estado: constants_1.Status.ACTIVE,
        })
            .getRawOne();
        return Number(saldoInicial) + Number(result?.entradas ?? 0) - Number(result?.salidas ?? 0);
    }
    async validarFondos(fuente, montoNativo) {
        const saldo = await this.calcularSaldoActual(fuente.clienteId, fuente.id, fuente.saldoInicial);
        if (montoNativo > saldo + 0.001) {
            throw new common_1.BadRequestException(`Saldo insuficiente en "${fuente.nombre}". Disponible: ${saldo.toFixed(2)} — Requerido: ${montoNativo.toFixed(2)}`);
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
        return qb.getMany();
    }
    async registrar(clienteId, fuenteId, dto, usuarioCreacion) {
        const fuente = await this.validarFuente(clienteId, fuenteId);
        const tc = dto.tipoCambio ?? 1;
        const montoNativo = Number(dto.monto) * tc;
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
        const montoNativo = monto * tipoCambio;
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
        await this.validarFondos(fuenteOrigen, Number(dto.monto) * tcOrigen);
        const base = { clienteId, concepto: dto.concepto, referencia: dto.referencia, monedaId: dto.monedaId, monto: dto.monto, fecha: dto.fecha, categoria: 'TRANSFERENCIA', estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion };
        const salida = await this.repo.save(this.repo.create({ ...base, tipo: movimiento_fuente_entity_1.TipoMovimiento.TRANSFERENCIA_SALIDA, fuenteId: fuenteOrigenId, tipoCambio: tcOrigen, montoNativo: Number(dto.monto) * tcOrigen, fuenteDestinoId: dto.fuenteDestinoId }));
        const entrada = await this.repo.save(this.repo.create({ ...base, tipo: movimiento_fuente_entity_1.TipoMovimiento.TRANSFERENCIA_ENTRADA, fuenteId: dto.fuenteDestinoId, tipoCambio: tcDestino, montoNativo: Number(dto.monto) * tcDestino, fuenteDestinoId: fuenteOrigenId }));
        return { salida, entrada };
    }
    async actualizar(clienteId, fuenteId, id, dto, usuarioModificacion) {
        const m = await this.repo.findOne({ where: { id, fuenteId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!m)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        const tc = dto.tipoCambio ?? Number(m.tipoCambio);
        const monto = dto.monto ?? Number(m.monto);
        Object.assign(m, { ...dto, tipoCambio: tc, montoNativo: monto * tc, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(m);
    }
    async eliminar(clienteId, fuenteId, id, usuarioModificacion) {
        const m = await this.repo.findOne({ where: { id, fuenteId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!m)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        Object.assign(m, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.repo.save(m);
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