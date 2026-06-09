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
exports.CitasMedicasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cita_entity_1 = require("../entity/cita.entity");
const paciente_entity_1 = require("../../pacientes/entity/paciente.entity");
const cliente_entity_1 = require("../../cliente/entity/cliente.entity");
const especialista_service_1 = require("../../especialista/service/especialista.service");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
const DIAS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
function minutosDeHora(h) {
    const [hh, mm] = h.split(':').map(Number);
    return hh * 60 + mm;
}
function minutosAHora(m) {
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
let CitasMedicasService = class CitasMedicasService {
    constructor(citaRepo, pacienteRepo, clienteRepo, especialistaSvc) {
        this.citaRepo = citaRepo;
        this.pacienteRepo = pacienteRepo;
        this.clienteRepo = clienteRepo;
        this.especialistaSvc = especialistaSvc;
    }
    async getCliente(clienteId) {
        const c = await this.clienteRepo.findOne({ where: { id: clienteId, estado: constants_1.Status.ACTIVE } });
        if (!c)
            throw new common_1.NotFoundException(response_messages_1.Messages.CLIENTE_NOT_FOUND);
        return c;
    }
    async obtenerServicios(clienteId) {
        const c = await this.getCliente(clienteId);
        return c.servicios || [];
    }
    async buscarPacientes(clienteId, q) {
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
    async crearPaciente(clienteId, dto, usuarioCreacion, origenRegistro = 'STAFF') {
        const existe = await this.pacienteRepo.findOne({
            where: { clienteId, telefono: dto.telefono, estado: constants_1.Status.ACTIVE },
        });
        if (existe) {
            Object.assign(existe, { nombre: dto.nombre, email: dto.email ?? existe.email, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion: usuarioCreacion });
            return this.pacienteRepo.save(existe);
        }
        return this.pacienteRepo.save(this.pacienteRepo.create({
            ...dto,
            clienteId,
            origenRegistro,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
    }
    async upsertPaciente(clienteId, dto, usuarioCreacion, origenRegistro = 'STAFF') {
        await this.crearPaciente(clienteId, dto, usuarioCreacion, origenRegistro).catch(() => { });
    }
    async citasPorTelefono(clienteId, telefono) {
        return this.citaRepo.find({
            where: { clienteId, pacienteTelefono: telefono, estado: constants_1.Status.ACTIVE },
            order: { fecha: 'ASC', horaInicio: 'ASC' },
        });
    }
    async listar(clienteId, fecha, especialistaId) {
        const where = { clienteId, estado: constants_1.Status.ACTIVE };
        if (fecha)
            where.fecha = fecha;
        if (especialistaId)
            where.especialistaId = especialistaId;
        return this.citaRepo.find({ where, order: { horaInicio: 'ASC' } });
    }
    async disponibilidad(clienteId, fecha, especialistaId) {
        const diaSemana = DIAS_ES[new Date(fecha + 'T12:00:00').getDay()];
        let horariosBase;
        if (especialistaId) {
            const especialista = await this.especialistaSvc.obtener(especialistaId, clienteId);
            horariosBase = especialista.horarios || [];
        }
        else {
            const cliente = await this.getCliente(clienteId);
            horariosBase = cliente.horarios || [];
        }
        const horarioDelDia = horariosBase.find(h => h.dia.toLowerCase() === diaSemana.toLowerCase());
        if (!horarioDelDia)
            return [];
        const slots = [];
        for (const franja of horarioDelDia.franjas) {
            let cur = minutosDeHora(franja.inicio);
            const fin = minutosDeHora(franja.fin);
            while (cur + 30 <= fin) {
                slots.push({ horaInicio: minutosAHora(cur), horaFin: minutosAHora(cur + 30) });
                cur += 30;
            }
        }
        const whereConsultas = { clienteId, fecha, estado: constants_1.Status.ACTIVE };
        if (especialistaId)
            whereConsultas.especialistaId = especialistaId;
        const consultasDelDia = await this.citaRepo.find({ where: whereConsultas });
        const ocupadas = new Set(consultasDelDia.filter(c => c.estadoCita !== 'CANCELADA').map(c => c.horaInicio));
        return slots.filter(s => !ocupadas.has(s.horaInicio));
    }
    async crear(clienteId, dto, usuarioCreacion) {
        if (!dto.especialistaId) {
            const cliente = await this.getCliente(clienteId);
            if (!(cliente.servicios || []).includes(dto.servicio)) {
                throw new common_1.BadRequestException(`El servicio "${dto.servicio}" no está disponible.`);
            }
        }
        const cita = this.citaRepo.create({
            ...dto,
            clienteId,
            estadoCita: dto.estadoCita || 'PENDIENTE',
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        const saved = await this.citaRepo.save(cita);
        await this.upsertPaciente(clienteId, {
            nombre: dto.pacienteNombre,
            telefono: dto.pacienteTelefono,
            email: dto.pacienteEmail,
        }, usuarioCreacion, dto.origenRegistro || 'STAFF');
        return saved;
    }
    async actualizar(clienteId, id, dto, usuarioModificacion) {
        const cita = await this.citaRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!cita)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        if (dto.servicio) {
            const cliente = await this.getCliente(clienteId);
            if (!(cliente.servicios || []).includes(dto.servicio)) {
                throw new common_1.BadRequestException(`El servicio "${dto.servicio}" no está disponible.`);
            }
        }
        Object.assign(cita, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        const saved = await this.citaRepo.save(cita);
        if (dto.pacienteNombre && dto.pacienteTelefono) {
            await this.upsertPaciente(clienteId, {
                nombre: dto.pacienteNombre,
                telefono: dto.pacienteTelefono,
                email: dto.pacienteEmail,
            }, usuarioModificacion);
        }
        return saved;
    }
    async estadisticasConsultas(clienteId, desde, hasta) {
        const qb = this.citaRepo.createQueryBuilder('c')
            .where('c.cliente_id = :clienteId AND c._estado = :estado', { clienteId, estado: constants_1.Status.ACTIVE });
        if (desde)
            qb.andWhere('c._fecha_creacion >= :desde', { desde: new Date(desde) });
        if (hasta)
            qb.andWhere('c._fecha_creacion <= :hasta', { hasta: new Date(hasta + 'T23:59:59') });
        const consultas = await qb.getMany();
        const total = consultas.length;
        const pendientes = consultas.filter(c => c.estadoCita === 'PENDIENTE').length;
        const confirmadas = consultas.filter(c => c.estadoCita === 'CONFIRMADA').length;
        const canceladas = consultas.filter(c => c.estadoCita === 'CANCELADA').length;
        const completadas = consultas.filter(c => c.estadoCita === 'COMPLETADA').length;
        const espMap = {};
        const svcMap = {};
        for (const c of consultas) {
            svcMap[c.servicio] = (svcMap[c.servicio] || 0) + 1;
            if (c.especialistaId) {
                if (!espMap[c.especialistaId])
                    espMap[c.especialistaId] = { nombre: c.especialistaNombre || 'Sin nombre', total: 0 };
                espMap[c.especialistaId].total++;
            }
        }
        return {
            total,
            pendientes,
            confirmadas,
            canceladas,
            completadas,
            tasaCancelacion: total > 0 ? Math.round((canceladas / total) * 100) : 0,
            porOrigenRegistro: {
                ia: consultas.filter(c => c.origenRegistro === 'IA_AGENTE').length,
                staff: consultas.filter(c => c.origenRegistro !== 'IA_AGENTE').length,
            },
            porEspecialista: Object.entries(espMap)
                .map(([id, v]) => ({ id, nombre: v.nombre, total: v.total }))
                .sort((a, b) => b.total - a.total),
            porServicio: Object.entries(svcMap)
                .map(([nombre, total]) => ({ nombre, total }))
                .sort((a, b) => b.total - a.total),
        };
    }
    async eliminar(clienteId, id, usuarioModificacion) {
        const cita = await this.citaRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!cita)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        Object.assign(cita, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.citaRepo.save(cita);
    }
};
CitasMedicasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cita_entity_1.Cita)),
    __param(1, (0, typeorm_1.InjectRepository)(paciente_entity_1.Paciente)),
    __param(2, (0, typeorm_1.InjectRepository)(cliente_entity_1.Cliente)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        especialista_service_1.EspecialistaService])
], CitasMedicasService);
exports.CitasMedicasService = CitasMedicasService;
//# sourceMappingURL=citas-medicas.service.js.map