"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookModule = void 0;
const common_1 = require("@nestjs/common");
const facebook_service_1 = require("./service/facebook.service");
const facebook_webhook_service_1 = require("./service/facebook-webhook.service");
const facebook_controller_1 = require("./controller/facebook.controller");
const cliente_module_1 = require("../cliente/cliente.module");
const conversacion_module_1 = require("../conversacion/conversacion.module");
const agente_module_1 = require("../agente/agente.module");
const campana_module_1 = require("../campana/campana.module");
const herramienta_module_1 = require("../herramienta/herramienta.module");
let FacebookModule = class FacebookModule {
};
FacebookModule = __decorate([
    (0, common_1.Module)({
        imports: [cliente_module_1.ClienteModule, conversacion_module_1.ConversacionModule, agente_module_1.AgenteModule, campana_module_1.CampanaModule, herramienta_module_1.HerramientaModule],
        controllers: [facebook_controller_1.FacebookController],
        providers: [facebook_service_1.FacebookService, facebook_webhook_service_1.FacebookWebhookService],
        exports: [facebook_service_1.FacebookService],
    })
], FacebookModule);
exports.FacebookModule = FacebookModule;
//# sourceMappingURL=facebook.module.js.map