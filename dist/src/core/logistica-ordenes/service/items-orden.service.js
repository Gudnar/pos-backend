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
exports.ItemsOrdenService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const item_orden_importacion_entity_1 = require("../entity/item-orden-importacion.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let ItemsOrdenService = class ItemsOrdenService {
    constructor(repo) {
        this.repo = repo;
    }
    async listar(clienteId, ordenId) {
        return this.repo.find({
            where: { ordenImportacionId: ordenId, clienteId, estado: constants_1.Status.ACTIVE },
            order: { fechaCreacion: 'ASC' },
        });
    }
    async obtener(clienteId, ordenId, id) {
        const item = await this.repo.findOne({ where: { id, ordenImportacionId: ordenId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!item)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return item;
    }
    async validarProductoUnico(ordenId, clienteId, productoId, excluirId) {
        const existente = await this.repo.findOne({ where: { ordenImportacionId: ordenId, clienteId, productoId, estado: constants_1.Status.ACTIVE } });
        if (existente && existente.id !== excluirId) {
            throw new common_1.BadRequestException('Este producto ya está agregado a la orden. Edita el ítem existente en lugar de agregar uno nuevo.');
        }
    }
    async crear(clienteId, ordenId, dto, usuarioCreacion) {
        if (dto.productoId)
            await this.validarProductoUnico(ordenId, clienteId, dto.productoId);
        const tc = Number(dto.tipoCambio);
        const pUnit = Number(dto.precioUnitarioMonedaCompra);
        const cant = Number(dto.cantidadUnidades);
        return this.repo.save(this.repo.create({
            ...dto,
            clienteId,
            ordenImportacionId: ordenId,
            precioUnitarioMonedaBase: pUnit * tc,
            subtotalMonedaCompra: pUnit * cant,
            subtotalMonedaBase: pUnit * tc * cant,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
    }
    async actualizar(clienteId, ordenId, id, dto, usuarioModificacion) {
        const item = await this.obtener(clienteId, ordenId, id);
        if (dto.productoId && dto.productoId !== item.productoId) {
            await this.validarProductoUnico(ordenId, clienteId, dto.productoId, id);
        }
        Object.assign(item, dto);
        const tc = Number(item.tipoCambio);
        const pUnit = Number(item.precioUnitarioMonedaCompra);
        const cant = Number(item.cantidadUnidades);
        item.precioUnitarioMonedaBase = pUnit * tc;
        item.subtotalMonedaCompra = pUnit * cant;
        item.subtotalMonedaBase = pUnit * tc * cant;
        Object.assign(item, { transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(item);
    }
    async eliminar(clienteId, ordenId, id, usuarioModificacion) {
        const item = await this.obtener(clienteId, ordenId, id);
        Object.assign(item, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.repo.save(item);
    }
};
ItemsOrdenService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(item_orden_importacion_entity_1.ItemOrdenImportacion)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ItemsOrdenService);
exports.ItemsOrdenService = ItemsOrdenService;
//# sourceMappingURL=items-orden.service.js.map