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
var AdminGerenteCajaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGerenteCajaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const caja_entity_1 = require("../../caja/entity/caja.entity");
const caja_sesion_entity_1 = require("../../caja/entity/caja-sesion.entity");
const usuario_entity_1 = require("../../usuario/entity/usuario.entity");
const constants_1 = require("../../../common/constants");
let AdminGerenteCajaService = AdminGerenteCajaService_1 = class AdminGerenteCajaService {
    constructor(cajaRepo, sesionRepo, usuarioRepo) {
        this.cajaRepo = cajaRepo;
        this.sesionRepo = sesionRepo;
        this.usuarioRepo = usuarioRepo;
        this.logger = new common_1.Logger(AdminGerenteCajaService_1.name);
    }
    getToolDefs() {
        return [
            {
                name: 'consultar_sesion_caja',
                description: 'Consulta la sesión de caja activa del sistema. También lista las cajas disponibles y las últimas sesiones del día.',
                input_schema: { type: 'object', properties: {} },
            },
            {
                name: 'abrir_caja',
                description: 'Abre una nueva sesión de caja. El monto inicial es el efectivo disponible al inicio del turno.',
                input_schema: {
                    type: 'object',
                    properties: {
                        nombre_caja: { type: 'string', description: 'Nombre parcial de la caja a abrir' },
                        monto_inicial: { type: 'number', description: 'Efectivo disponible al inicio del turno' },
                        observaciones: { type: 'string', description: 'Observaciones de apertura (opcional)' },
                    },
                    required: ['nombre_caja', 'monto_inicial'],
                },
            },
            {
                name: 'cerrar_caja',
                description: 'Cierra la sesión de caja activa del usuario. Calcula la diferencia entre el monto esperado y el monto real contado.',
                input_schema: {
                    type: 'object',
                    properties: {
                        monto_final: { type: 'number', description: 'Efectivo contado al cierre del turno' },
                        observaciones: { type: 'string', description: 'Observaciones del cierre (opcional)' },
                    },
                    required: ['monto_final'],
                },
            },
        ];
    }
    async ejecutar(nombre, input, clienteId, adminId) {
        switch (nombre) {
            case 'consultar_sesion_caja': return this.consultarSesion(clienteId, adminId);
            case 'abrir_caja': return this.abrirCaja(input, clienteId, adminId);
            case 'cerrar_caja': return this.cerrarCaja(input, clienteId, adminId);
            default: return null;
        }
    }
    async consultarSesion(clienteId, adminId) {
        const sesionActiva = await this.sesionRepo.findOne({
            where: { clienteId, usuarioId: adminId, estadoSesion: 'ABIERTA', estado: constants_1.Status.ACTIVE },
        });
        const cajas = await this.cajaRepo.find({
            where: { clienteId, estado: constants_1.Status.ACTIVE },
            order: { nombre: 'ASC' },
        });
        const hoy = new Date().toISOString().split('T')[0];
        const sesionesHoy = await this.sesionRepo
            .createQueryBuilder('s')
            .where("s.cliente_id = :clienteId AND s._estado = :activo AND DATE(s.fecha_apertura) = :hoy", { clienteId, activo: constants_1.Status.ACTIVE, hoy })
            .orderBy('s.fecha_apertura', 'DESC')
            .getMany();
        return {
            sesionActiva: sesionActiva
                ? {
                    cajaId: sesionActiva.cajaId,
                    nombreUsuario: sesionActiva.nombreUsuario,
                    montoInicial: Number(sesionActiva.montoInicial || 0),
                    totalVentas: Number(sesionActiva.totalVentas || 0),
                    nroVentas: sesionActiva.nroVentas || 0,
                    fechaApertura: sesionActiva.fechaApertura,
                    montoEsperado: Number(sesionActiva.montoInicial || 0) + Number(sesionActiva.totalVentas || 0),
                }
                : null,
            cajasDisponibles: cajas.map(c => ({
                id: c.id,
                nombre: c.nombre,
                activo: c.activo,
            })),
            sesionesHoy: sesionesHoy.map(s => ({
                nombreUsuario: s.nombreUsuario,
                estado: s.estadoSesion,
                montoInicial: Number(s.montoInicial || 0),
                totalVentas: Number(s.totalVentas || 0),
                nroVentas: s.nroVentas || 0,
                fechaApertura: s.fechaApertura,
                fechaCierre: s.fechaCierre || null,
            })),
        };
    }
    async abrirCaja(input, clienteId, adminId) {
        const cajas = await this.cajaRepo.find({ where: { clienteId, estado: constants_1.Status.ACTIVE } });
        const caja = cajas.find(c => c.nombre.toLowerCase().includes(input.nombre_caja.toLowerCase()));
        if (!caja)
            return { error: `Caja "${input.nombre_caja}" no encontrada. Cajas disponibles: ${cajas.map(c => c.nombre).join(', ')}` };
        if (!caja.activo)
            return { error: `La caja "${caja.nombre}" está inactiva` };
        const sesionExistente = await this.sesionRepo.findOne({
            where: { clienteId, cajaId: caja.id, estadoSesion: 'ABIERTA', estado: constants_1.Status.ACTIVE },
        });
        if (sesionExistente) {
            return { error: `La caja "${caja.nombre}" ya tiene una sesión abierta para ${sesionExistente.nombreUsuario}` };
        }
        const usuario = await this.usuarioRepo.findOne({ where: { id: adminId, estado: constants_1.Status.ACTIVE } });
        const nombreUsuario = usuario
            ? [usuario.nombres, usuario.apellidos].filter(Boolean).join(' ')
            : `Usuario #${adminId}`;
        const sesion = await this.sesionRepo.save(this.sesionRepo.create({
            clienteId,
            cajaId: caja.id,
            sucursalId: caja.sucursalId,
            usuarioId: adminId,
            estadoSesion: 'ABIERTA',
            nombreUsuario,
            montoInicial: input.monto_inicial,
            totalVentas: 0,
            nroVentas: 0,
            fechaApertura: new Date(),
            observaciones: input.observaciones || null,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: adminId,
        }));
        return {
            exito: true,
            caja: caja.nombre,
            nombreUsuario,
            montoInicial: Number(input.monto_inicial),
            fechaApertura: sesion.fechaApertura,
            mensaje: `Caja "${caja.nombre}" abierta con ${input.monto_inicial} de monto inicial.`,
        };
    }
    async cerrarCaja(input, clienteId, adminId) {
        const sesion = await this.sesionRepo.findOne({
            where: { clienteId, usuarioId: adminId, estadoSesion: 'ABIERTA', estado: constants_1.Status.ACTIVE },
        });
        if (!sesion)
            return { error: 'No hay ninguna sesión de caja abierta para este usuario' };
        const montoEsperado = Number(sesion.montoInicial) + Number(sesion.totalVentas);
        const diferencia = Number(input.monto_final) - montoEsperado;
        Object.assign(sesion, {
            estadoSesion: 'CERRADA',
            montoFinal: input.monto_final,
            diferencia,
            fechaCierre: new Date(),
            observaciones: input.observaciones || sesion.observaciones,
            transaccion: constants_1.Transacccion.ACTUALIZAR,
            usuarioModificacion: adminId,
        });
        await this.sesionRepo.save(sesion);
        return {
            exito: true,
            montoInicial: Number(sesion.montoInicial),
            totalVentas: Number(sesion.totalVentas),
            nroVentas: sesion.nroVentas,
            montoEsperado: Number(montoEsperado.toFixed(2)),
            montoFinal: Number(input.monto_final),
            diferencia: Number(diferencia.toFixed(2)),
            estado: diferencia === 0 ? 'EXACTO' : diferencia > 0 ? 'SOBRANTE' : 'FALTANTE',
            mensaje: `Caja cerrada. ${diferencia === 0 ? 'Sin diferencias.' : diferencia > 0 ? `Sobrante de ${diferencia.toFixed(2)}.` : `Faltante de ${Math.abs(diferencia).toFixed(2)}.`}`,
        };
    }
};
AdminGerenteCajaService = AdminGerenteCajaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(caja_entity_1.Caja)),
    __param(1, (0, typeorm_1.InjectRepository)(caja_sesion_entity_1.CajaSesion)),
    __param(2, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminGerenteCajaService);
exports.AdminGerenteCajaService = AdminGerenteCajaService;
//# sourceMappingURL=admin-gerente-caja.service.js.map