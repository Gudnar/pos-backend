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
exports.PreciosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const precio_producto_entity_1 = require("../entity/precio-producto.entity");
const precio_promocional_entity_1 = require("../entity/precio-promocional.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let PreciosService = class PreciosService {
    constructor(precioRepo, promoRepo) {
        this.precioRepo = precioRepo;
        this.promoRepo = promoRepo;
    }
    async listarPrecios(clienteId, productoId) {
        const todos = await this.precioRepo.find({
            where: { clienteId, productoId, estado: constants_1.Status.ACTIVE },
            order: { fechaVigencia: 'DESC', fechaCreacion: 'DESC', cantidadMin: 'ASC' },
        });
        const activos = {};
        const historico = [];
        for (const p of todos) {
            const key = `${p.tipo}__${p.unidadId || 'base'}__${p.fechaVigencia}`;
            if (p.activo) {
                if (!activos[key])
                    activos[key] = [];
                activos[key].push(p);
            }
            else {
                historico.push(p);
            }
        }
        return {
            escalasActivas: Object.values(activos).map(tiers => ({
                tipo: tiers[0].tipo,
                unidadId: tiers[0].unidadId,
                moneda: tiers[0].moneda,
                fechaVigencia: tiers[0].fechaVigencia,
                notas: tiers[0].notas,
                tiers: tiers.map(t => ({ id: t.id, cantidadMin: t.cantidadMin, cantidadMax: t.cantidadMax, precio: t.precio })),
            })),
            historico,
        };
    }
    async agregarEscalaPrecio(clienteId, productoId, dto, usuarioCreacion) {
        const tipo = dto.tipo || 'VENTA';
        const hoy = dto.fechaVigencia || new Date().toISOString().split('T')[0];
        const unidadId = dto.unidadId || null;
        const activos = await this.precioRepo.find({
            where: {
                clienteId, productoId, tipo, activo: true, estado: constants_1.Status.ACTIVE,
                ...(unidadId ? { unidadId } : {}),
            },
        });
        for (const p of activos) {
            Object.assign(p, { activo: false, fechaFin: hoy, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion: usuarioCreacion });
            await this.precioRepo.save(p);
        }
        const nuevos = [];
        for (const tier of dto.escala) {
            const nuevo = await this.precioRepo.save(this.precioRepo.create({
                clienteId,
                productoId,
                tipo,
                unidadId: unidadId ?? undefined,
                cantidadMin: tier.cantidadMin,
                cantidadMax: tier.cantidadMax ?? undefined,
                precio: tier.precio,
                moneda: dto.moneda || 'BOB',
                fechaVigencia: hoy,
                activo: true,
                notas: dto.notas,
                estado: constants_1.Status.ACTIVE,
                transaccion: constants_1.Transacccion.CREAR,
                usuarioCreacion,
            }));
            nuevos.push(nuevo);
        }
        return nuevos;
    }
    async listarPromociones(clienteId, productoId) {
        return this.promoRepo.find({
            where: { clienteId, productoId, estado: constants_1.Status.ACTIVE },
            order: { fechaInicio: 'DESC' },
        });
    }
    async crearPromocion(clienteId, productoId, dto, usuarioCreacion) {
        return this.promoRepo.save(this.promoRepo.create({
            ...dto,
            clienteId,
            productoId,
            habilitado: dto.habilitado !== false,
            moneda: dto.moneda || 'BOB',
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
    }
    async actualizarPromocion(clienteId, promoId, dto, usuarioModificacion) {
        const promo = await this.promoRepo.findOne({ where: { id: promoId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!promo)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        Object.assign(promo, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.promoRepo.save(promo);
    }
    async togglePromocion(clienteId, promoId, usuarioModificacion) {
        const promo = await this.promoRepo.findOne({ where: { id: promoId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!promo)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        Object.assign(promo, { habilitado: !promo.habilitado, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.promoRepo.save(promo);
    }
    async eliminarPromocion(clienteId, promoId, usuarioModificacion) {
        const promo = await this.promoRepo.findOne({ where: { id: promoId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!promo)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        Object.assign(promo, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.promoRepo.save(promo);
    }
};
PreciosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(precio_producto_entity_1.PrecioProducto)),
    __param(1, (0, typeorm_1.InjectRepository)(precio_promocional_entity_1.PrecioPromocional)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PreciosService);
exports.PreciosService = PreciosService;
//# sourceMappingURL=precios.service.js.map