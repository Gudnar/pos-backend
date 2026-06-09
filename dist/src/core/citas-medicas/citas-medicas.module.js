"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitasMedicasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cita_entity_1 = require("./entity/cita.entity");
const paciente_entity_1 = require("../pacientes/entity/paciente.entity");
const cliente_entity_1 = require("../cliente/entity/cliente.entity");
const citas_medicas_service_1 = require("./service/citas-medicas.service");
const citas_medicas_controller_1 = require("./controller/citas-medicas.controller");
const especialista_module_1 = require("../especialista/especialista.module");
let CitasMedicasModule = class CitasMedicasModule {
};
CitasMedicasModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([cita_entity_1.Cita, paciente_entity_1.Paciente, cliente_entity_1.Cliente]), especialista_module_1.EspecialistaModule],
        providers: [citas_medicas_service_1.CitasMedicasService],
        controllers: [citas_medicas_controller_1.CitasMedicasController],
        exports: [citas_medicas_service_1.CitasMedicasService, especialista_module_1.EspecialistaModule],
    })
], CitasMedicasModule);
exports.CitasMedicasModule = CitasMedicasModule;
//# sourceMappingURL=citas-medicas.module.js.map