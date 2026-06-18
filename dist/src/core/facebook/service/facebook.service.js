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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var FacebookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const configuracion_cliente_service_1 = require("../../cliente/service/configuracion-cliente.service");
const FB_API_VERSION = 'v19.0';
const FB_BASE = `https://graph.facebook.com/${FB_API_VERSION}`;
let FacebookService = FacebookService_1 = class FacebookService {
    constructor(confClienteService) {
        this.confClienteService = confClienteService;
        this.logger = new common_1.Logger(FacebookService_1.name);
    }
    async obtenerConfig(clienteId) {
        const claves = [
            'FB_PAGE_ACCESS_TOKEN', 'FB_PAGE_ID', 'FB_VERIFY_TOKEN',
            'FB_MESSENGER_AGENTE_ID', 'FB_COMMENTS_AGENTE_ID', 'FB_ENABLED', 'FB_REPLY_COMMENTS',
        ];
        const configs = await Promise.all(claves.map(c => this.confClienteService.obtenerPorClave(clienteId, c)));
        return {
            pageAccessToken: configs[0]?.valor || '',
            pageId: configs[1]?.valor || '',
            verifyToken: configs[2]?.valor || '',
            messengerAgenteId: configs[3]?.valor || '',
            commentsAgenteId: configs[4]?.valor || '',
            enabled: configs[5]?.valor === 'true',
            replyComments: configs[6]?.valor !== 'false',
        };
    }
    async guardarConfig(clienteId, data, usuarioId) {
        const entries = [
            { clave: 'FB_PAGE_ID', valor: data.pageId ?? '', esSecreto: false, desc: 'Facebook Page ID' },
            { clave: 'FB_VERIFY_TOKEN', valor: data.verifyToken ?? '', esSecreto: false, desc: 'Token verificación webhook Facebook' },
            { clave: 'FB_MESSENGER_AGENTE_ID', valor: data.messengerAgenteId ?? '', esSecreto: false, desc: 'Agente IA para Messenger' },
            { clave: 'FB_COMMENTS_AGENTE_ID', valor: data.commentsAgenteId ?? '', esSecreto: false, desc: 'Agente IA para comentarios de publicaciones' },
            { clave: 'FB_ENABLED', valor: String(data.enabled ?? false), esSecreto: false, desc: 'Facebook activo/inactivo' },
            { clave: 'FB_REPLY_COMMENTS', valor: String(data.replyComments ?? true), esSecreto: false, desc: 'Auto-responder comentarios en publicaciones' },
        ];
        if (data.pageAccessToken?.trim()) {
            entries.push({ clave: 'FB_PAGE_ACCESS_TOKEN', valor: data.pageAccessToken.trim(), esSecreto: true, desc: 'Facebook Page Access Token' });
        }
        for (const { clave, valor, esSecreto, desc } of entries) {
            if (valor !== '') {
                await this.confClienteService.set(clienteId, { clave, valor, esSecreto, descripcion: desc }, usuarioId);
            }
        }
    }
    async enviarMensajeMessenger(recipientPsid, text, config) {
        if (!config.pageAccessToken)
            throw new Error('FB_PAGE_ACCESS_TOKEN no configurado');
        try {
            await axios_1.default.post(`${FB_BASE}/me/messages`, { recipient: { id: recipientPsid }, message: { text }, messaging_type: 'RESPONSE' }, { params: { access_token: config.pageAccessToken } });
            this.logger.log(`[FB] Mensaje Messenger enviado a ${recipientPsid}`);
        }
        catch (err) {
            const msg = err?.response?.data?.error?.message || err.message;
            this.logger.error(`[FB] Error Messenger API: ${msg}`);
            throw new Error(msg);
        }
    }
    async mostrarTypingMessenger(recipientPsid, config) {
        try {
            await axios_1.default.post(`${FB_BASE}/me/messages`, { recipient: { id: recipientPsid }, sender_action: 'typing_on' }, { params: { access_token: config.pageAccessToken } });
        }
        catch { }
    }
    async marcarLeidoMessenger(recipientPsid, config) {
        try {
            await axios_1.default.post(`${FB_BASE}/me/messages`, { recipient: { id: recipientPsid }, sender_action: 'mark_seen' }, { params: { access_token: config.pageAccessToken } });
        }
        catch { }
    }
    async responderComentario(commentId, text, config) {
        if (!config.pageAccessToken)
            throw new Error('FB_PAGE_ACCESS_TOKEN no configurado');
        try {
            await axios_1.default.post(`${FB_BASE}/${commentId}/comments`, { message: text }, { params: { access_token: config.pageAccessToken } });
            this.logger.log(`[FB] Comentario respondido en ${commentId}`);
        }
        catch (err) {
            const msg = err?.response?.data?.error?.message || err.message;
            this.logger.error(`[FB] Error respondiendo comentario: ${msg}`);
            throw new Error(msg);
        }
    }
    async obtenerPublicaciones(clienteId) {
        const config = await this.obtenerConfig(clienteId);
        if (!config.pageAccessToken || !config.pageId) {
            throw new Error('Facebook no configurado. Guarda el Page Access Token y Page ID primero.');
        }
        const res = await axios_1.default.get(`${FB_BASE}/${config.pageId}/posts`, {
            params: {
                fields: 'id,message,story,created_time,full_picture,permalink_url',
                limit: 25,
                access_token: config.pageAccessToken,
            },
        });
        return (res.data.data || []).map((p) => ({
            id: p.id,
            texto: p.message || p.story || '(sin texto)',
            imagen: p.full_picture || null,
            enlace: p.permalink_url || null,
            fechaPublicacion: p.created_time,
        }));
    }
    async testConexion(pageAccessToken, pageId) {
        try {
            const res = await axios_1.default.get(`${FB_BASE}/${pageId}`, {
                params: { fields: 'id,name,fan_count,verification_status', access_token: pageAccessToken },
            });
            const d = res.data;
            return {
                valida: true,
                info: { nombre: d.name, seguidores: d.fan_count, verificada: d.verification_status },
                mensaje: `✅ Conectado: ${d.name}`,
            };
        }
        catch (err) {
            const msg = err?.response?.data?.error?.message || err.message || 'Error de conexión';
            return { valida: false, mensaje: `❌ ${msg}` };
        }
    }
};
FacebookService = FacebookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [configuracion_cliente_service_1.ConfiguracionClienteService])
], FacebookService);
exports.FacebookService = FacebookService;
//# sourceMappingURL=facebook.service.js.map