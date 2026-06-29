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
var WhatsappFlowsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappFlowsController = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_flows_service_1 = require("../service/whatsapp-flows.service");
const configuracion_cliente_service_1 = require("../../cliente/service/configuracion-cliente.service");
let WhatsappFlowsController = WhatsappFlowsController_1 = class WhatsappFlowsController {
    constructor(flowsService, confClienteService) {
        this.flowsService = flowsService;
        this.confClienteService = confClienteService;
        this.logger = new common_1.Logger(WhatsappFlowsController_1.name);
    }
    async manejarFlow(body, clienteIdParam, phoneNumberId, res) {
        try {
            const clienteId = clienteIdParam
                || (phoneNumberId ? await this.confClienteService.resolverClientePorPhoneNumberId(phoneNumberId) : null);
            if (!clienteId) {
                this.logger.error('[FLOW] No se pudo identificar el cliente — falta clienteId o phoneNumberId');
                res.sendStatus(400);
                return;
            }
            const privateKey = await this.flowsService.obtenerClavePrivada(clienteId);
            if (!privateKey) {
                this.logger.error(`[FLOW] WA_FLOW_PRIVATE_KEY no configurada para cliente ${clienteId}`);
                res.sendStatus(500);
                return;
            }
            const { payload, aesKey, iv } = this.flowsService.desencriptarRequest(body, privateKey);
            const responseData = await this.flowsService.procesarAccion(payload, clienteId);
            const encrypted = this.flowsService.encriptarResponse(responseData, aesKey, iv);
            res.set('Content-Type', 'text/plain').send(encrypted);
        }
        catch (err) {
            this.logger.error(`[FLOW] Error procesando flow: ${err.message}`);
            res.sendStatus(500);
        }
    }
};
__decorate([
    (0, common_1.Post)('flow'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('clienteId')),
    __param(2, (0, common_1.Query)('phoneNumberId')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], WhatsappFlowsController.prototype, "manejarFlow", null);
WhatsappFlowsController = WhatsappFlowsController_1 = __decorate([
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [whatsapp_flows_service_1.WhatsappFlowsService,
        configuracion_cliente_service_1.ConfiguracionClienteService])
], WhatsappFlowsController);
exports.WhatsappFlowsController = WhatsappFlowsController;
//# sourceMappingURL=whatsapp-flows.controller.js.map