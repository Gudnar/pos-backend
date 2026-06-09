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
var FacebookWebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookWebhookService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const facebook_service_1 = require("./facebook.service");
const conversacion_service_1 = require("../../conversacion/service/conversacion.service");
const agente_service_1 = require("../../agente/service/agente.service");
const configuracion_cliente_service_1 = require("../../cliente/service/configuracion-cliente.service");
const campana_service_1 = require("../../campana/service/campana.service");
const agent_tools_service_1 = require("../../herramienta/service/agent-tools.service");
const constants_1 = require("../../../common/constants");
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MAX_HISTORY = 20;
const MAX_ITERS = 5;
let FacebookWebhookService = FacebookWebhookService_1 = class FacebookWebhookService {
    constructor(fbService, conversacionService, agenteService, confClienteService, campanaService, agentTools) {
        this.fbService = fbService;
        this.conversacionService = conversacionService;
        this.agenteService = agenteService;
        this.confClienteService = confClienteService;
        this.campanaService = campanaService;
        this.agentTools = agentTools;
        this.logger = new common_1.Logger(FacebookWebhookService_1.name);
    }
    async procesarEntrada(entry, pageId) {
        const clienteId = await this.confClienteService.resolverClientePorPageId(pageId);
        if (!clienteId) {
            this.logger.warn(`[FB] No se encontró cliente para pageId: ${pageId}`);
            return;
        }
        const config = await this.fbService.obtenerConfig(clienteId);
        if (!config.enabled)
            return;
        for (const msg of entry.messaging || []) {
            if (msg.message && !msg.message.is_echo) {
                this.procesarMensajeMessenger(msg, clienteId, config).catch(e => this.logger.error(`[FB] Messenger error: ${e.message}`));
            }
        }
        for (const change of entry.changes || []) {
            if (change.field === 'feed' && config.replyComments) {
                const v = change.value;
                if (v?.item === 'comment' && v?.verb === 'add' && v?.from?.id !== pageId) {
                    this.procesarComentario(v, clienteId, config).catch(e => this.logger.error(`[FB] Comment error: ${e.message}`));
                }
            }
        }
    }
    async procesarMensajeMessenger(msg, clienteId, config) {
        const senderId = msg.sender.id;
        const texto = msg.message.text || '';
        if (!texto.trim())
            return;
        this.logger.log(`[FB/Messenger] De ${senderId}: "${texto.slice(0, 80)}"`);
        this.fbService.marcarLeidoMessenger(senderId, config).catch(() => { });
        this.fbService.mostrarTypingMessenger(senderId, config).catch(() => { });
        const agenteId = await this.resolverAgente(texto, config.messengerAgenteId, clienteId, senderId, 'messenger');
        if (!agenteId) {
            this.logger.warn('[FB] Sin agente para Messenger');
            return;
        }
        const agente = await this.agenteService.obtener(agenteId, clienteId);
        if (!agente?.activo)
            return;
        const conversacion = await this.encontrarOCrearConversacion(senderId, agenteId, clienteId, 'messenger');
        await this.conversacionService.agregarMensaje(conversacion.id, { role: 'user', content: texto });
        const convActual = await this.conversacionService.obtener(conversacion.id);
        const historial = (convActual.mensajes || [])
            .slice(-MAX_HISTORY)
            .map(m => ({ role: m.role, content: m.content }));
        const respuesta = await this.llamarClaude(agente, historial, clienteId, conversacion.id);
        if (!respuesta)
            return;
        await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: respuesta });
        await this.agenteService.incrementarContadores(agente.id, 1);
        await this.fbService.enviarMensajeMessenger(senderId, respuesta, config);
        this.logger.log(`[FB/Messenger] Respuesta enviada a ${senderId}: "${respuesta.slice(0, 80)}"`);
    }
    async procesarComentario(value, clienteId, config) {
        const userId = value.from?.id;
        const userName = value.from?.name || userId;
        const commentId = value.comment_id;
        const postId = value.post_id;
        const texto = value.message || '';
        if (!texto.trim() || !commentId)
            return;
        this.logger.log(`[FB/Comment] De ${userName} en post ${postId}: "${texto.slice(0, 80)}"`);
        const defaultAgenteId = config.commentsAgenteId || config.messengerAgenteId;
        const agenteId = await this.resolverAgente(texto, defaultAgenteId, clienteId, userId, 'facebook-comment', postId);
        if (!agenteId) {
            this.logger.warn('[FB] Sin agente para comentarios');
            return;
        }
        const agente = await this.agenteService.obtener(agenteId, clienteId);
        if (!agente?.activo)
            return;
        const conversacion = await this.encontrarOCrearConversacion(userId, agenteId, clienteId, 'facebook-comment', `Comentario en post ${postId}. Usuario: ${userName}`);
        const contexto = `[Comentario de ${userName} en publicación]: ${texto}`;
        await this.conversacionService.agregarMensaje(conversacion.id, { role: 'user', content: contexto });
        const convActual = await this.conversacionService.obtener(conversacion.id);
        const historial = (convActual.mensajes || [])
            .slice(-MAX_HISTORY)
            .map(m => ({ role: m.role, content: m.content }));
        const respuesta = await this.llamarClaude(agente, historial, clienteId, conversacion.id);
        if (!respuesta)
            return;
        await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: respuesta });
        await this.agenteService.incrementarContadores(agente.id, 1);
        await this.fbService.responderComentario(commentId, respuesta, config);
        this.logger.log(`[FB/Comment] Respuesta publicada en comentario ${commentId}`);
    }
    async resolverAgente(texto, defaultAgenteId, clienteId, contacto, canal, origen) {
        if (!defaultAgenteId)
            return null;
        const conv = await this.conversacionService.buscarAbiertaPorContacto(clienteId, contacto, canal);
        if (conv)
            return conv.agenteId;
        const campana = await this.campanaService.resolverPorCanalYOrigen(clienteId, canal, origen);
        if (campana)
            return campana.agenteId;
        return defaultAgenteId;
    }
    async encontrarOCrearConversacion(contacto, agenteId, clienteId, canal, notas) {
        const conv = await this.conversacionService.buscarAbiertaPorContacto(clienteId, contacto, canal);
        if (conv)
            return conv;
        return this.conversacionService.crear({ agenteId, contacto, canal, etiquetas: [], notas }, constants_1.USUARIO_SISTEMA, clienteId);
    }
    async llamarClaude(agente, mensajesIniciales, clienteId, conversacionId) {
        const apiKeyConfig = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY');
        const apiKey = apiKeyConfig?.valor;
        if (!apiKey || apiKey.includes('•')) {
            this.logger.error('[FB] ANTHROPIC_API_KEY no configurada');
            return null;
        }
        const systemPrompt = agente.systemPrompt ||
            `Eres ${agente.nombre}, un asistente IA ${agente.tono || 'profesional'}. Responde en ${agente.idioma || 'español'} de forma concisa y útil.`;
        const agentToolDefs = await this.agentTools.getToolDefs(agente.id);
        const agentToolNames = await this.agentTools.getNombres(agente.id);
        const hasTools = agentToolDefs.length > 0;
        const maxTokens = hasTools ? Math.max(agente.maxTokens || 1024, 1024) : (agente.maxTokens || 512);
        const messages = [...mensajesIniciales];
        for (let i = 0; i < MAX_ITERS; i++) {
            try {
                const payload = {
                    model: agente.modelo || 'claude-haiku-4-5',
                    max_tokens: maxTokens,
                    system: systemPrompt,
                    messages,
                };
                if (hasTools)
                    payload.tools = agentToolDefs;
                const res = await axios_1.default.post(ANTHROPIC_API, payload, {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json',
                    },
                });
                const data = res.data;
                if (data.stop_reason === 'end_turn') {
                    return data.content?.find((b) => b.type === 'text')?.text || null;
                }
                if (data.stop_reason === 'tool_use') {
                    const toolUseBlocks = data.content.filter((b) => b.type === 'tool_use');
                    if (!toolUseBlocks.length)
                        break;
                    this.logger.log(`[FB] Claude usa ${toolUseBlocks.length} herramienta(s): ${toolUseBlocks.map((b) => b.name).join(', ')}`);
                    const toolResults = await Promise.all(toolUseBlocks.map(async (tu) => {
                        const result = agentToolNames.has(tu.name)
                            ? await this.agentTools.ejecutar(tu.name, tu.input || {}, conversacionId)
                            : { error: `Herramienta desconocida: ${tu.name}` };
                        return {
                            type: 'tool_result',
                            tool_use_id: tu.id,
                            content: JSON.stringify(result),
                        };
                    }));
                    messages.push({ role: 'assistant', content: data.content });
                    messages.push({ role: 'user', content: toolResults });
                    continue;
                }
                break;
            }
            catch (err) {
                this.logger.error(`[FB] Error Claude (iter ${i}): ${err?.response?.data?.error?.message || err.message}`);
                return null;
            }
        }
        return null;
    }
};
FacebookWebhookService = FacebookWebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [facebook_service_1.FacebookService,
        conversacion_service_1.ConversacionService,
        agente_service_1.AgenteService,
        configuracion_cliente_service_1.ConfiguracionClienteService,
        campana_service_1.CampanaService,
        agent_tools_service_1.AgentToolsService])
], FacebookWebhookService);
exports.FacebookWebhookService = FacebookWebhookService;
//# sourceMappingURL=facebook-webhook.service.js.map