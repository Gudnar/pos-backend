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
var FacebookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const facebook_service_1 = require("../service/facebook.service");
const facebook_webhook_service_1 = require("../service/facebook-webhook.service");
const configuracion_cliente_service_1 = require("../../cliente/service/configuracion-cliente.service");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
let FacebookController = FacebookController_1 = class FacebookController {
    constructor(fbService, webhookService, confClienteService) {
        this.fbService = fbService;
        this.webhookService = webhookService;
        this.confClienteService = confClienteService;
        this.logger = new common_1.Logger(FacebookController_1.name);
    }
    async verificarWebhook(query, res) {
        const mode = query['hub.mode'];
        const token = query['hub.verify_token'];
        const challenge = query['hub.challenge'];
        const clienteId = await this.confClienteService.resolverClientePorFbVerifyToken(token);
        if (mode === 'subscribe' && clienteId) {
            this.logger.log(`[FB] Webhook verificado para cliente ${clienteId}`);
            res.status(200).send(challenge);
        }
        else {
            this.logger.warn(`[FB] Verificación fallida — token: ${token}`);
            res.sendStatus(403);
        }
    }
    async recibirWebhook(body) {
        if (body.object !== 'page')
            return 'EVENT_RECEIVED';
        try {
            for (const entry of body.entry || []) {
                const pageId = entry.id;
                this.webhookService.procesarEntrada(entry, pageId)
                    .catch(err => this.logger.error(`[FB] Error async: ${err.message}`));
            }
        }
        catch (err) {
            this.logger.error(`[FB] Error procesando webhook: ${err.message}`);
        }
        return 'EVENT_RECEIVED';
    }
    async obtenerConfig(req) {
        const config = await this.fbService.obtenerConfig(req.user.clienteId);
        return { ...config, pageAccessToken: config.pageAccessToken ? '••••••••••••••••' : '' };
    }
    async guardarConfig(body, req) {
        await this.fbService.guardarConfig(req.user.clienteId, body, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, 'Configuración Facebook guardada');
    }
    async testConexion(body) {
        return this.fbService.testConexion(body.pageAccessToken, body.pageId);
    }
    async obtenerPublicaciones(req) {
        try {
            const datos = await this.fbService.obtenerPublicaciones(req.user.clienteId);
            return new success_response_dto_1.SuccessResponseDto(datos);
        }
        catch (err) {
            return new success_response_dto_1.SuccessResponseDto([], err.message);
        }
    }
    async obtenerEstado(req) {
        const config = await this.fbService.obtenerConfig(req.user.clienteId);
        if (!config.pageAccessToken || !config.pageId) {
            return { valida: false, mensaje: 'Facebook no configurado' };
        }
        return this.fbService.testConexion(config.pageAccessToken, config.pageId);
    }
};
__decorate([
    (0, common_1.Get)('webhook'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FacebookController.prototype, "verificarWebhook", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FacebookController.prototype, "recibirWebhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('config'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FacebookController.prototype, "obtenerConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('config'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FacebookController.prototype, "guardarConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('test-connection'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FacebookController.prototype, "testConexion", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('publicaciones'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FacebookController.prototype, "obtenerPublicaciones", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FacebookController.prototype, "obtenerEstado", null);
FacebookController = FacebookController_1 = __decorate([
    (0, common_1.Controller)('facebook'),
    __metadata("design:paramtypes", [facebook_service_1.FacebookService,
        facebook_webhook_service_1.FacebookWebhookService,
        configuracion_cliente_service_1.ConfiguracionClienteService])
], FacebookController);
exports.FacebookController = FacebookController;
//# sourceMappingURL=facebook.controller.js.map