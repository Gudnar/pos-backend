"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogisticaOrdenesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const orden_importacion_entity_1 = require("./entity/orden-importacion.entity");
const item_orden_importacion_entity_1 = require("./entity/item-orden-importacion.entity");
const pago_proveedor_importacion_entity_1 = require("./entity/pago-proveedor-importacion.entity");
const gasto_logistica_entity_1 = require("./entity/gasto-logistica.entity");
const precio_producto_entity_1 = require("../productos/entity/precio-producto.entity");
const lotes_module_1 = require("../lotes/lotes.module");
const fuentes_module_1 = require("../fuentes/fuentes.module");
const ordenes_importacion_service_1 = require("./service/ordenes-importacion.service");
const items_orden_service_1 = require("./service/items-orden.service");
const pagos_proveedor_service_1 = require("./service/pagos-proveedor.service");
const gastos_logistica_service_1 = require("./service/gastos-logistica.service");
const logistica_ordenes_controller_1 = require("./controller/logistica-ordenes.controller");
let LogisticaOrdenesModule = class LogisticaOrdenesModule {
};
LogisticaOrdenesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                orden_importacion_entity_1.OrdenImportacion,
                item_orden_importacion_entity_1.ItemOrdenImportacion,
                pago_proveedor_importacion_entity_1.PagoProveedorImportacion,
                gasto_logistica_entity_1.GastoLogistica,
                precio_producto_entity_1.PrecioProducto,
            ]),
            lotes_module_1.LotesModule,
            fuentes_module_1.FuentesModule,
        ],
        controllers: [logistica_ordenes_controller_1.LogisticaOrdenesController],
        providers: [ordenes_importacion_service_1.OrdenesImportacionService, items_orden_service_1.ItemsOrdenService, pagos_proveedor_service_1.PagosProveedorService, gastos_logistica_service_1.GastosLogisticaService],
        exports: [ordenes_importacion_service_1.OrdenesImportacionService],
    })
], LogisticaOrdenesModule);
exports.LogisticaOrdenesModule = LogisticaOrdenesModule;
//# sourceMappingURL=logistica-ordenes.module.js.map