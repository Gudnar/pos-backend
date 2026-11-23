"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const venta_entity_1 = require("./entity/venta.entity");
const detalle_venta_entity_1 = require("./entity/detalle-venta.entity");
const venta_documento_entity_1 = require("./entity/venta-documento.entity");
const venta_hoja_ruta_entity_1 = require("./entity/venta-hoja-ruta.entity");
const venta_comision_entity_1 = require("./entity/venta-comision.entity");
const venta_pago_entity_1 = require("./entity/venta-pago.entity");
const cotizacion_entity_1 = require("./entity/cotizacion.entity");
const cotizacion_detalle_entity_1 = require("./entity/cotizacion-detalle.entity");
const cotizaciones_service_1 = require("./service/cotizaciones.service");
const cotizaciones_controller_1 = require("./controller/cotizaciones.controller");
const fuentes_module_1 = require("../fuentes/fuentes.module");
const lote_entity_1 = require("../lotes/entity/lote.entity");
const movimiento_stock_entity_1 = require("../movimientos-stock/entity/movimiento-stock.entity");
const producto_entity_1 = require("../productos/entity/producto.entity");
const caja_sesion_entity_1 = require("../caja/entity/caja-sesion.entity");
const ingresos_module_1 = require("../ingresos/ingresos.module");
const ventas_service_1 = require("./service/ventas.service");
const venta_documentos_service_1 = require("./service/venta-documentos.service");
const venta_extras_service_1 = require("./service/venta-extras.service");
const venta_pagos_service_1 = require("./service/venta-pagos.service");
const ventas_controller_1 = require("./controller/ventas.controller");
let VentasModule = class VentasModule {
};
VentasModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([venta_entity_1.Venta, detalle_venta_entity_1.DetalleVenta, venta_documento_entity_1.VentaDocumento, venta_hoja_ruta_entity_1.VentaHojaRuta, venta_comision_entity_1.VentaComision, venta_pago_entity_1.VentaPago, cotizacion_entity_1.Cotizacion, cotizacion_detalle_entity_1.CotizacionDetalle, lote_entity_1.Lote, movimiento_stock_entity_1.MovimientoStock, producto_entity_1.Producto, caja_sesion_entity_1.CajaSesion]),
            ingresos_module_1.IngresosModule,
            fuentes_module_1.FuentesModule,
        ],
        controllers: [ventas_controller_1.VentasController, cotizaciones_controller_1.CotizacionesController],
        providers: [ventas_service_1.VentasService, venta_documentos_service_1.VentaDocumentosService, venta_extras_service_1.VentaExtrasService, venta_pagos_service_1.VentaPagosService, cotizaciones_service_1.CotizacionesService],
        exports: [ventas_service_1.VentasService],
    })
], VentasModule);
exports.VentasModule = VentasModule;
//# sourceMappingURL=ventas.module.js.map