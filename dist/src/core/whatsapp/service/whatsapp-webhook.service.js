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
var WhatsappWebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappWebhookService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const whatsapp_service_1 = require("./whatsapp.service");
const conversacion_service_1 = require("../../conversacion/service/conversacion.service");
const agente_service_1 = require("../../agente/service/agente.service");
const configuracion_cliente_service_1 = require("../../cliente/service/configuracion-cliente.service");
const cliente_service_1 = require("../../cliente/service/cliente.service");
const clinica_tools_service_1 = require("./clinica-tools.service");
const calificacion_background_service_1 = require("./calificacion-background.service");
const campana_service_1 = require("../../campana/service/campana.service");
const agent_tools_service_1 = require("../../herramienta/service/agent-tools.service");
const biz_intel_tools_service_1 = require("../../biz-intel/service/biz-intel-tools.service");
const admin_gerente_service_1 = require("../../admin-gerente/service/admin-gerente.service");
const whatsapp_flows_service_1 = require("../../whatsapp-flows/service/whatsapp-flows.service");
const constants_1 = require("../../../common/constants");
const FLOW_KEYWORDS = [
    'registrar ingreso', 'nuevo ingreso', 'anotar ingreso',
    'registrar gasto', 'nuevo gasto', 'anotar gasto',
];
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MAX_HISTORY_MESSAGES = 20;
const MAX_TOOL_ITERATIONS = 6;
let WhatsappWebhookService = WhatsappWebhookService_1 = class WhatsappWebhookService {
    constructor(waService, conversacionService, agenteService, confClienteService, clienteService, clinicaTools, calificacionBg, campanaService, agentTools, bizIntelTools, adminGerenteService, waFlowsService) {
        this.waService = waService;
        this.conversacionService = conversacionService;
        this.agenteService = agenteService;
        this.confClienteService = confClienteService;
        this.clienteService = clienteService;
        this.clinicaTools = clinicaTools;
        this.calificacionBg = calificacionBg;
        this.campanaService = campanaService;
        this.agentTools = agentTools;
        this.bizIntelTools = bizIntelTools;
        this.adminGerenteService = adminGerenteService;
        this.waFlowsService = waFlowsService;
        this.logger = new common_1.Logger(WhatsappWebhookService_1.name);
    }
    async procesarMensajeEntrante(rawMessage, contactName, phoneNumberId) {
        const textoUsuario = this.extraerTexto(rawMessage);
        if (!textoUsuario) {
            this.logger.log(`[WA] Tipo no soportado: ${rawMessage.type} — ignorado`);
            return;
        }
        const from = rawMessage.from;
        const clienteId = await this.confClienteService.resolverClientePorPhoneNumberId(phoneNumberId);
        if (!clienteId) {
            this.logger.warn(`[WA] No se encontró cliente para phoneNumberId: ${phoneNumberId}`);
            return;
        }
        this.logger.log(`[WA] Mensaje de ${from} (${contactName}) → cliente ${clienteId}: "${textoUsuario.slice(0, 80)}"`);
        try {
            const ownerCfg = await this.confClienteService.obtenerPorClave(clienteId, 'OWNER_WHATSAPP').catch(() => null);
            if (ownerCfg?.valor && ownerCfg.valor.trim() === from) {
                this.logger.log(`[WA] Mensaje del dueño (${from}) — modo BI`);
                const config = await this.waService.obtenerConfig(clienteId);
                this.waService.marcarLeido(rawMessage.id, config).catch(() => { });
                this.waService.mostrarTyping(rawMessage.id, config).catch(() => { });
                await this.procesarMensajeDueno(from, textoUsuario, clienteId, config);
                return;
            }
            const adminUser = await this.adminGerenteService.resolverAdmin(from, clienteId);
            if (adminUser) {
                this.logger.log(`[WA] Mensaje del Gerente ${adminUser.nombres} (${adminUser.rol})`);
                const adminConfig = await this.waService.obtenerConfig(clienteId);
                this.waService.marcarLeido(rawMessage.id, adminConfig).catch(() => { });
                this.waService.mostrarTyping(rawMessage.id, adminConfig).catch(() => { });
                const textoLower = textoUsuario.toLowerCase();
                if (FLOW_KEYWORDS.some(kw => textoLower.includes(kw))) {
                    this.logger.log(`[WA] Gerente — intención de Flow detectada: "${textoUsuario.slice(0, 60)}"`);
                    await this.waFlowsService.enviarFlow(from, clienteId);
                    return;
                }
                const apiKeyCfg = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY').catch(() => null);
                const apiKey = apiKeyCfg?.valor;
                if (apiKey && !apiKey.includes('•')) {
                    const cliente = await this.clienteService.obtener(clienteId);
                    const respuesta = await this.adminGerenteService.obtenerRespuesta(textoUsuario, adminUser, clienteId, apiKey, cliente?.nombre || 'la empresa');
                    if (respuesta)
                        await this.waService.enviarTexto(from, respuesta, adminConfig);
                }
                else {
                    this.logger.error('[WA-Admin] ANTHROPIC_API_KEY no configurada para este cliente');
                }
                return;
            }
            const config = await this.waService.obtenerConfig(clienteId);
            if (!config.enabled) {
                this.logger.warn('[WA] Canal desactivado, mensaje ignorado');
                return;
            }
            this.waService.marcarLeido(rawMessage.id, config).catch(() => { });
            this.waService.mostrarTyping(rawMessage.id, config).catch(() => { });
            if (!config.agenteId) {
                this.logger.warn('[WA] No hay agente asignado al canal WhatsApp');
                return;
            }
            const origenReferral = rawMessage.referral?.source_id || rawMessage.referral?.ctwa_clid;
            const agenteEfectivoId = await this.resolverAgenteEfectivo(textoUsuario, config.agenteId, clienteId, from, 'whatsapp', origenReferral);
            const agente = await this.agenteService.obtener(agenteEfectivoId, clienteId);
            if (!agente || !agente.activo) {
                this.logger.warn(`[WA] Agente ${config.agenteId} inactivo o no encontrado`);
                return;
            }
            const conversacion = await this.encontrarOCrearConversacion(from, contactName, agente.id, clienteId);
            await this.conversacionService.agregarMensaje(conversacion.id, { role: 'user', content: textoUsuario });
            const convActualizada = await this.conversacionService.obtener(conversacion.id);
            const historial = (convActualizada.mensajes || [])
                .slice(-MAX_HISTORY_MESSAGES)
                .map(m => ({ role: m.role, content: m.content }));
            const resultado = await this.llamarClaudeConHerramientas(agente, historial, clienteId, from, conversacion.id);
            if (!resultado)
                return;
            await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: resultado.texto });
            await this.agenteService.incrementarContadores(agente.id, 1);
            await this.waService.enviarTexto(from, resultado.texto, config);
            if (resultado.serviciosLista?.length) {
                this.waService.enviarListaServicios(from, resultado.serviciosLista, config)
                    .catch(e => this.logger.warn(`[WA] Lista interactiva: ${e.message}`));
            }
            this.logger.log(`[WA] Respuesta enviada a ${from}: "${resultado.texto.slice(0, 80)}"`);
            const apiKeyConfig = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY').catch(() => null);
            if (apiKeyConfig?.valor && !apiKeyConfig.valor.includes('•')) {
                const convFinal = await this.conversacionService.obtener(conversacion.id).catch(() => null);
                if (convFinal) {
                    const msgs = (convFinal.mensajes || []).map(m => ({ role: m.role, content: m.content }));
                    this.calificacionBg.calificar(conversacion.id, msgs, clienteId, apiKeyConfig.valor, agente.modelo)
                        .catch(e => this.logger.warn(`[Calificacion] ${e.message}`));
                }
            }
        }
        catch (err) {
            this.logger.error(`[WA] Error procesando mensaje de ${from}: ${err.message}`);
        }
    }
    async procesarMensajeDueno(from, texto, clienteId, config) {
        const apiKeyConfig = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY').catch(() => null);
        const apiKey = apiKeyConfig?.valor;
        if (!apiKey || apiKey.includes('•')) {
            this.logger.error('[WA-Dueño] ANTHROPIC_API_KEY no configurada');
            return;
        }
        const promptCfg = await this.confClienteService.obtenerPorClave(clienteId, 'OWNER_SYSTEM_PROMPT').catch(() => null);
        const systemPrompt = promptCfg?.valor ||
            `Eres el asistente personal del dueño del negocio. Proporciona información precisa sobre ventas, inventario, finanzas y logística usando las herramientas disponibles. Responde de forma clara, estructurada y en español. Incluye números concretos siempre que sea posible.`;
        const toolDefs = this.bizIntelTools.getToolDefs();
        const messages = [{ role: 'user', content: texto }];
        for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
            try {
                const res = await axios_1.default.post(ANTHROPIC_API, {
                    model: 'claude-haiku-4-5',
                    max_tokens: 1024,
                    system: systemPrompt,
                    messages,
                    tools: toolDefs,
                }, {
                    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
                });
                const data = res.data;
                if (data.stop_reason === 'end_turn') {
                    const textBlock = data.content?.find((b) => b.type === 'text');
                    if (textBlock?.text) {
                        await this.waService.enviarTexto(from, textBlock.text, config);
                        this.logger.log(`[WA-Dueño] Respuesta enviada: "${textBlock.text.slice(0, 80)}"`);
                    }
                    return;
                }
                if (data.stop_reason === 'tool_use') {
                    const toolUses = data.content.filter((b) => b.type === 'tool_use');
                    this.logger.log(`[WA-Dueño] Herramientas: ${toolUses.map((b) => b.name).join(', ')}`);
                    const toolResults = await Promise.all(toolUses.map(async (tu) => {
                        const result = await this.bizIntelTools.ejecutar(tu.name, tu.input || {}, clienteId);
                        return { type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(result) };
                    }));
                    messages.push({ role: 'assistant', content: data.content });
                    messages.push({ role: 'user', content: toolResults });
                    continue;
                }
                break;
            }
            catch (err) {
                this.logger.error(`[WA-Dueño] Error iter ${i}: ${err?.response?.data?.error?.message || err.message}`);
                return;
            }
        }
    }
    async llamarClaudeConHerramientas(agente, mensajesIniciales, clienteId, from, conversacionId) {
        const apiKeyConfig = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY');
        const apiKey = apiKeyConfig?.valor;
        if (!apiKey || apiKey.includes('•')) {
            this.logger.error('[WA] ANTHROPIC_API_KEY no configurada para este cliente');
            return null;
        }
        const cliente = await this.clienteService.obtener(clienteId);
        const nombreEmpresa = cliente?.nombre || agente.nombre;
        const rawPrompt = agente.systemPrompt ||
            `Eres ${agente.nombre}, un asistente IA ${agente.tono || 'profesional'}. Responde en ${agente.idioma || 'español'} de forma concisa y útil.`;
        const systemPrompt = rawPrompt.replace(/\[NOMBRE_DEL_CONSULTORIO\]/g, nombreEmpresa);
        const clinicaToolDefs = await this.clinicaTools.getToolDefs(clienteId);
        const agentToolDefs = await this.agentTools.getToolDefs(agente.id);
        const agentToolNames = await this.agentTools.getNombres(agente.id);
        const allToolDefs = [...(clinicaToolDefs || []), ...agentToolDefs];
        const effectiveSystemPrompt = clinicaToolDefs
            ? systemPrompt + await this.clinicaTools.getSystemAddendum(clienteId)
            : systemPrompt;
        const effectiveMaxTokens = allToolDefs.length > 0
            ? Math.max(agente.maxTokens || 1024, 1024)
            : (agente.maxTokens || 512);
        const messages = [...mensajesIniciales];
        let serviciosLista;
        for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
            try {
                const payload = {
                    model: agente.modelo || 'claude-haiku-4-5',
                    max_tokens: effectiveMaxTokens,
                    system: effectiveSystemPrompt,
                    messages,
                };
                if (allToolDefs.length > 0)
                    payload.tools = allToolDefs;
                const res = await axios_1.default.post(ANTHROPIC_API, payload, {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json',
                    },
                });
                const data = res.data;
                const stopReason = data.stop_reason;
                if (stopReason === 'end_turn') {
                    const textBlock = data.content?.find((b) => b.type === 'text');
                    const texto = textBlock?.text;
                    if (!texto)
                        return null;
                    return { texto, serviciosLista };
                }
                if (stopReason === 'tool_use') {
                    const toolUseBlocks = data.content.filter((b) => b.type === 'tool_use');
                    if (toolUseBlocks.length === 0)
                        break;
                    this.logger.log(`[WA] Claude usa ${toolUseBlocks.length} herramienta(s): ${toolUseBlocks.map((b) => b.name).join(', ')}`);
                    const toolResults = await Promise.all(toolUseBlocks.map(async (tu) => {
                        let result;
                        if (agentToolNames.has(tu.name)) {
                            result = await this.agentTools.ejecutar(tu.name, tu.input || {}, conversacionId);
                        }
                        else {
                            result = await this.clinicaTools.ejecutar(tu.name, tu.input || {}, {
                                clienteId,
                                agenteId: agente.id,
                                from,
                                conversacionId,
                            });
                        }
                        if (tu.name === 'obtener_servicios' && Array.isArray(result.servicios)) {
                            serviciosLista = result.servicios;
                        }
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
                this.logger.warn(`[WA] stop_reason inesperado: ${stopReason}`);
                break;
            }
            catch (err) {
                this.logger.error(`[WA] Error llamando a Claude (iter ${i}): ${err?.response?.data?.error?.message || err.message}`);
                return null;
            }
        }
        return null;
    }
    async resolverAgenteEfectivo(texto, defaultAgenteId, clienteId, from, canal, origen) {
        const convAbierta = await this.conversacionService.buscarAbiertaPorContacto(clienteId, from);
        if (convAbierta) {
            this.logger.log(`[WA] Stickiness: agente ${convAbierta.agenteId} de conversación abierta`);
            return convAbierta.agenteId;
        }
        const campana = await this.campanaService.resolverPorCanalYOrigen(clienteId, canal, origen);
        if (campana) {
            this.logger.log(`[WA] Campaña "${campana.nombre}" (${canal}/${origen || '*'}) → agente ${campana.agenteId}`);
            return campana.agenteId;
        }
        const reglas = await this.waService.obtenerReglas(clienteId);
        const textoLower = texto.toLowerCase();
        for (const regla of reglas) {
            if (regla.agenteId && Array.isArray(regla.palabrasClave)) {
                for (const kw of regla.palabrasClave) {
                    if (kw && textoLower.includes(kw.toLowerCase())) {
                        this.logger.log(`[WA] Routing keyword "${kw}" → agente ${regla.agenteId}`);
                        return regla.agenteId;
                    }
                }
            }
        }
        return defaultAgenteId;
    }
    extraerTexto(msg) {
        if (msg.type === 'text')
            return msg.text?.body || null;
        if (msg.type === 'button')
            return msg.button?.text || null;
        if (msg.type === 'interactive') {
            return msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || null;
        }
        return null;
    }
    async encontrarOCrearConversacion(from, contactName, agenteId, clienteId) {
        const existentes = await this.conversacionService.listar(clienteId, agenteId);
        const delContacto = existentes.filter(c => c.contacto === from && c.canal === 'whatsapp');
        const abierta = delContacto.find(c => c.estadoConversacion !== 'resuelto' && c.estadoConversacion !== 'cerrado');
        if (abierta)
            return abierta;
        const cerrada = delContacto[0];
        if (cerrada) {
            await this.conversacionService.actualizarEstado(cerrada.id, 'abierto');
            this.logger.log(`[WA] Conversación ${cerrada.id} reabierta para ${from}`);
            return { ...cerrada, estadoConversacion: 'abierto' };
        }
        return this.conversacionService.crear({
            agenteId,
            contacto: from,
            canal: 'whatsapp',
            etiquetas: [],
            notas: contactName !== from ? `Nombre: ${contactName}` : undefined,
        }, constants_1.USUARIO_SISTEMA, clienteId);
    }
};
WhatsappWebhookService = WhatsappWebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService,
        conversacion_service_1.ConversacionService,
        agente_service_1.AgenteService,
        configuracion_cliente_service_1.ConfiguracionClienteService,
        cliente_service_1.ClienteService,
        clinica_tools_service_1.ClinicaToolsService,
        calificacion_background_service_1.CalificacionBackgroundService,
        campana_service_1.CampanaService,
        agent_tools_service_1.AgentToolsService,
        biz_intel_tools_service_1.BizIntelToolsService,
        admin_gerente_service_1.AdminGerenteService,
        whatsapp_flows_service_1.WhatsappFlowsService])
], WhatsappWebhookService);
exports.WhatsappWebhookService = WhatsappWebhookService;
//# sourceMappingURL=whatsapp-webhook.service.js.map