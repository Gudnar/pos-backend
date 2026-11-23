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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentaDocumento = exports.TIPOS_DOCUMENTO_MULTIPLES = exports.TIPOS_DOCUMENTO_VENTA = exports.TipoDocumentoVenta = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
exports.TipoDocumentoVenta = {
    TABLILLA_PESAJE: 'TABLILLA_PESAJE',
    OTROS: 'OTROS',
};
exports.TIPOS_DOCUMENTO_VENTA = Object.values(exports.TipoDocumentoVenta);
exports.TIPOS_DOCUMENTO_MULTIPLES = [exports.TipoDocumentoVenta.TABLILLA_PESAJE];
let VentaDocumento = class VentaDocumento extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], VentaDocumento.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], VentaDocumento.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'venta_id', type: 'uuid' }),
    __metadata("design:type", String)
], VentaDocumento.prototype, "ventaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo', length: 30 }),
    __metadata("design:type", String)
], VentaDocumento.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre_original', length: 255 }),
    __metadata("design:type", String)
], VentaDocumento.prototype, "nombreOriginal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mime_type', length: 100 }),
    __metadata("design:type", String)
], VentaDocumento.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tamano', type: 'int' }),
    __metadata("design:type", Number)
], VentaDocumento.prototype, "tamano", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ruta_archivo', length: 500, select: false }),
    __metadata("design:type", String)
], VentaDocumento.prototype, "rutaArchivo", void 0);
VentaDocumento = __decorate([
    (0, typeorm_1.Entity)({ name: 'venta_documento', schema: process.env.DB_SCHEMA || 'public' }),
    (0, typeorm_1.Index)(['ventaId', 'tipo']),
    __metadata("design:paramtypes", [Object])
], VentaDocumento);
exports.VentaDocumento = VentaDocumento;
//# sourceMappingURL=venta-documento.entity.js.map