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
exports.FuentesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fuente_entity_1 = require("../entity/fuente.entity");
const movimiento_fuente_entity_1 = require("../entity/movimiento-fuente.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let FuentesService = class FuentesService {
    constructor(repo, movRepo) {
        this.repo = repo;
        this.movRepo = movRepo;
    }
    async calcularSaldo(clienteId, fuenteId, saldoInicial) {
        const result = await this.movRepo
            .createQueryBuilder('m')
            .select(`
        SUM(CASE WHEN m.tipo IN ('INGRESO','TRANSFERENCIA_ENTRADA') THEN m.monto_nativo ELSE 0 END) as entradas,
        SUM(CASE WHEN m.tipo IN ('EGRESO','TRANSFERENCIA_SALIDA') THEN m.monto_nativo ELSE 0 END) as salidas
      `)
            .where('m.fuente_id = :fuenteId AND m.cliente_id = :clienteId AND m._estado = :estado', {
            fuenteId, clienteId, estado: constants_1.Status.ACTIVE,
        })
            .getRawOne();
        const entradas = Number(result?.entradas ?? 0);
        const salidas = Number(result?.salidas ?? 0);
        return Number(saldoInicial) + entradas - salidas;
    }
    async listar(clienteId) {
        const fuentes = await this.repo.find({
            where: { clienteId, estado: constants_1.Status.ACTIVE },
            order: { nombre: 'ASC' },
        });
        return Promise.all(fuentes.map(async (f) => ({
            ...f,
            saldoActual: await this.calcularSaldo(clienteId, f.id, f.saldoInicial),
        })));
    }
    async obtener(clienteId, id) {
        const f = await this.repo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!f)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return { ...f, saldoActual: await this.calcularSaldo(clienteId, id, f.saldoInicial) };
    }
    async crear(clienteId, dto, usuarioCreacion) {
        return this.repo.save(this.repo.create({
            ...dto,
            clienteId,
            saldoInicial: dto.saldoInicial ?? 0,
            activo: dto.activo ?? true,
            tipo: dto.tipo ?? 'CUENTA_BANCARIA',
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
    }
    async actualizar(clienteId, id, dto, usuarioModificacion) {
        const f = await this.repo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!f)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        Object.assign(f, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        const saved = await this.repo.save(f);
        return { ...saved, saldoActual: await this.calcularSaldo(clienteId, id, saved.saldoInicial) };
    }
    async eliminar(clienteId, id, usuarioModificacion) {
        const f = await this.repo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!f)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        Object.assign(f, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.repo.save(f);
    }
    async resumen(clienteId) {
        return this.listar(clienteId);
    }
};
FuentesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fuente_entity_1.Fuente)),
    __param(1, (0, typeorm_1.InjectRepository)(movimiento_fuente_entity_1.MovimientoFuente)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FuentesService);
exports.FuentesService = FuentesService;
//# sourceMappingURL=fuentes.service.js.map