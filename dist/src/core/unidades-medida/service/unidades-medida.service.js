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
exports.UnidadesMedidaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const unidad_medida_entity_1 = require("../entity/unidad-medida.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let UnidadesMedidaService = class UnidadesMedidaService {
    constructor(repo) {
        this.repo = repo;
    }
    async listar(clienteId) {
        const unidades = await this.repo.find({
            where: { clienteId, estado: constants_1.Status.ACTIVE },
            order: { esBase: 'DESC', nombre: 'ASC' },
        });
        const baseMap = new Map(unidades.filter(u => u.esBase).map(u => [u.id, u]));
        return unidades.map(u => ({
            ...u,
            unidadBaseNombre: u.unidadBaseId ? baseMap.get(u.unidadBaseId)?.nombre ?? null : null,
        }));
    }
    async obtener(clienteId, id) {
        const u = await this.repo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!u)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return u;
    }
    async crear(clienteId, dto, usuarioCreacion) {
        return this.repo.save(this.repo.create({
            ...dto,
            clienteId,
            esBase: dto.esBase !== false,
            factorConversion: dto.factorConversion ?? 1,
            activo: dto.estado !== 'inactivo',
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
    }
    async actualizar(clienteId, id, dto, usuarioModificacion) {
        const u = await this.obtener(clienteId, id);
        const { estado: estadoDto, ...rest } = dto;
        const activo = estadoDto !== undefined ? estadoDto !== 'inactivo' : u.activo;
        Object.assign(u, { ...rest, activo, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(u);
    }
    async eliminar(clienteId, id, usuarioModificacion) {
        const u = await this.obtener(clienteId, id);
        Object.assign(u, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.repo.save(u);
    }
};
UnidadesMedidaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(unidad_medida_entity_1.UnidadMedida)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UnidadesMedidaService);
exports.UnidadesMedidaService = UnidadesMedidaService;
//# sourceMappingURL=unidades-medida.service.js.map