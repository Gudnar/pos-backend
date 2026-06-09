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
exports.IngresosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ingreso_entity_1 = require("../entity/ingreso.entity");
const constants_1 = require("../../../common/constants");
let IngresosService = class IngresosService {
    constructor(ingresoRepo) {
        this.ingresoRepo = ingresoRepo;
    }
    async listar(clienteId, tipo, categoria) {
        const where = { clienteId, estado: constants_1.Status.ACTIVE };
        if (tipo)
            where.tipo = tipo;
        if (categoria)
            where.categoria = categoria;
        return this.ingresoRepo.find({ where, order: { fechaCreacion: 'DESC' }, take: 500 });
    }
    async listarAdelantos(clienteId, contactoClienteId) {
        const where = {
            clienteId,
            tipo: ingreso_entity_1.TipoIngreso.ADELANTO,
            estadoIngreso: (0, typeorm_2.In)([ingreso_entity_1.EstadoIngreso.DISPONIBLE, ingreso_entity_1.EstadoIngreso.PARCIAL]),
            estado: constants_1.Status.ACTIVE,
        };
        if (contactoClienteId)
            where.contactoClienteId = contactoClienteId;
        return this.ingresoRepo.find({ where, order: { fechaCreacion: 'DESC' } });
    }
    async obtener(clienteId, id) {
        const ingreso = await this.ingresoRepo.findOne({
            where: { id, clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!ingreso)
            throw new common_1.NotFoundException('Ingreso no encontrado');
        return ingreso;
    }
    async crear(clienteId, dto, usuarioId) {
        const montoDisponible = dto.tipo === ingreso_entity_1.TipoIngreso.ADELANTO ? Number(dto.monto) : 0;
        const estadoIngreso = dto.tipo === ingreso_entity_1.TipoIngreso.ADELANTO ? ingreso_entity_1.EstadoIngreso.DISPONIBLE : ingreso_entity_1.EstadoIngreso.DISPONIBLE;
        const ingreso = this.ingresoRepo.create({
            clienteId,
            sucursalId: dto.sucursalId,
            tipo: dto.tipo,
            categoria: dto.categoria,
            monto: dto.monto,
            montoDisponible,
            estadoIngreso,
            fecha: dto.fecha,
            descripcion: dto.descripcion,
            referencia: dto.referencia,
            contactoClienteId: dto.contactoClienteId,
            nombreContacto: dto.nombreContacto,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: usuarioId,
        });
        return this.ingresoRepo.save(ingreso);
    }
    async actualizar(clienteId, id, dto, usuarioId) {
        const ingreso = await this.obtener(clienteId, id);
        Object.assign(ingreso, {
            ...dto,
            transaccion: constants_1.Transacccion.ACTUALIZAR,
            usuarioModificacion: usuarioId,
        });
        return this.ingresoRepo.save(ingreso);
    }
    async anular(clienteId, id, usuarioId) {
        const ingreso = await this.obtener(clienteId, id);
        if (ingreso.estadoIngreso === ingreso_entity_1.EstadoIngreso.UTILIZADO) {
            throw new common_1.BadRequestException('No se puede anular un adelanto ya utilizado completamente');
        }
        Object.assign(ingreso, {
            estadoIngreso: ingreso_entity_1.EstadoIngreso.ANULADO,
            estado: constants_1.Status.ELIMINATE,
            transaccion: constants_1.Transacccion.ELIMINAR,
            usuarioModificacion: usuarioId,
        });
        await this.ingresoRepo.save(ingreso);
    }
    async aplicarMonto(manager, clienteId, ingresoId, montoAplicar, usuarioId) {
        const ingreso = await manager.findOne(ingreso_entity_1.Ingreso, {
            where: { id: ingresoId, clienteId, tipo: ingreso_entity_1.TipoIngreso.ADELANTO, estado: constants_1.Status.ACTIVE },
        });
        if (!ingreso)
            throw new common_1.NotFoundException('Adelanto no encontrado');
        if (ingreso.estadoIngreso === ingreso_entity_1.EstadoIngreso.UTILIZADO) {
            throw new common_1.BadRequestException('El adelanto ya fue utilizado completamente');
        }
        if (ingreso.estadoIngreso === ingreso_entity_1.EstadoIngreso.ANULADO) {
            throw new common_1.BadRequestException('El adelanto está anulado');
        }
        const disponible = Number(ingreso.montoDisponible);
        if (montoAplicar > disponible) {
            throw new common_1.BadRequestException(`Saldo insuficiente en el adelanto. Disponible: ${disponible.toFixed(2)}, Solicitado: ${montoAplicar.toFixed(2)}`);
        }
        const nuevoDisponible = disponible - montoAplicar;
        ingreso.montoDisponible = nuevoDisponible;
        ingreso.estadoIngreso = nuevoDisponible <= 0 ? ingreso_entity_1.EstadoIngreso.UTILIZADO : ingreso_entity_1.EstadoIngreso.PARCIAL;
        ingreso.transaccion = constants_1.Transacccion.ACTUALIZAR;
        ingreso.usuarioModificacion = usuarioId;
        await manager.save(ingreso_entity_1.Ingreso, ingreso);
    }
};
IngresosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ingreso_entity_1.Ingreso)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], IngresosService);
exports.IngresosService = IngresosService;
//# sourceMappingURL=ingresos.service.js.map