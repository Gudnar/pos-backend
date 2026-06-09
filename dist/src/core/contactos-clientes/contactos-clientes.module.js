"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactosClientesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const contacto_cliente_entity_1 = require("./entity/contacto-cliente.entity");
const contactos_clientes_service_1 = require("./service/contactos-clientes.service");
const contactos_clientes_controller_1 = require("./controller/contactos-clientes.controller");
const representantes_module_1 = require("../representantes/representantes.module");
let ContactosClientesModule = class ContactosClientesModule {
};
ContactosClientesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([contacto_cliente_entity_1.ContactoCliente]), representantes_module_1.RepresentantesModule],
        providers: [contactos_clientes_service_1.ContactosClientesService],
        controllers: [contactos_clientes_controller_1.ContactosClientesController],
        exports: [contactos_clientes_service_1.ContactosClientesService],
    })
], ContactosClientesModule);
exports.ContactosClientesModule = ContactosClientesModule;
//# sourceMappingURL=contactos-clientes.module.js.map