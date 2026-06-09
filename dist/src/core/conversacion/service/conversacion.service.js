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
var ConversacionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversacionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversacion_entity_1 = require("../entity/conversacion.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let ConversacionService = ConversacionService_1 = class ConversacionService extends base_service_1.BaseService {
    constructor(conversacionRepository) {
        super(ConversacionService_1.name);
        this.conversacionRepository = conversacionRepository;
    }
    async listar(clienteId, agenteId) {
        const where = { estado: constants_1.Status.ACTIVE, clienteId };
        if (agenteId)
            where.agenteId = agenteId;
        return this.conversacionRepository.find({
            where,
            order: { fechaModificacion: 'DESC' },
            take: 100,
        });
    }
    async obtener(id) {
        const conv = await this.conversacionRepository.findOne({ where: { id, estado: constants_1.Status.ACTIVE } });
        if (!conv)
            throw new common_1.NotFoundException(response_messages_1.Messages.CONVERSACION_NOT_FOUND);
        return conv;
    }
    async crear(dto, usuarioCreacion, clienteId) {
        const conv = this.conversacionRepository.create({
            ...dto,
            clienteId,
            canal: dto.canal || 'chat',
            estadoConversacion: 'abierto',
            mensajes: [],
            etiquetas: dto.etiquetas ?? [],
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.conversacionRepository.save(conv);
    }
    async agregarMensaje(id, dto) {
        const conv = await this.obtener(id);
        const nuevoMensaje = {
            role: dto.role,
            content: dto.content,
            timestamp: new Date().toISOString(),
        };
        conv.mensajes = [...(conv.mensajes || []), nuevoMensaje];
        conv.totalMensajes = conv.mensajes.length;
        conv.transaccion = constants_1.Transacccion.ACTUALIZAR;
        return this.conversacionRepository.save(conv);
    }
    async actualizarScore(id, score) {
        await this.conversacionRepository.update(id, { score });
    }
    async actualizarCalificacion(id, data) {
        await this.conversacionRepository.update(id, data);
    }
    async actualizarEstado(id, estadoConversacion) {
        await this.conversacionRepository.update(id, { estadoConversacion });
    }
    async actualizarEscalado(id, escalado, motivo) {
        const update = { escalado };
        if (motivo)
            update.notas = motivo;
        await this.conversacionRepository.update(id, update);
    }
    async agregarNota(id, nota) {
        const conv = await this.conversacionRepository.findOne({ where: { id } });
        if (!conv)
            return;
        const notasActuales = conv.notas ? `${conv.notas}\n---\n${nota}` : nota;
        await this.conversacionRepository.update(id, { notas: notasActuales });
    }
    async buscarAbiertaPorContacto(clienteId, contacto, canal = 'whatsapp') {
        return this.conversacionRepository.findOne({
            where: { clienteId, contacto, canal, estado: constants_1.Status.ACTIVE },
            order: { fechaModificacion: 'DESC' },
        }).then(conv => conv && conv.estadoConversacion !== 'resuelto' && conv.estadoConversacion !== 'cerrado'
            ? conv
            : null);
    }
    async estadisticas(clienteId, agenteId) {
        const where = { estado: constants_1.Status.ACTIVE, clienteId };
        if (agenteId)
            where.agenteId = agenteId;
        const total = await this.conversacionRepository.count({ where });
        const escaladas = await this.conversacionRepository.count({ where: { ...where, escalado: true } });
        const resueltas = await this.conversacionRepository.count({ where: { ...where, estadoConversacion: 'resuelto' } });
        return {
            total,
            escaladas,
            resueltas,
            porcentajeResolucion: total > 0 ? Math.round((resueltas / total) * 100) : 0,
        };
    }
    async metricas(clienteId, agenteId, desde, hasta) {
        const where = { estado: constants_1.Status.ACTIVE, clienteId };
        if (agenteId)
            where.agenteId = agenteId;
        if (desde && hasta)
            where.fechaCreacion = (0, typeorm_2.Between)(new Date(desde), new Date(hasta + 'T23:59:59'));
        else if (desde)
            where.fechaCreacion = (0, typeorm_2.MoreThanOrEqual)(new Date(desde));
        else if (hasta)
            where.fechaCreacion = (0, typeorm_2.LessThanOrEqual)(new Date(hasta + 'T23:59:59'));
        const lista = await this.conversacionRepository.find({ where });
        const total = lista.length;
        const scorePromedio = lista.filter(c => c.score > 0).length > 0
            ? Math.round(lista.filter(c => c.score > 0).reduce((s, c) => s + c.score, 0) / lista.filter(c => c.score > 0).length)
            : 0;
        const contarIntenciones = {};
        const contarSentimientos = {};
        let tiempoTotal = 0, tiempoCount = 0;
        for (const conv of lista) {
            if (conv.intencion)
                contarIntenciones[conv.intencion] = (contarIntenciones[conv.intencion] || 0) + 1;
            if (conv.sentimiento)
                contarSentimientos[conv.sentimiento] = (contarSentimientos[conv.sentimiento] || 0) + 1;
            const msgs = conv.mensajes || [];
            for (let i = 0; i < msgs.length - 1; i++) {
                if (msgs[i].role === 'user' && msgs[i + 1]?.role === 'assistant') {
                    const delta = new Date(msgs[i + 1].timestamp).getTime() - new Date(msgs[i].timestamp).getTime();
                    if (delta > 0 && delta < 300000) {
                        tiempoTotal += delta;
                        tiempoCount++;
                    }
                }
            }
        }
        const diasLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const actividadPorDia = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const fechaStr = d.toISOString().slice(0, 10);
            return {
                fecha: fechaStr,
                label: diasLabels[d.getDay()],
                total: lista.filter(c => c.fechaCreacion?.toISOString().slice(0, 10) === fechaStr).length,
            };
        });
        return {
            total,
            escaladas: lista.filter(c => c.escalado).length,
            resueltas: lista.filter(c => c.estadoConversacion === 'resuelto').length,
            abiertas: lista.filter(c => c.estadoConversacion === 'abierto').length,
            porcentajeResolucion: total > 0 ? Math.round(lista.filter(c => c.estadoConversacion === 'resuelto').length / total * 100) : 0,
            scorePromedio,
            hotLeads: lista.filter(c => c.score >= 70).length,
            warmLeads: lista.filter(c => c.score >= 40 && c.score < 70).length,
            coldLeads: lista.filter(c => c.score > 0 && c.score < 40).length,
            sinScore: lista.filter(c => c.score === 0).length,
            distribucion: {
                hot: lista.filter(c => c.score >= 70).length,
                warm: lista.filter(c => c.score >= 40 && c.score < 70).length,
                cold: lista.filter(c => c.score > 0 && c.score < 40).length,
                sinScore: lista.filter(c => c.score === 0).length,
            },
            intenciones: contarIntenciones,
            sentimientos: contarSentimientos,
            tiempoRespuestaSegundos: tiempoCount > 0 ? Math.round(tiempoTotal / tiempoCount / 1000) : 0,
            actividadPorDia,
        };
    }
};
ConversacionService = ConversacionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversacion_entity_1.Conversacion)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConversacionService);
exports.ConversacionService = ConversacionService;
//# sourceMappingURL=conversacion.service.js.map