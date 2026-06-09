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
exports.CampanaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const campana_entity_1 = require("../entity/campana.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let CampanaService = class CampanaService {
    constructor(campanaRepo) {
        this.campanaRepo = campanaRepo;
    }
    async listar(clienteId) {
        return this.campanaRepo.find({
            where: { clienteId, estado: constants_1.Status.ACTIVE },
            order: { canal: 'ASC', nombre: 'ASC' },
        });
    }
    async obtener(id, clienteId) {
        const c = await this.campanaRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!c)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return c;
    }
    async crear(clienteId, dto, usuarioCreacion) {
        const campana = this.campanaRepo.create({
            ...dto,
            clienteId,
            activa: dto.activa ?? true,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.campanaRepo.save(campana);
    }
    async actualizar(id, clienteId, dto, usuarioModificacion) {
        const campana = await this.obtener(id, clienteId);
        Object.assign(campana, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.campanaRepo.save(campana);
    }
    async eliminar(id, clienteId, usuarioModificacion) {
        const campana = await this.obtener(id, clienteId);
        Object.assign(campana, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.campanaRepo.save(campana);
    }
    async resolverPorCanalYOrigen(clienteId, canal, origen) {
        if (origen) {
            const exacta = await this.campanaRepo.findOne({
                where: { clienteId, canal, origen, activa: true, estado: constants_1.Status.ACTIVE },
            });
            if (exacta)
                return exacta;
        }
        return this.campanaRepo.findOne({
            where: { clienteId, canal, origen: (0, typeorm_2.IsNull)(), activa: true, estado: constants_1.Status.ACTIVE },
        });
    }
};
CampanaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(campana_entity_1.Campana)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CampanaService);
exports.CampanaService = CampanaService;
//# sourceMappingURL=campana.service.js.map