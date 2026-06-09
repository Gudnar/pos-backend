"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuentesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const fuente_entity_1 = require("./entity/fuente.entity");
const movimiento_fuente_entity_1 = require("./entity/movimiento-fuente.entity");
const fuentes_service_1 = require("./service/fuentes.service");
const movimientos_fuente_service_1 = require("./service/movimientos-fuente.service");
const fuentes_controller_1 = require("./controller/fuentes.controller");
let FuentesModule = class FuentesModule {
};
FuentesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([fuente_entity_1.Fuente, movimiento_fuente_entity_1.MovimientoFuente])],
        controllers: [fuentes_controller_1.FuentesController],
        providers: [fuentes_service_1.FuentesService, movimientos_fuente_service_1.MovimientosFuenteService],
        exports: [fuentes_service_1.FuentesService, movimientos_fuente_service_1.MovimientosFuenteService],
    })
], FuentesModule);
exports.FuentesModule = FuentesModule;
//# sourceMappingURL=fuentes.module.js.map