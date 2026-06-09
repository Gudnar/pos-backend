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
exports.LogisticaPaisesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pais_logistica_entity_1 = require("../entity/pais-logistica.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let LogisticaPaisesService = class LogisticaPaisesService {
    constructor(repo) {
        this.repo = repo;
    }
    async listar(clienteId, q) {
        const qb = this.repo
            .createQueryBuilder('p')
            .where('p.cliente_id = :clienteId AND p._estado = :estado', { clienteId, estado: constants_1.Status.ACTIVE })
            .orderBy('p.nombre', 'ASC');
        if (q && q.trim()) {
            qb.andWhere('LOWER(p.nombre) LIKE LOWER(:q)', { q: `%${q.trim()}%` });
        }
        return qb.getMany();
    }
    async obtener(clienteId, id) {
        const p = await this.repo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!p)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return p;
    }
    async crear(clienteId, dto, usuarioCreacion) {
        return this.repo.save(this.repo.create({
            ...dto,
            clienteId,
            activo: dto.estado !== 'inactivo',
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
    }
    async actualizar(clienteId, id, dto, usuarioModificacion) {
        const p = await this.obtener(clienteId, id);
        const { estado: estadoDto, ...rest } = dto;
        const activo = estadoDto !== undefined ? estadoDto !== 'inactivo' : p.activo;
        Object.assign(p, { ...rest, activo, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(p);
    }
    async eliminar(clienteId, id, usuarioModificacion) {
        const p = await this.obtener(clienteId, id);
        Object.assign(p, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.repo.save(p);
    }
    async inicializarDefaults(clienteId, usuarioCreacion) {
        const count = await this.repo.count({ where: { clienteId, estado: constants_1.Status.ACTIVE } });
        if (count > 0)
            return;
        const defaults = [
            { nombre: 'China', codigo: 'CN' },
            { nombre: 'Perú', codigo: 'PE' },
            { nombre: 'Chile', codigo: 'CL' },
            { nombre: 'Estados Unidos', codigo: 'US' },
            { nombre: 'Brasil', codigo: 'BR' },
            { nombre: 'Argentina', codigo: 'AR' },
            { nombre: 'Colombia', codigo: 'CO' },
            { nombre: 'México', codigo: 'MX' },
            { nombre: 'Alemania', codigo: 'DE' },
            { nombre: 'España', codigo: 'ES' },
            { nombre: 'Italia', codigo: 'IT' },
            { nombre: 'Turquía', codigo: 'TR' },
            { nombre: 'India', codigo: 'IN' },
            { nombre: 'Vietnam', codigo: 'VN' },
            { nombre: 'Tailandia', codigo: 'TH' },
            { nombre: 'Bolivia', codigo: 'BO' },
        ];
        for (const d of defaults) {
            await this.crear(clienteId, d, usuarioCreacion);
        }
    }
};
LogisticaPaisesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pais_logistica_entity_1.PaisLogistica)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LogisticaPaisesService);
exports.LogisticaPaisesService = LogisticaPaisesService;
//# sourceMappingURL=logistica-paises.service.js.map