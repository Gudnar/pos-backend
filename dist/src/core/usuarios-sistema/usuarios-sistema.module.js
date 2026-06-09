"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosSistemaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const usuario_entity_1 = require("../usuario/entity/usuario.entity");
const usuario_sucursal_entity_1 = require("../sucursales/entity/usuario-sucursal.entity");
const sucursal_entity_1 = require("../sucursales/entity/sucursal.entity");
const usuarios_sistema_service_1 = require("./service/usuarios-sistema.service");
const usuarios_sistema_controller_1 = require("./controller/usuarios-sistema.controller");
let UsuariosSistemaModule = class UsuariosSistemaModule {
};
UsuariosSistemaModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([usuario_entity_1.Usuario, usuario_sucursal_entity_1.UsuarioSucursal, sucursal_entity_1.Sucursal])],
        controllers: [usuarios_sistema_controller_1.UsuariosSistemaController],
        providers: [usuarios_sistema_service_1.UsuariosSistemaService],
    })
], UsuariosSistemaModule);
exports.UsuariosSistemaModule = UsuariosSistemaModule;
//# sourceMappingURL=usuarios-sistema.module.js.map