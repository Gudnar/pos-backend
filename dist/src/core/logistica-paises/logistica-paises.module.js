"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogisticaPaisesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const pais_logistica_entity_1 = require("./entity/pais-logistica.entity");
const logistica_paises_service_1 = require("./service/logistica-paises.service");
const logistica_paises_controller_1 = require("./controller/logistica-paises.controller");
let LogisticaPaisesModule = class LogisticaPaisesModule {
};
LogisticaPaisesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([pais_logistica_entity_1.PaisLogistica])],
        controllers: [logistica_paises_controller_1.LogisticaPaisesController],
        providers: [logistica_paises_service_1.LogisticaPaisesService],
        exports: [logistica_paises_service_1.LogisticaPaisesService],
    })
], LogisticaPaisesModule);
exports.LogisticaPaisesModule = LogisticaPaisesModule;
//# sourceMappingURL=logistica-paises.module.js.map