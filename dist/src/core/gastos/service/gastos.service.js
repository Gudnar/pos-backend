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
exports.GastosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const gasto_entity_1 = require("../entity/gasto.entity");
const constants_1 = require("../../../common/constants");
let GastosService = class GastosService {
    constructor(gastoRepo) {
        this.gastoRepo = gastoRepo;
    }
    async listar(clienteId, tipo, categoria, fecha) {
        const where = { clienteId, estado: constants_1.Status.ACTIVE };
        if (tipo)
            where.tipo = tipo;
        if (categoria)
            where.categoria = categoria;
        if (fecha)
            where.fecha = fecha;
        return this.gastoRepo.find({ where, order: { fechaCreacion: 'DESC' }, take: 500 });
    }
    async obtener(clienteId, id) {
        const gasto = await this.gastoRepo.findOne({
            where: { id, clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!gasto)
            throw new common_1.NotFoundException('Gasto no encontrado');
        return gasto;
    }
    async crear(clienteId, dto, usuarioId) {
        const gasto = this.gastoRepo.create({
            clienteId,
            sucursalId: dto.sucursalId,
            tipo: dto.tipo,
            categoria: dto.categoria,
            monto: dto.monto,
            fecha: dto.fecha,
            descripcion: dto.descripcion,
            referencia: dto.referencia,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: usuarioId,
        });
        return this.gastoRepo.save(gasto);
    }
    async actualizar(clienteId, id, dto, usuarioId) {
        const gasto = await this.obtener(clienteId, id);
        Object.assign(gasto, {
            ...dto,
            transaccion: constants_1.Transacccion.ACTUALIZAR,
            usuarioModificacion: usuarioId,
        });
        return this.gastoRepo.save(gasto);
    }
    async eliminar(clienteId, id, usuarioId) {
        const gasto = await this.obtener(clienteId, id);
        Object.assign(gasto, {
            estado: constants_1.Status.ELIMINATE,
            transaccion: constants_1.Transacccion.ELIMINAR,
            usuarioModificacion: usuarioId,
        });
        await this.gastoRepo.save(gasto);
    }
};
GastosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gasto_entity_1.Gasto)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], GastosService);
exports.GastosService = GastosService;
//# sourceMappingURL=gastos.service.js.map