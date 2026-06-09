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
exports.CajaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const caja_entity_1 = require("../entity/caja.entity");
const caja_sesion_entity_1 = require("../entity/caja-sesion.entity");
const usuario_entity_1 = require("../../usuario/entity/usuario.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let CajaService = class CajaService {
    constructor(cajaRepo, sesionRepo, usuarioRepo) {
        this.cajaRepo = cajaRepo;
        this.sesionRepo = sesionRepo;
        this.usuarioRepo = usuarioRepo;
    }
    async listar(clienteId, sucursalId) {
        const where = { clienteId, estado: constants_1.Status.ACTIVE };
        if (sucursalId)
            where.sucursalId = sucursalId;
        return this.cajaRepo.find({ where, order: { nombre: 'ASC' } });
    }
    async crear(clienteId, dto, usuarioCreacion) {
        return this.cajaRepo.save(this.cajaRepo.create({
            clienteId, sucursalId: dto.sucursalId, nombre: dto.nombre,
            descripcion: dto.descripcion, activo: dto.activo ?? true,
            estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion,
        }));
    }
    async actualizar(clienteId, id, dto, usuarioModificacion) {
        const caja = await this.cajaRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!caja)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        Object.assign(caja, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.cajaRepo.save(caja);
    }
    async eliminar(clienteId, id, usuarioModificacion) {
        const caja = await this.cajaRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!caja)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        Object.assign(caja, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.cajaRepo.save(caja);
    }
    async sesionActiva(clienteId, usuarioId) {
        return this.sesionRepo.findOne({
            where: { clienteId, usuarioId, estadoSesion: caja_sesion_entity_1.EstadoSesion.ABIERTA, estado: constants_1.Status.ACTIVE },
        });
    }
    async ultimasSesiones(clienteId, cajaId, limit = 20) {
        const where = { clienteId, estado: constants_1.Status.ACTIVE };
        if (cajaId)
            where.cajaId = cajaId;
        return this.sesionRepo.find({ where, order: { fechaApertura: 'DESC' }, take: limit });
    }
    async sesionesDia(clienteId, fecha, sucursalId) {
        const dia = fecha ? new Date(fecha + 'T00:00:00') : new Date();
        const inicio = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 0, 0, 0);
        const fin = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 23, 59, 59, 999);
        const where = {
            clienteId,
            estado: constants_1.Status.ACTIVE,
            fechaApertura: (0, typeorm_2.Between)(inicio, fin),
        };
        if (sucursalId)
            where.sucursalId = sucursalId;
        const sesiones = await this.sesionRepo.find({ where, order: { fechaApertura: 'ASC' } });
        if (!sesiones.length)
            return [];
        const cajaIds = [...new Set(sesiones.map(s => s.cajaId))];
        const cajas = await this.cajaRepo.find({ where: { id: (0, typeorm_2.In)(cajaIds) } });
        const cajaMap = Object.fromEntries(cajas.map(c => [c.id, c]));
        return sesiones.map(s => ({
            ...s,
            nombreCaja: cajaMap[s.cajaId]?.nombre ?? '—',
        }));
    }
    async abrirSesion(clienteId, dto, usuarioId) {
        const caja = await this.cajaRepo.findOne({ where: { id: dto.cajaId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!caja)
            throw new common_1.NotFoundException('Caja no encontrada');
        if (!caja.activo)
            throw new common_1.BadRequestException('La caja está inactiva');
        const sesionAbierta = await this.sesionRepo.findOne({
            where: { clienteId, cajaId: dto.cajaId, estadoSesion: caja_sesion_entity_1.EstadoSesion.ABIERTA, estado: constants_1.Status.ACTIVE },
        });
        if (sesionAbierta)
            throw new common_1.BadRequestException('Esta caja ya tiene una sesión abierta');
        const usuario = await this.usuarioRepo.findOne({ where: { id: Number(usuarioId), estado: constants_1.Status.ACTIVE } });
        const nombreUsuario = usuario
            ? [usuario.nombres, usuario.apellidos].filter(Boolean).join(' ')
            : `Usuario #${usuarioId}`;
        return this.sesionRepo.save(this.sesionRepo.create({
            clienteId, cajaId: dto.cajaId, sucursalId: caja.sucursalId, usuarioId,
            estadoSesion: caja_sesion_entity_1.EstadoSesion.ABIERTA,
            nombreUsuario,
            montoInicial: dto.montoInicial, totalVentas: 0, nroVentas: 0,
            fechaApertura: new Date(),
            observaciones: dto.observaciones,
            estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioId,
        }));
    }
    async cerrarSesion(clienteId, sesionId, dto, usuarioModificacion) {
        const sesion = await this.sesionRepo.findOne({
            where: { id: sesionId, clienteId, estadoSesion: caja_sesion_entity_1.EstadoSesion.ABIERTA, estado: constants_1.Status.ACTIVE },
        });
        if (!sesion)
            throw new common_1.NotFoundException('Sesión abierta no encontrada');
        const montoEsperado = Number(sesion.montoInicial) + Number(sesion.totalVentas);
        const diferencia = Number(dto.montoFinal) - montoEsperado;
        Object.assign(sesion, {
            estadoSesion: caja_sesion_entity_1.EstadoSesion.CERRADA,
            montoFinal: dto.montoFinal,
            diferencia,
            fechaCierre: new Date(),
            observaciones: dto.observaciones || sesion.observaciones,
            transaccion: constants_1.Transacccion.ACTUALIZAR,
            usuarioModificacion,
        });
        return this.sesionRepo.save(sesion);
    }
    async incrementarTotalesSesion(sesionId, total) {
        await this.sesionRepo.increment({ id: sesionId }, 'totalVentas', total);
        await this.sesionRepo.increment({ id: sesionId }, 'nroVentas', 1);
    }
};
CajaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(caja_entity_1.Caja)),
    __param(1, (0, typeorm_1.InjectRepository)(caja_sesion_entity_1.CajaSesion)),
    __param(2, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CajaService);
exports.CajaService = CajaService;
//# sourceMappingURL=caja.service.js.map