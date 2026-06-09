"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosSistemaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const usuario_entity_1 = require("../../usuario/entity/usuario.entity");
const usuario_sucursal_entity_1 = require("../../sucursales/entity/usuario-sucursal.entity");
const sucursal_entity_1 = require("../../sucursales/entity/sucursal.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let UsuariosSistemaService = class UsuariosSistemaService {
    constructor(usuarioRepo, asignacionRepo, sucursalRepo) {
        this.usuarioRepo = usuarioRepo;
        this.asignacionRepo = asignacionRepo;
        this.sucursalRepo = sucursalRepo;
    }
    async listar(clienteId) {
        const usuarios = await this.usuarioRepo.find({
            where: { clienteId, estado: (0, typeorm_2.Not)(constants_1.Status.ELIMINATE) },
            order: { nombres: 'ASC' },
        });
        return Promise.all(usuarios.map(u => this._enriquecer(u, clienteId)));
    }
    async obtener(clienteId, id) {
        const u = await this.usuarioRepo.findOne({ where: { id, clienteId, estado: (0, typeorm_2.Not)(constants_1.Status.ELIMINATE) } });
        if (!u)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return this._enriquecer(u, clienteId);
    }
    async crear(clienteId, dto, usuarioCreacion) {
        const existe = await this.usuarioRepo.findOne({ where: { usuario: dto.usuario } });
        if (existe)
            throw new common_1.ConflictException(response_messages_1.Messages.CONFLICT);
        const { sucursales, estado: estadoDto, ...usuarioData } = dto;
        const estado = estadoDto === 'inactivo' ? constants_1.Status.INACTIVE : constants_1.Status.ACTIVE;
        const nuevo = this.usuarioRepo.create({
            usuario: usuarioData.usuario,
            contrasena: usuarioData.contrasena,
            nombres: usuarioData.nombres,
            apellidos: usuarioData.apellidos,
            correoElectronico: usuarioData.correoElectronico,
            rol: usuarioData.rol,
            clienteId,
            estado,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        const saved = await this.usuarioRepo.save(nuevo);
        if (sucursales?.length) {
            await this._sincronizar(clienteId, saved.id, sucursales, usuarioCreacion);
        }
        return this.obtener(clienteId, saved.id);
    }
    async actualizar(clienteId, id, dto, actor) {
        const u = await this.usuarioRepo.findOne({ where: { id, clienteId, estado: (0, typeorm_2.Not)(constants_1.Status.ELIMINATE) } });
        if (!u)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        const { sucursales, nuevaContrasena, estado: estadoDto, ...rest } = dto;
        const estado = estadoDto !== undefined
            ? (estadoDto === 'inactivo' ? constants_1.Status.INACTIVE : constants_1.Status.ACTIVE)
            : u.estado;
        Object.assign(u, { ...rest, estado, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion: actor });
        if (nuevaContrasena) {
            u.contrasena = await bcrypt.hash(nuevaContrasena, 10);
        }
        await this.usuarioRepo.save(u);
        if (sucursales !== undefined) {
            await this._sincronizar(clienteId, id, sucursales, actor);
        }
        return this.obtener(clienteId, id);
    }
    async eliminar(clienteId, id, actor) {
        const u = await this.usuarioRepo.findOne({ where: { id, clienteId, estado: (0, typeorm_2.Not)(constants_1.Status.ELIMINATE) } });
        if (!u)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        Object.assign(u, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion: actor });
        await this.usuarioRepo.save(u);
        const asignaciones = await this.asignacionRepo.find({ where: { clienteId, usuarioId: id, estado: constants_1.Status.ACTIVE } });
        for (const a of asignaciones) {
            Object.assign(a, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion: actor });
            await this.asignacionRepo.save(a);
        }
    }
    async _enriquecer(u, clienteId) {
        const asignaciones = await this.asignacionRepo.find({
            where: { clienteId, usuarioId: u.id, estado: constants_1.Status.ACTIVE },
        });
        const sucursalIds = asignaciones.map(a => a.sucursalId);
        const sucursales = sucursalIds.length
            ? await this.sucursalRepo.findByIds(sucursalIds)
            : [];
        const { contrasena, ...safe } = u;
        return { ...safe, sucursales: sucursales.map(s => ({ id: s.id, nombre: s.nombre })) };
    }
    async _sincronizar(clienteId, usuarioId, sucursalIds, actor) {
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
UsuariosSistemaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __param(1, (0, typeorm_1.InjectRepository)(usuario_sucursal_entity_1.UsuarioSucursal)),
    __param(2, (0, typeorm_1.InjectRepository)(sucursal_entity_1.Sucursal)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsuariosSistemaService);
exports.UsuariosSistemaService = UsuariosSistemaService;
//# sourceMappingURL=usuarios-sistema.service.js.map