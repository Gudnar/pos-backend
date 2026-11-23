"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoEmpresaService = exports.MAX_TAMANO_LOGO = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const cliente_entity_1 = require("../../cliente/entity/cliente.entity");
const constants_1 = require("../../../common/constants");
exports.MAX_TAMANO_LOGO = 2 * 1024 * 1024;
const FIRMAS = [
    { mime: 'image/png', ext: 'png', match: b => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
    { mime: 'image/jpeg', ext: 'jpg', match: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
    { mime: 'image/webp', ext: 'webp', match: b => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' },
];
const MIME_POR_EXT = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
const PREFIJO_URL = 'empresa-logo';
let LogoEmpresaService = class LogoEmpresaService {
    constructor(clienteRepo) {
        this.clienteRepo = clienteRepo;
        this.baseDir = path.resolve(process.env.UPLOADS_DIR || 'uploads');
    }
    async subir(clienteId, file, usuarioId) {
        if (!file?.buffer?.length)
            throw new common_1.BadRequestException('Archivo requerido');
        if (file.size > exports.MAX_TAMANO_LOGO)
            throw new common_1.BadRequestException('El logo supera el tamaño máximo de 2 MB');
        const firma = FIRMAS.find(f => f.match(file.buffer));
        if (!firma)
            throw new common_1.BadRequestException('Formato no permitido. Usa PNG, JPG o WEBP');
        const cliente = await this.obtenerCliente(clienteId);
        const archivo = `logo-${(0, crypto_1.randomUUID)()}.${firma.ext}`;
        const dir = path.join(this.baseDir, 'empresas', String(clienteId));
        await fs_1.promises.mkdir(dir, { recursive: true });
        await fs_1.promises.writeFile(path.join(dir, archivo), file.buffer);
        const anterior = cliente.logoUrl;
        const logoUrl = `${PREFIJO_URL}/${clienteId}/${archivo}`;
        await this.clienteRepo.update({ id: cliente.id }, { logoUrl, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion: usuarioId });
        await this.borrarArchivoPropio(clienteId, anterior);
        return { logoUrl };
    }
    async quitar(clienteId, usuarioId) {
        const cliente = await this.obtenerCliente(clienteId);
        await this.clienteRepo.update({ id: cliente.id }, { logoUrl: null, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion: usuarioId });
        await this.borrarArchivoPropio(clienteId, cliente.logoUrl);
    }
    async rutaPublica(clienteId, archivo) {
        if (!/^\d+$/.test(clienteId) || !/^logo-[0-9a-f-]{36}\.(png|jpg|webp)$/.test(archivo))
            throw new common_1.NotFoundException();
        const ruta = path.join(this.baseDir, 'empresas', clienteId, archivo);
        try {
            await fs_1.promises.access(ruta);
        }
        catch {
            throw new common_1.NotFoundException();
        }
        return { ruta, mime: MIME_POR_EXT[archivo.split('.').pop()] };
    }
    async obtenerCliente(clienteId) {
        const cliente = await this.clienteRepo.findOne({ where: { id: clienteId, estado: constants_1.Status.ACTIVE } });
        if (!cliente)
            throw new common_1.NotFoundException('Empresa no encontrada');
        return cliente;
    }
    async borrarArchivoPropio(clienteId, logoUrl) {
        const prefijo = `${PREFIJO_URL}/${clienteId}/`;
        if (!logoUrl || !logoUrl.startsWith(prefijo))
            return;
        const archivo = logoUrl.slice(prefijo.length);
        if (!/^logo-[0-9a-f-]{36}\.(png|jpg|webp)$/.test(archivo))
            return;
        await fs_1.promises.unlink(path.join(this.baseDir, 'empresas', String(clienteId), archivo)).catch(() => undefined);
    }
};
LogoEmpresaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cliente_entity_1.Cliente)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LogoEmpresaService);
exports.LogoEmpresaService = LogoEmpresaService;
//# sourceMappingURL=logo-empresa.service.js.map