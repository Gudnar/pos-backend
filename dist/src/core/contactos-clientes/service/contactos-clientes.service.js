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
exports.ContactosClientesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contacto_cliente_entity_1 = require("../entity/contacto-cliente.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
const representantes_service_1 = require("../../representantes/service/representantes.service");
let ContactosClientesService = class ContactosClientesService {
    constructor(repo, repSvc) {
        this.repo = repo;
        this.repSvc = repSvc;
    }
    async listar(clienteId, q) {
        const qb = this.repo
            .createQueryBuilder('c')
            .where('c.cliente_id = :clienteId AND c._estado = :estado', { clienteId, estado: constants_1.Status.ACTIVE })
            .orderBy('c.nombre', 'ASC');
        if (q && q.trim().length >= 1) {
            qb.andWhere('(LOWER(c.nombre) LIKE LOWER(:q) OR LOWER(c.empresa) LIKE LOWER(:q))', { q: `%${q.trim()}%` });
        }
        const contactos = await qb.getMany();
        if (!contactos.length)
            return [];
        const repMap = await this.repSvc.listarActivosBatch(clienteId, 'CLIENTE', contactos.map(c => c.id));
        return contactos.map(c => ({
            ...c,
            representanteActual: repMap.get(c.id) ?? null,
        }));
    }
    async obtener(clienteId, id) {
        const c = await this.repo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!c)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return c;
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
        const contacto = await this.obtener(clienteId, id);
        const { estado: estadoDto, ...rest } = dto;
        const activo = estadoDto !== undefined ? estadoDto !== 'inactivo' : contacto.activo;
        Object.assign(contacto, { ...rest, activo, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(contacto);
    }
    async eliminar(clienteId, id, usuarioModificacion) {
        const contacto = await this.obtener(clienteId, id);
        Object.assign(contacto, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.repo.save(contacto);
    }
};
ContactosClientesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contacto_cliente_entity_1.ContactoCliente)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        representantes_service_1.RepresentantesService])
], ContactosClientesService);
exports.ContactosClientesService = ContactosClientesService;
//# sourceMappingURL=contactos-clientes.service.js.map