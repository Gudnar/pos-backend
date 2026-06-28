"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComprasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const compra_entity_1 = require("./entity/compra.entity");
const compra_detalle_entity_1 = require("./entity/compra-detalle.entity");
const pago_proveedor_entity_1 = require("./entity/pago-proveedor.entity");
const compra_log_entity_1 = require("./entity/compra-log.entity");
const lote_entity_1 = require("../lotes/entity/lote.entity");
const movimiento_stock_entity_1 = require("../movimientos-stock/entity/movimiento-stock.entity");
const compras_service_1 = require("./service/compras.service");
const compras_controller_1 = require("./controller/compras.controller");
const fuentes_module_1 = require("../fuentes/fuentes.module");
let ComprasModule = class ComprasModule {
};
ComprasModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([compra_entity_1.Compra, compra_detalle_entity_1.CompraDetalle, pago_proveedor_entity_1.PagoProveedor, compra_log_entity_1.CompraLog, lote_entity_1.Lote, movimiento_stock_entity_1.MovimientoStock]),
            fuentes_module_1.FuentesModule,
        ],
        providers: [compras_service_1.ComprasService],
        controllers: [compras_controller_1.ComprasController],
        exports: [compras_service_1.ComprasService],
    })
], ComprasModule);
exports.ComprasModule = ComprasModule;
//# sourceMappingURL=compras.module.js.map