"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const producto_entity_1 = require("./entity/producto.entity");
const precio_producto_entity_1 = require("./entity/precio-producto.entity");
const precio_promocional_entity_1 = require("./entity/precio-promocional.entity");
const presentacion_producto_entity_1 = require("./entity/presentacion-producto.entity");
const categoria_producto_entity_1 = require("../categorias-producto/entity/categoria-producto.entity");
const subcategoria_producto_entity_1 = require("../subcategorias-producto/entity/subcategoria-producto.entity");
const unidad_medida_entity_1 = require("../unidades-medida/entity/unidad-medida.entity");
const productos_service_1 = require("./service/productos.service");
const precios_service_1 = require("./service/precios.service");
const importexport_service_1 = require("./service/importexport.service");
const productos_controller_1 = require("./controller/productos.controller");
let ProductosModule = class ProductosModule {
};
ProductosModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                producto_entity_1.Producto, precio_producto_entity_1.PrecioProducto, precio_promocional_entity_1.PrecioPromocional, presentacion_producto_entity_1.PresentacionProducto,
                categoria_producto_entity_1.CategoriaProducto, subcategoria_producto_entity_1.SubcategoriaProducto, unidad_medida_entity_1.UnidadMedida,
            ]),
        ],
        controllers: [productos_controller_1.ProductosController],
        providers: [productos_service_1.ProductosService, precios_service_1.PreciosService, importexport_service_1.ImportExportService],
        exports: [productos_service_1.ProductosService, precios_service_1.PreciosService, importexport_service_1.ImportExportService],
    })
], ProductosModule);
exports.ProductosModule = ProductosModule;
//# sourceMappingURL=productos.module.js.map