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
exports.PagosProveedorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pago_proveedor_importacion_entity_1 = require("../entity/pago-proveedor-importacion.entity");
const orden_importacion_entity_1 = require("../entity/orden-importacion.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
const movimientos_fuente_service_1 = require("../../fuentes/service/movimientos-fuente.service");
let PagosProveedorService = class PagosProveedorService {
    constructor(repo, ordenRepo, movimientosSvc) {
        this.repo = repo;
        this.ordenRepo = ordenRepo;
        this.movimientosSvc = movimientosSvc;
    }
    async validarLimite(clienteId, ordenId, nuevoMontoBase, excluirId) {
        const orden = await this.ordenRepo.findOne({ where: { id: ordenId, clienteId } });
        if (!orden?.totalProductosMonedaBase)
            return;
        const pagos = await this.repo.find({ where: { ordenImportacionId: ordenId, clienteId, estado: constants_1.Status.ACTIVE } });
        const totalExistente = pagos
            .filter(p => p.id !== excluirId)
            .reduce((s, p) => s + Number(p.monto) * Number(p.tipoCambio), 0);
        const nuevoTotal = totalExistente + nuevoMontoBase;
        const limite = Number(orden.totalProductosMonedaBase);
        if (nuevoTotal > limite + 0.01) {
            const pendiente = Math.max(0, limite - totalExistente);
            throw new common_1.BadRequestException(`El pago excede el monto pendiente. Pendiente: ${pendiente.toFixed(2)} — Este pago: ${nuevoMontoBase.toFixed(2)}`);
        }
    }
    async listar(clienteId, ordenId) {
        return this.repo.find({
            where: { ordenImportacionId: ordenId, clienteId, estado: constants_1.Status.ACTIVE },
            order: { fechaCreacion: 'ASC' },
        });
    }
    async obtener(clienteId, ordenId, id) {
        const p = await this.repo.findOne({ where: { id, ordenImportacionId: ordenId, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!p)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return p;
    }
    async crear(clienteId, ordenId, dto, usuarioCreacion) {
        await this.validarLimite(clienteId, ordenId, Number(dto.monto) * Number(dto.tipoCambio));
        const { fuenteId, ...pagoData } = dto;
        const pago = await this.repo.save(this.repo.create({
            ...pagoData,
            clienteId,
            ordenImportacionId: ordenId,
            montoMonedaBase: Number(dto.monto) * Number(dto.tipoCambio),
            metodoPago: dto.metodoPago ?? 'TRANSFERENCIA',
            fuenteId: fuenteId || undefined,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
        if (fuenteId) {
            await this.movimientosSvc.registrarExterno(clienteId, fuenteId, 'EGRESO', `Pago proveedor — Orden logística`, Number(dto.monto), dto.monedaId, Number(dto.tipoCambio), dto.fechaPago, 'PAGO_PROVEEDOR', 'logistica_pago', pago.id, usuarioCreacion);
        }
        return pago;
    }
    async actualizar(clienteId, ordenId, id, dto, usuarioModificacion) {
        const p = await this.obtener(clienteId, ordenId, id);
        const nuevoMonto = Number(dto.monto ?? p.monto);
        const nuevoTc = Number(dto.tipoCambio ?? p.tipoCambio);
        await this.validarLimite(clienteId, ordenId, nuevoMonto * nuevoTc, id);
        const { fuenteId, ...rest } = dto;
        const nuevaFuente = fuenteId || undefined;
        Object.assign(p, rest);
        p.montoMonedaBase = Number(p.monto) * Number(p.tipoCambio);
        if (nuevaFuente !== undefined)
            p.fuenteId = nuevaFuente;
        Object.assign(p, { transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        const saved = await this.repo.save(p);
        if (nuevaFuente) {
            await this.movimientosSvc.registrarExterno(clienteId, nuevaFuente, 'EGRESO', `Pago proveedor actualizado — Orden logística`, Number(saved.monto), saved.monedaId, Number(saved.tipoCambio), saved.fechaPago, 'PAGO_PROVEEDOR', 'logistica_pago', saved.id, usuarioModificacion);
        }
        return saved;
    }
    async eliminar(clienteId, ordenId, id, usuarioModificacion) {
        const p = await this.obtener(clienteId, ordenId, id);
        Object.assign(p, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.repo.save(p);
        if (p.fuenteId) {
            await this.movimientosSvc.cancelarPorOrigen(clienteId, 'logistica_pago', id, usuarioModificacion);
        }
    }
};
PagosProveedorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pago_proveedor_importacion_entity_1.PagoProveedorImportacion)),
    __param(1, (0, typeorm_1.InjectRepository)(orden_importacion_entity_1.OrdenImportacion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        movimientos_fuente_service_1.MovimientosFuenteService])
], PagosProveedorService);
exports.PagosProveedorService = PagosProveedorService;
//# sourceMappingURL=pagos-proveedor.service.js.map