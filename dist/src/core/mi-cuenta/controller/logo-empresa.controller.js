"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoEmpresaController = void 0;
const common_1 = require("@nestjs/common");
const logo_empresa_service_1 = require("../service/logo-empresa.service");
let LogoEmpresaController = class LogoEmpresaController {
    constructor(svc) {
        this.svc = svc;
    }
    async ver(clienteId, archivo, res) {
        const { ruta, mime } = await this.svc.rutaPublica(clienteId, archivo);
        res.setHeader('Content-Type', mime);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.sendFile(ruta);
    }
};
__decorate([
    (0, common_1.Get)(':clienteId/:archivo'),
    __param(0, (0, common_1.Param)('clienteId')),
    __param(1, (0, common_1.Param)('archivo')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LogoEmpresaController.prototype, "ver", null);
LogoEmpresaController = __decorate([
    (0, common_1.Controller)('empresa-logo'),
    __metadata("design:paramtypes", [logo_empresa_service_1.LogoEmpresaService])
], LogoEmpresaController);
exports.LogoEmpresaController = LogoEmpresaController;
//# sourceMappingURL=logo-empresa.controller.js.map