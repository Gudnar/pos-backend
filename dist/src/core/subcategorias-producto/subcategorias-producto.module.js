"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubcategoriasProductoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const subcategoria_producto_entity_1 = require("./entity/subcategoria-producto.entity");
const subcategorias_producto_service_1 = require("./service/subcategorias-producto.service");
const subcategorias_producto_controller_1 = require("./controller/subcategorias-producto.controller");
let SubcategoriasProductoModule = class SubcategoriasProductoModule {
};
SubcategoriasProductoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([subcategoria_producto_entity_1.SubcategoriaProducto])],
        controllers: [subcategorias_producto_controller_1.SubcategoriasProductoController],
        providers: [subcategorias_producto_service_1.SubcategoriasProductoService],
        exports: [subcategorias_producto_service_1.SubcategoriasProductoService],
    })
], SubcategoriasProductoModule);
exports.SubcategoriasProductoModule = SubcategoriasProductoModule;
//# sourceMappingURL=subcategorias-producto.module.js.map