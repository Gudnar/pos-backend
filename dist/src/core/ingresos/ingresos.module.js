"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngresosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ingreso_entity_1 = require("./entity/ingreso.entity");
const ingresos_service_1 = require("./service/ingresos.service");
const ingresos_controller_1 = require("./controller/ingresos.controller");
let IngresosModule = class IngresosModule {
};
IngresosModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([ingreso_entity_1.Ingreso])],
        controllers: [ingresos_controller_1.IngresosController],
        providers: [ingresos_service_1.IngresosService],
        exports: [ingresos_service_1.IngresosService],
    })
], IngresosModule);
exports.IngresosModule = IngresosModule;
//# sourceMappingURL=ingresos.module.js.map