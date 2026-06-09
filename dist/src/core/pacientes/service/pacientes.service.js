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
exports.PacientesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const paciente_entity_1 = require("../entity/paciente.entity");
const consulta_entity_1 = require("../entity/consulta.entity");
const cita_entity_1 = require("../../citas-medicas/entity/cita.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let PacientesService = class PacientesService {
    constructor(pacienteRepo, consultaRepo, citaRepo) {
        this.pacienteRepo = pacienteRepo;
        this.consultaRepo = consultaRepo;
        this.citaRepo = citaRepo;
    }
    async listar(clienteId, q) {
        const qb = this.pacienteRepo
            .createQueryBuilder('p')
            .where('p.cliente_id = :clienteId AND p._estado = :estado', { clienteId, estado: constants_1.Status.ACTIVE })
            .orderBy('p.nombre', 'ASC');
        if (q && q.trim().length >= 1) {
            qb.andWhere('(LOWER(p.nombre) LIKE LOWER(:q) OR p.telefono LIKE :q)', { q: `%${q.trim()}%` });
        }
        return qb.getMany();
    }
    async buscar(clienteId, q) {
        if (!q || q.trim().length < 2)
            return [];
        return this.pacienteRepo
            .createQueryBuilder('p')
            .where('p.cliente_id = :clienteId AND p._estado = :estado', { clienteId, estado: constants_1.Status.ACTIVE })
            .andWhere('(LOWER(p.nombre) LIKE LOWER(:q) OR p.telefono LIKE :q)', { q: `%${q.trim()}%` })
            .orderBy('p.nombre', 'ASC')
            .limit(8)
            .getMany();
    }
    async obtener(clienteId, id) {
        const p = await this.pacienteRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!p)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return p;
    }
    async crear(clienteId, dto, usuarioCreacion) {
        const existe = await this.pacienteRepo.findOne({
            where: { clienteId, telefono: dto.telefono, estado: constants_1.Status.ACTIVE },
        });
        if (existe)
            throw new common_1.ConflictException(`Ya existe un paciente con el teléfono "${dto.telefono}".`);
        return this.pacienteRepo.save(this.pacienteRepo.create({
            ...dto,
            clienteId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
    }
    async actualizar(clienteId, id, dto, usuarioModificacion) {
        const paciente = await this.obtener(clienteId, id);
        if (dto.telefono && dto.telefono !== paciente.telefono) {
            const existe = await this.pacienteRepo.findOne({
                where: { clienteId, telefono: dto.telefono, estado: constants_1.Status.ACTIVE },
            });
            if (existe)
                throw new common_1.ConflictException(`Ya existe un paciente con el teléfono "${dto.telefono}".`);
        }
        Object.assign(paciente, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.pacienteRepo.save(paciente);
    }
    async eliminar(clienteId, id, usuarioModificacion) {
        const paciente = await this.obtener(clienteId, id);
        Object.assign(paciente, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.pacienteRepo.save(paciente);
    }
    async historialCitas(clienteId, pacienteId) {
        const paciente = await this.obtener(clienteId, pacienteId);
        return this.citaRepo.find({
            where: { clienteId, pacienteTelefono: paciente.telefono, estado: constants_1.Status.ACTIVE },
            order: { fecha: 'DESC', horaInicio: 'DESC' },
        });
    }
    async listarConsultas(clienteId, pacienteId) {
        await this.obtener(clienteId, pacienteId);
        return this.consultaRepo.find({
            where: { clienteId, pacienteId, estado: constants_1.Status.ACTIVE },
            order: { fecha: 'DESC' },
        });
    }
    async crearConsulta(clienteId, pacienteId, dto, usuarioCreacion) {
        await this.obtener(clienteId, pacienteId);
        return this.consultaRepo.save(this.consultaRepo.create({
            ...dto,
            clienteId,
            pacienteId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
    }
    async actualizarConsulta(clienteId, pacienteId, consultaId, dto, usuarioModificacion) {
        await this.obtener(clienteId, pacienteId);
        const consulta = await this.consultaRepo.findOne({ where: { id: consultaId, pacienteId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!consulta)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        Object.assign(consulta, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.consultaRepo.save(consulta);
    }
    async eliminarConsulta(clienteId, pacienteId, consultaId, usuarioModificacion) {
        await this.obtener(clienteId, pacienteId);
        const consulta = await this.consultaRepo.findOne({ where: { id: consultaId, pacienteId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!consulta)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        Object.assign(consulta, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.consultaRepo.save(consulta);
    }
};
PacientesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(paciente_entity_1.Paciente)),
    __param(1, (0, typeorm_1.InjectRepository)(consulta_entity_1.Consulta)),
    __param(2, (0, typeorm_1.InjectRepository)(cita_entity_1.Cita)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PacientesService);
exports.PacientesService = PacientesService;
//# sourceMappingURL=pacientes.service.js.map