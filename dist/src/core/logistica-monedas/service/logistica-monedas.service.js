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
exports.LogisticaMonedasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const moneda_entity_1 = require("../entity/moneda.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let LogisticaMonedasService = class LogisticaMonedasService {
    constructor(repo) {
        this.repo = repo;
    }
    async listar(clienteId, q) {
        const qb = this.repo
            .createQueryBuilder('m')
            .where('m.cliente_id = :clienteId AND m._estado = :estado', { clienteId, estado: constants_1.Status.ACTIVE })
            .orderBy('m.nombre', 'ASC');
        if (q && q.trim()) {
            qb.andWhere('LOWER(m.nombre) LIKE LOWER(:q) OR LOWER(m.codigo) LIKE LOWER(:q)', { q: `%${q.trim()}%` });
        }
        return qb.getMany();
    }
    async obtener(clienteId, id) {
        const m = await this.repo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!m)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return m;
    }
    async crear(clienteId, dto, usuarioCreacion) {
        return this.repo.save(this.repo.create({
            ...dto,
            clienteId,
            activo: dto.estado !== 'inactivo',
            esMonedaBase: dto.esMonedaBase ?? false,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
    }
    async actualizar(clienteId, id, dto, usuarioModificacion) {
        const m = await this.obtener(clienteId, id);
        const { estado: estadoDto, ...rest } = dto;
        const activo = estadoDto !== undefined ? estadoDto !== 'inactivo' : m.activo;
        Object.assign(m, { ...rest, activo, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(m);
    }
    async eliminar(clienteId, id, usuarioModificacion) {
        const m = await this.obtener(clienteId, id);
        Object.assign(m, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.repo.save(m);
    }
    async setBase(clienteId, id, usuarioModificacion) {
        await this.repo
            .createQueryBuilder()
            .update(moneda_entity_1.Moneda)
            .set({ esMonedaBase: false, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion })
            .where('cliente_id = :clienteId AND _estado = :estado AND es_moneda_base = true', { clienteId, estado: constants_1.Status.ACTIVE })
            .execute();
        const m = await this.obtener(clienteId, id);
        Object.assign(m, { esMonedaBase: true, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(m);
    }
};
LogisticaMonedasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(moneda_entity_1.Moneda)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LogisticaMonedasService);
exports.LogisticaMonedasService = LogisticaMonedasService;
//# sourceMappingURL=logistica-monedas.service.js.map