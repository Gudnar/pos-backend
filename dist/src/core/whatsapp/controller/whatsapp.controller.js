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
var WhatsappController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const whatsapp_service_1 = require("../service/whatsapp.service");
const whatsapp_webhook_service_1 = require("../service/whatsapp-webhook.service");
const configuracion_cliente_service_1 = require("../../cliente/service/configuracion-cliente.service");
const fuentes_service_1 = require("../../fuentes/service/fuentes.service");
const whatsapp_dto_1 = require("../dto/whatsapp.dto");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
let WhatsappController = WhatsappController_1 = class WhatsappController {
    constructor(waService, webhookService, confClienteService, fuentesService) {
        this.waService = waService;
        this.webhookService = webhookService;
        this.confClienteService = confClienteService;
        this.fuentesService = fuentesService;
        this.logger = new common_1.Logger(WhatsappController_1.name);
    }
    async verificarWebhook(query, res) {
        const mode = query['hub.mode'];
        const token = query['hub.verify_token'];
        const challenge = query['hub.challenge'];
        const clienteId = await this.confClienteService.resolverClientePorVerifyToken(token);
        if (mode === 'subscribe' && clienteId) {
            this.logger.log(`[WA] Webhook verificado para cliente ${clienteId}`);
            res.status(200).send(challenge);
        }
        else {
            this.logger.warn(`[WA] Verificación fallida — token: ${token}`);
            res.sendStatus(403);
        }
    }
    async recibirWebhook(body) {
        if (body.object !== 'whatsapp_business_account')
            return 'EVENT_RECEIVED';
        try {
            for (const entry of body.entry || []) {
                for (const change of entry.changes || []) {
                    const value = change.value;
                    if (!value)
                        continue;
                    const phoneNumberId = value.metadata?.phone_number_id || '';
                    const contacts = value.contacts || [];
                    for (const rawMessage of (value.messages || [])) {
                        const contact = contacts.find(c => c.wa_id === rawMessage.from);
                        const displayName = contact?.profile?.name || rawMessage.from;
                        this.webhookService.procesarMensajeEntrante(rawMessage, displayName, phoneNumberId)
                            .catch(err => this.logger.error(`[WA] Error async: ${err.message}`));
                    }
                }
            }
        }
        catch (err) {
            this.logger.error(`[WA] Error procesando webhook: ${err.message}`);
        }
        return 'EVENT_RECEIVED';
    }
    async obtenerConfig(req) {
        const config = await this.waService.obtenerConfig(req.user.clienteId);
        return { ...config, accessToken: config.accessToken ? '••••••••••••••••' : '' };
    }
    async guardarConfig(dto, req) {
        await this.waService.guardarConfig(req.user.clienteId, dto, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, 'Configuración WhatsApp guardada correctamente');
    }
    async testConexion(dto) {
        return this.waService.testConexion(dto.accessToken, dto.phoneNumberId);
    }
    async obtenerEstado(req) {
        return this.waService.obtenerEstadisticas(req.user.clienteId);
    }
    async enviarMensaje(dto, req) {
        const config = await this.waService.obtenerConfig(req.user.clienteId);
        const result = await this.waService.enviarTexto(dto.celular, dto.mensaje, config);
        return new success_response_dto_1.SuccessResponseDto(result, 'Mensaje enviado');
    }
    async obtenerRouting(req) {
        const datos = await this.waService.obtenerReglas(req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async guardarRouting(body, req) {
        const reglas = Array.isArray(body) ? body : [];
        await this.waService.guardarReglas(req.user.clienteId, reglas, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, 'Reglas de enrutamiento guardadas');
    }
    async obtenerOwnerAgent(req) {
        const [phoneCfg, promptCfg] = await Promise.all([
            this.confClienteService.obtenerPorClave(req.user.clienteId, 'OWNER_WHATSAPP').catch(() => null),
            this.confClienteService.obtenerPorClave(req.user.clienteId, 'OWNER_SYSTEM_PROMPT').catch(() => null),
        ]);
        return {
            finalizado: true, mensaje: 'OK',
            datos: {
                telefono: phoneCfg?.valor || '',
                systemPrompt: promptCfg?.valor || '',
            },
        };
    }
    async guardarOwnerAgent(body, req) {
        await Promise.all([
            this.confClienteService.set(req.user.clienteId, { clave: 'OWNER_WHATSAPP', valor: body.telefono || '' }, req.user.id),
            this.confClienteService.set(req.user.clienteId, { clave: 'OWNER_SYSTEM_PROMPT', valor: body.systemPrompt || '' }, req.user.id),
        ]);
        return new success_response_dto_1.SuccessResponseDto(null, 'Configuración del asistente del dueño guardada');
    }
    async flowDataExchange(body, phoneNumberId, clienteIdParam, res) {
        const { action, screen } = body ?? {};
        this.logger.log(`[WA-Flow] action=${action} screen=${screen} phoneNumberId=${phoneNumberId}`);
        const clienteId = clienteIdParam
            || (phoneNumberId ? await this.confClienteService.resolverClientePorPhoneNumberId(phoneNumberId) : null);
        if (!clienteId) {
            res.status(400).json({ error: 'phoneNumberId no reconocido o clienteId no proporcionado' });
            return;
        }
        if (action === 'ping' || (action === 'data_exchange' && screen === 'SELECCIONAR_CUENTA_PAGO')) {
            const fuentes = await this.fuentesService.listar(clienteId);
            const cuentasFormateadas = fuentes
                .filter(f => f.activo !== false)
                .map(f => ({
                id: f.id,
                title: f.nombre,
                description: [f.banco, f.numeroCuenta].filter(Boolean).join(' · ') || f.tipo,
            }));
            res.status(200).json({
                version: '3.1',
                screen: 'SELECCIONAR_CUENTA_PAGO',
                data: {
                    cuentas_bancarias: cuentasFormateadas,
                },
            });
            return;
        }
        res.status(400).json({ error: 'Acción no soportada' });
    }
};
__decorate([
    (0, common_1.Get)('webhook'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "verificarWebhook", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "recibirWebhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('config'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "obtenerConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('config'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [whatsapp_dto_1.WhatsappConfigDto, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "guardarConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('test-connection'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [whatsapp_dto_1.TestConexionDto]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "testConexion", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "obtenerEstado", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('send'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [whatsapp_dto_1.EnviarMensajeDto, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "enviarMensaje", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('routing'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "obtenerRouting", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('routing'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "guardarRouting", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('owner-agent'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "obtenerOwnerAgent", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('owner-agent'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "guardarOwnerAgent", null);
__decorate([
    (0, common_1.Post)('flow-data-exchange'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('phoneNumberId')),
    __param(2, (0, common_1.Query)('clienteId')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "flowDataExchange", null);
WhatsappController = WhatsappController_1 = __decorate([
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService,
        whatsapp_webhook_service_1.WhatsappWebhookService,
        configuracion_cliente_service_1.ConfiguracionClienteService,
        fuentes_service_1.FuentesService])
], WhatsappController);
exports.WhatsappController = WhatsappController;
//# sourceMappingURL=whatsapp.controller.js.map