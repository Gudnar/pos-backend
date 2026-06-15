"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGerenteModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const usuario_entity_1 = require("../usuario/entity/usuario.entity");
const producto_entity_1 = require("../productos/entity/producto.entity");
const lote_entity_1 = require("../lotes/entity/lote.entity");
const movimiento_stock_entity_1 = require("../movimientos-stock/entity/movimiento-stock.entity");
const venta_entity_1 = require("../ventas/entity/venta.entity");
const detalle_venta_entity_1 = require("../ventas/entity/detalle-venta.entity");
const orden_importacion_entity_1 = require("../logistica-ordenes/entity/orden-importacion.entity");
const fuente_entity_1 = require("../fuentes/entity/fuente.entity");
const movimiento_fuente_entity_1 = require("../fuentes/entity/movimiento-fuente.entity");
const item_orden_importacion_entity_1 = require("../logistica-ordenes/entity/item-orden-importacion.entity");
const pago_proveedor_importacion_entity_1 = require("../logistica-ordenes/entity/pago-proveedor-importacion.entity");
const gasto_logistica_entity_1 = require("../logistica-ordenes/entity/gasto-logistica.entity");
const moneda_entity_1 = require("../logistica-monedas/entity/moneda.entity");
const caja_entity_1 = require("../caja/entity/caja.entity");
const caja_sesion_entity_1 = require("../caja/entity/caja-sesion.entity");
const compras_module_1 = require("../compras/compras.module");
const admin_gerente_service_1 = require("./service/admin-gerente.service");
const admin_gerente_tools_service_1 = require("./service/admin-gerente-tools.service");
const admin_gerente_fuentes_service_1 = require("./service/admin-gerente-fuentes.service");
const admin_gerente_logistica_service_1 = require("./service/admin-gerente-logistica.service");
const admin_gerente_compras_service_1 = require("./service/admin-gerente-compras.service");
const admin_gerente_caja_service_1 = require("./service/admin-gerente-caja.service");
let AdminGerenteModule = class AdminGerenteModule {
};
AdminGerenteModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                usuario_entity_1.Usuario, producto_entity_1.Producto, lote_entity_1.Lote, movimiento_stock_entity_1.MovimientoStock, venta_entity_1.Venta, detalle_venta_entity_1.DetalleVenta, orden_importacion_entity_1.OrdenImportacion,
                fuente_entity_1.Fuente, movimiento_fuente_entity_1.MovimientoFuente,
                item_orden_importacion_entity_1.ItemOrdenImportacion, pago_proveedor_importacion_entity_1.PagoProveedorImportacion, gasto_logistica_entity_1.GastoLogistica, moneda_entity_1.Moneda,
                caja_entity_1.Caja, caja_sesion_entity_1.CajaSesion,
            ]),
            compras_module_1.ComprasModule,
        ],
        providers: [
            admin_gerente_service_1.AdminGerenteService,
            admin_gerente_tools_service_1.AdminGerenteToolsService,
            admin_gerente_fuentes_service_1.AdminGerenteFuentesService,
            admin_gerente_logistica_service_1.AdminGerenteLogisticaService,
            admin_gerente_compras_service_1.AdminGerenteComprasService,
            admin_gerente_caja_service_1.AdminGerenteCajaService,
        ],
        exports: [admin_gerente_service_1.AdminGerenteService],
    })
], AdminGerenteModule);
exports.AdminGerenteModule = AdminGerenteModule;
//# sourceMappingURL=admin-gerente.module.js.map