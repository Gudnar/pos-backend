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
exports.EspecialistaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const especialista_entity_1 = require("../entity/especialista.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let EspecialistaService = class EspecialistaService {
    constructor(repo) {
        this.repo = repo;
    }
    async listar(clienteId, especialidad) {
        const qb = this.repo
            .createQueryBuilder('e')
            .where('e.cliente_id = :clienteId AND e._estado = :estado', { clienteId, estado: constants_1.Status.ACTIVE })
            .orderBy('e.nombre', 'ASC');
        if (especialidad) {
            qb.andWhere(`e.especialidades::text ILIKE :esp`, { esp: `%${especialidad}%` });
        }
        return qb.getMany();
    }
    async obtener(id, clienteId) {
        const e = await this.repo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!e)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return e;
    }
    async crear(clienteId, dto, usuarioCreacion) {
        const e = this.repo.create({
            ...dto,
            clienteId,
            activo: true,
            horarios: dto.horarios || [],
            especialidades: dto.especialidades || [],
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.repo.save(e);
    }
    async actualizar(clienteId, id, dto, usuarioModificacion) {
        const e = await this.obtener(id, clienteId);
        Object.assign(e, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(e);
    }
    async eliminar(clienteId, id, usuarioModificacion) {
        const e = await this.obtener(id, clienteId);
        Object.assign(e, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.repo.save(e);
    }
};
EspecialistaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(especialista_entity_1.Especialista)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EspecialistaService);
exports.EspecialistaService = EspecialistaService;
//# sourceMappingURL=especialista.service.js.map