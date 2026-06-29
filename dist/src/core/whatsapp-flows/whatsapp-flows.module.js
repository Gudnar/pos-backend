"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappFlowsModule = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_flows_controller_1 = require("./controller/whatsapp-flows.controller");
const whatsapp_flows_service_1 = require("./service/whatsapp-flows.service");
const cliente_module_1 = require("../cliente/cliente.module");
const ingresos_module_1 = require("../ingresos/ingresos.module");
const gastos_module_1 = require("../gastos/gastos.module");
let WhatsappFlowsModule = class WhatsappFlowsModule {
};
WhatsappFlowsModule = __decorate([
    (0, common_1.Module)({
        imports: [cliente_module_1.ClienteModule, ingresos_module_1.IngresosModule, gastos_module_1.GastosModule],
        controllers: [whatsapp_flows_controller_1.WhatsappFlowsController],
        providers: [whatsapp_flows_service_1.WhatsappFlowsService],
        exports: [whatsapp_flows_service_1.WhatsappFlowsService],
    })
], WhatsappFlowsModule);
exports.WhatsappFlowsModule = WhatsappFlowsModule;
//# sourceMappingURL=whatsapp-flows.module.js.map