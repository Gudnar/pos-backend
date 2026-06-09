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
exports.SucursalesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sucursal_entity_1 = require("../entity/sucursal.entity");
const usuario_sucursal_entity_1 = require("../entity/usuario-sucursal.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let SucursalesService = class SucursalesService {
    constructor(repo, asignacionRepo) {
        this.repo = repo;
        this.asignacionRepo = asignacionRepo;
    }
    async listar(clienteId) {
        return this.repo.find({
            where: { clienteId, estado: constants_1.Status.ACTIVE },
            order: { esPrincipal: 'DESC', nombre: 'ASC' },
        });
    }
    async obtener(clienteId, id) {
        const s = await this.repo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!s)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return s;
    }
    async crear(clienteId, dto, usuarioCreacion) {
        return this.repo.save(this.repo.create({
            ...dto,
            clienteId,
            esPrincipal: dto.esPrincipal ?? false,
            activo: dto.estado !== 'inactivo',
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
    }
    async actualizar(clienteId, id, dto, usuarioModificacion) {
        const s = await this.obtener(clienteId, id);
        const { estado: estadoDto, ...rest } = dto;
        const activo = estadoDto !== undefined ? estadoDto !== 'inactivo' : s.activo;
        Object.assign(s, { ...rest, activo, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(s);
    }
    async eliminar(clienteId, id, usuarioModificacion) {
        const s = await this.obtener(clienteId, id);
        Object.assign(s, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.repo.save(s);
    }
    async obtenerSucursalesDeUsuario(clienteId, usuarioId) {
        const asignaciones = await this.asignacionRepo.find({
            where: { clienteId, usuarioId, estado: constants_1.Status.ACTIVE },
        });
        return asignaciones.map(a => a.sucursalId);
    }
    async sincronizarSucursalesUsuario(clienteId, usuarioId, sucursalIds, actor) {
        const actuales = await this.asignacionRepo.find({ where: { clienteId, usuarioId, estado: constants_1.Status.ACTIVE } });
        const actualesIds = actuales.map(a => a.sucursalId);
        for (const a of actuales) {
            if (!sucursalIds.includes(a.sucursalId)) {
                Object.assign(a, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion: actor });
                await this.asignacionRepo.save(a);
            }
        }
        for (const sucursalId of sucursalIds) {
            if (!actualesIds.includes(sucursalId)) {
                await this.asignacionRepo.save(this.asignacionRepo.create({
                    clienteId, usuarioId, sucursalId,
                    estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: actor,
                }));
            }
        }
    }
};
SucursalesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sucursal_entity_1.Sucursal)),
    __param(1, (0, typeorm_1.InjectRepository)(usuario_sucursal_entity_1.UsuarioSucursal)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SucursalesService);
exports.SucursalesService = SucursalesService;
//# sourceMappingURL=sucursales.service.js.map