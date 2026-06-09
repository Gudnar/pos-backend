"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BizIntelModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const venta_entity_1 = require("../ventas/entity/venta.entity");
const lote_entity_1 = require("../lotes/entity/lote.entity");
const ingreso_entity_1 = require("../ingresos/entity/ingreso.entity");
const gasto_entity_1 = require("../gastos/entity/gasto.entity");
const fuente_entity_1 = require("../fuentes/entity/fuente.entity");
const movimiento_fuente_entity_1 = require("../fuentes/entity/movimiento-fuente.entity");
const producto_entity_1 = require("../productos/entity/producto.entity");
const orden_importacion_entity_1 = require("../logistica-ordenes/entity/orden-importacion.entity");
const biz_intel_tools_service_1 = require("./service/biz-intel-tools.service");
let BizIntelModule = class BizIntelModule {
};
BizIntelModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                venta_entity_1.Venta, lote_entity_1.Lote, ingreso_entity_1.Ingreso, gasto_entity_1.Gasto, fuente_entity_1.Fuente, movimiento_fuente_entity_1.MovimientoFuente, producto_entity_1.Producto, orden_importacion_entity_1.OrdenImportacion,
            ]),
        ],
        providers: [biz_intel_tools_service_1.BizIntelToolsService],
        exports: [biz_intel_tools_service_1.BizIntelToolsService],
    })
], BizIntelModule);
exports.BizIntelModule = BizIntelModule;
//# sourceMappingURL=biz-intel.module.js.map