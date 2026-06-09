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
exports.RepresentantesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const representante_entity_1 = require("../entity/representante.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let RepresentantesService = class RepresentantesService {
    constructor(repo) {
        this.repo = repo;
    }
    async listar(clienteId, tipo, entidadId) {
        return this.repo.find({
            where: { clienteId, tipo, entidadId, estado: constants_1.Status.ACTIVE },
            order: { activo: 'DESC', fechaInicio: 'DESC' },
        });
    }
    async listarActivosBatch(clienteId, tipo, entidadIds) {
        if (!entidadIds.length)
            return new Map();
        const reps = await this.repo
            .createQueryBuilder('r')
            .where('r.cliente_id = :clienteId AND r.tipo = :tipo AND r.activo = true AND r._estado = :estado AND r.entidad_id IN (:...ids)', { clienteId, tipo, estado: constants_1.Status.ACTIVE, ids: entidadIds })
            .orderBy('r.fecha_inicio', 'DESC')
            .getMany();
        const map = new Map();
        reps.forEach(r => { if (!map.has(r.entidadId))
            map.set(r.entidadId, r); });
        return map;
    }
    async crear(clienteId, tipo, entidadId, dto, usuarioCreacion) {
        if (dto.reemplazarActual) {
            const activos = await this.repo.find({
                where: { clienteId, tipo, entidadId, activo: true, estado: constants_1.Status.ACTIVE },
            });
            const hoy = dto.fechaInicio || new Date().toISOString().split('T')[0];
            for (const rep of activos) {
                Object.assign(rep, {
                    activo: false,
                    fechaFin: hoy,
                    motivoCambio: dto.motivoCambio,
                    transaccion: constants_1.Transacccion.ACTUALIZAR,
                    usuarioModificacion: usuarioCreacion,
                });
                await this.repo.save(rep);
            }
        }
        return this.repo.save(this.repo.create({
            nombre: dto.nombre,
            cargo: dto.cargo,
            telefono: dto.telefono,
            email: dto.email,
            fechaInicio: dto.fechaInicio,
            notas: dto.notas,
            clienteId,
            tipo,
            entidadId,
            activo: true,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
    }
    async actualizar(clienteId, repId, dto, usuarioModificacion) {
        const rep = await this._obtener(clienteId, repId);
        Object.assign(rep, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(rep);
    }
    async desactivar(clienteId, repId, dto, usuarioModificacion) {
        const rep = await this._obtener(clienteId, repId);
        Object.assign(rep, {
            activo: false,
            fechaFin: dto.fechaFin || new Date().toISOString().split('T')[0],
            motivoCambio: dto.motivoCambio,
            transaccion: constants_1.Transacccion.ACTUALIZAR,
            usuarioModificacion,
        });
        return this.repo.save(rep);
    }
    async eliminar(clienteId, repId, usuarioModificacion) {
        const rep = await this._obtener(clienteId, repId);
        Object.assign(rep, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.repo.save(rep);
    }
    async _obtener(clienteId, repId) {
        const rep = await this.repo.findOne({ where: { id: repId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!rep)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return rep;
    }
};
RepresentantesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(representante_entity_1.Representante)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RepresentantesService);
exports.RepresentantesService = RepresentantesService;
//# sourceMappingURL=representantes.service.js.map