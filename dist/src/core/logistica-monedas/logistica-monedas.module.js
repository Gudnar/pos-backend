"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogisticaMonedasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const moneda_entity_1 = require("./entity/moneda.entity");
const logistica_monedas_service_1 = require("./service/logistica-monedas.service");
const logistica_monedas_controller_1 = require("./controller/logistica-monedas.controller");
let LogisticaMonedasModule = class LogisticaMonedasModule {
};
LogisticaMonedasModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([moneda_entity_1.Moneda])],
        controllers: [logistica_monedas_controller_1.LogisticaMonedasController],
        providers: [logistica_monedas_service_1.LogisticaMonedasService],
        exports: [logistica_monedas_service_1.LogisticaMonedasService],
    })
], LogisticaMonedasModule);
exports.LogisticaMonedasModule = LogisticaMonedasModule;
//# sourceMappingURL=logistica-monedas.module.js.map