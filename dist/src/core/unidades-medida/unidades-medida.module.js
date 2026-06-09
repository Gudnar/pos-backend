"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnidadesMedidaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const unidad_medida_entity_1 = require("./entity/unidad-medida.entity");
const unidades_medida_service_1 = require("./service/unidades-medida.service");
const unidades_medida_controller_1 = require("./controller/unidades-medida.controller");
let UnidadesMedidaModule = class UnidadesMedidaModule {
};
UnidadesMedidaModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([unidad_medida_entity_1.UnidadMedida])],
        controllers: [unidades_medida_controller_1.UnidadesMedidaController],
        providers: [unidades_medida_service_1.UnidadesMedidaService],
        exports: [unidades_medida_service_1.UnidadesMedidaService],
    })
], UnidadesMedidaModule);
exports.UnidadesMedidaModule = UnidadesMedidaModule;
//# sourceMappingURL=unidades-medida.module.js.map