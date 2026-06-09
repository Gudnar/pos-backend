"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriasProductoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const categoria_producto_entity_1 = require("./entity/categoria-producto.entity");
const categorias_producto_service_1 = require("./service/categorias-producto.service");
const categorias_producto_controller_1 = require("./controller/categorias-producto.controller");
let CategoriasProductoModule = class CategoriasProductoModule {
};
CategoriasProductoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([categoria_producto_entity_1.CategoriaProducto])],
        controllers: [categorias_producto_controller_1.CategoriasProductoController],
        providers: [categorias_producto_service_1.CategoriasProductoService],
        exports: [categorias_producto_service_1.CategoriasProductoService],
    })
], CategoriasProductoModule);
exports.CategoriasProductoModule = CategoriasProductoModule;
//# sourceMappingURL=categorias-producto.module.js.map