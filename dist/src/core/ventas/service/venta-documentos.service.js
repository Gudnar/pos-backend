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
exports.VentaDocumentosService = exports.MAX_TAMANO_DOCUMENTO = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const venta_entity_1 = require("../entity/venta.entity");
const venta_documento_entity_1 = require("../entity/venta-documento.entity");
const constants_1 = require("../../../common/constants");
exports.MAX_TAMANO_DOCUMENTO = 5 * 1024 * 1024;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FIRMAS = [
    { mime: 'application/pdf', ext: 'pdf', match: b => b.subarray(0, 4).toString('latin1') === '%PDF' },
    { mime: 'image/png', ext: 'png', match: b => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
    { mime: 'image/jpeg', ext: 'jpg', match: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
    { mime: 'image/webp', ext: 'webp', match: b => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' },
];
let VentaDocumentosService = class VentaDocumentosService {
    constructor(ventaRepo, docRepo) {
        this.ventaRepo = ventaRepo;
        this.docRepo = docRepo;
        this.baseDir = path.resolve(process.env.UPLOADS_DIR || 'uploads');
    }
    async listar(clienteId, ventaId) {
        await this.obtenerVenta(clienteId, ventaId);
        return this.docRepo.find({
            where: { clienteId, ventaId, estado: constants_1.Status.ACTIVE },
            order: { fechaCreacion: 'ASC' },
        });
    }
    async tiposPorVenta(clienteId, ventaIds) {
        const mapa = new Map();
        if (!ventaIds.length)
            return mapa;
        const docs = await this.docRepo.find({
            select: ['ventaId', 'tipo'],
            where: { clienteId, ventaId: (0, typeorm_2.In)(ventaIds), estado: constants_1.Status.ACTIVE },
        });
        for (const d of docs)
            mapa.set(d.ventaId, [...(mapa.get(d.ventaId) || []), d.tipo]);
        return mapa;
    }
    async subir(clienteId, ventaId, tipo, file, usuarioId) {
        this.validarTipo(tipo);
        const venta = await this.obtenerVenta(clienteId, ventaId);
        if (venta.estadoVenta === venta_entity_1.EstadoVenta.ANULADA)
            throw new common_1.BadRequestException('No se pueden subir documentos a una venta anulada');
        const archivo = await this.guardarArchivo(clienteId, ventaId, tipo.toLowerCase(), file);
        if (!venta_documento_entity_1.TIPOS_DOCUMENTO_MULTIPLES.includes(tipo)) {
            const anterior = await this.buscar(clienteId, ventaId, tipo);
            if (anterior)
                await this.darDeBaja(anterior, usuarioId);
        }
        const doc = this.docRepo.create({
            clienteId,
            ventaId,
            tipo,
            nombreOriginal: archivo.nombreOriginal,
            mimeType: archivo.mimeType,
            tamano: archivo.tamano,
            rutaArchivo: archivo.rutaRelativa,
            estado: constants_1.Status.ACTIVE,
            usuarioCreacion: usuarioId,
        });
        const { rutaArchivo, ...guardado } = await this.docRepo.save(doc);
        return guardado;
    }
    async obtenerArchivo(clienteId, ventaId, ref) {
        await this.obtenerVenta(clienteId, ventaId);
        const doc = await this.buscar(clienteId, ventaId, ref);
        if (!doc)
            throw new common_1.NotFoundException('Documento no encontrado');
        return { doc, rutaAbsoluta: await this.rutaExistente(doc.rutaArchivo) };
    }
    async eliminar(clienteId, ventaId, ref, usuarioId) {
        await this.obtenerVenta(clienteId, ventaId);
        const doc = await this.buscar(clienteId, ventaId, ref);
        if (!doc)
            throw new common_1.NotFoundException('Documento no encontrado');
        await this.darDeBaja(doc, usuarioId);
    }
    async guardarArchivo(clienteId, ventaId, prefijo, file) {
        if (!file?.buffer?.length)
            throw new common_1.BadRequestException('Archivo requerido');
        if (file.size > exports.MAX_TAMANO_DOCUMENTO)
            throw new common_1.BadRequestException('El archivo supera el tamaño máximo de 5 MB');
        const firma = FIRMAS.find(f => f.match(file.buffer));
        if (!firma)
            throw new common_1.BadRequestException('Formato no permitido. Solo se aceptan PDF, JPG, PNG o WEBP');
        const rutaRelativa = path.join('ventas', String(clienteId), ventaId, `${prefijo}-${(0, crypto_1.randomUUID)()}.${firma.ext}`);
        const rutaAbsoluta = path.join(this.baseDir, rutaRelativa);
        await fs_1.promises.mkdir(path.dirname(rutaAbsoluta), { recursive: true });
        await fs_1.promises.writeFile(rutaAbsoluta, file.buffer);
        return { rutaRelativa, mimeType: firma.mime, nombreOriginal: this.limpiarNombre(file.originalname), tamano: file.size };
    }
    async rutaExistente(rutaRelativa) {
        const rutaAbsoluta = path.join(this.baseDir, rutaRelativa);
        try {
            await fs_1.promises.access(rutaAbsoluta);
        }
        catch {
            throw new common_1.NotFoundException('El archivo no está disponible en el servidor');
        }
        return rutaAbsoluta;
    }
    async borrarArchivo(rutaRelativa) {
        if (rutaRelativa)
            await fs_1.promises.unlink(path.join(this.baseDir, rutaRelativa)).catch(() => undefined);
    }
    async darDeBaja(doc, usuarioId) {
        doc.estado = constants_1.Status.INACTIVE;
        doc.transaccion = constants_1.Transacccion.ELIMINAR;
        doc.usuarioModificacion = usuarioId;
        await this.docRepo.save(doc);
        await this.borrarArchivo(doc.rutaArchivo);
    }
    buscar(clienteId, ventaId, ref) {
        const porId = UUID_RE.test(ref);
        if (!porId)
            this.validarTipo(ref);
        return this.docRepo.createQueryBuilder('d')
            .addSelect('d.rutaArchivo')
            .where('d.clienteId = :clienteId', { clienteId })
            .andWhere('d.ventaId = :ventaId', { ventaId })
            .andWhere(porId ? 'd.id = :ref' : 'd.tipo = :ref', { ref })
            .andWhere('d.estado = :est', { est: constants_1.Status.ACTIVE })
            .orderBy('d.fechaCreacion', 'ASC')
            .getOne();
    }
    async obtenerVenta(clienteId, ventaId) {
        const venta = await this.ventaRepo.findOne({ where: { id: ventaId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!venta)
            throw new common_1.NotFoundException('Venta no encontrada');
        return venta;
    }
    validarTipo(tipo) {
        if (!venta_documento_entity_1.TIPOS_DOCUMENTO_VENTA.includes(tipo))
            throw new common_1.BadRequestException('Tipo de documento no válido');
    }
    limpiarNombre(nombre) {
        const decodificado = Buffer.from(nombre || 'archivo', 'latin1').toString('utf8');
        return decodificado.replace(/[\\/\r\n"]/g, '_').slice(0, 255);
    }
};
VentaDocumentosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(venta_entity_1.Venta)),
    __param(1, (0, typeorm_1.InjectRepository)(venta_documento_entity_1.VentaDocumento)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], VentaDocumentosService);
exports.VentaDocumentosService = VentaDocumentosService;
//# sourceMappingURL=venta-documentos.service.js.map