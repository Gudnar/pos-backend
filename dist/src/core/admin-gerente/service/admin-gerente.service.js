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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AdminGerenteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGerenteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = __importDefault(require("axios"));
const usuario_entity_1 = require("../../usuario/entity/usuario.entity");
const admin_gerente_tools_service_1 = require("./admin-gerente-tools.service");
const admin_gerente_fuentes_service_1 = require("./admin-gerente-fuentes.service");
const admin_gerente_logistica_service_1 = require("./admin-gerente-logistica.service");
const admin_gerente_compras_service_1 = require("./admin-gerente-compras.service");
const admin_gerente_caja_service_1 = require("./admin-gerente-caja.service");
const constants_1 = require("../../../common/constants");
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MAX_TOOL_ITERATIONS = 8;
let AdminGerenteService = AdminGerenteService_1 = class AdminGerenteService {
    constructor(usuarioRepo, adminTools, fuentesTools, logisticaTools, comprasTools, cajaTools) {
        this.usuarioRepo = usuarioRepo;
        this.adminTools = adminTools;
        this.fuentesTools = fuentesTools;
        this.logisticaTools = logisticaTools;
        this.comprasTools = comprasTools;
        this.cajaTools = cajaTools;
        this.logger = new common_1.Logger(AdminGerenteService_1.name);
    }
    async resolverAdmin(telefono, clienteId) {
        const usuario = await this.usuarioRepo
            .createQueryBuilder('u')
            .where('u.telefono = :telefono AND u.cliente_id = :clienteId AND u._estado = :activo', {
            telefono,
            clienteId,
            activo: constants_1.Status.ACTIVE,
        })
            .getOne();
        if (!usuario)
            return null;
        this.logger.log(`[AdminGerente] Autorizado: ${usuario.nombres} (${usuario.rol}) — tel: ${telefono}`);
        return { id: usuario.id, rol: usuario.rol, nombres: usuario.nombres };
    }
    async obtenerRespuesta(texto, admin, clienteId, apiKey, nombreEmpresa) {
        const toolDefs = this.getAllToolDefs();
        const messages = [{ role: 'user', content: texto }];
        for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
            let res;
            try {
                res = await axios_1.default.post(ANTHROPIC_API, {
                    model: 'claude-haiku-4-5',
                    max_tokens: 1536,
                    system: this.buildSystemPrompt(admin, nombreEmpresa),
                    messages,
                    tools: toolDefs,
                }, {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json',
                    },
                });
            }
            catch (err) {
                this.logger.error(`[AdminGerente] Error iter ${i}: ${err?.response?.data?.error?.message || err.message}`);
                return null;
            }
            const data = res.data;
            const stopReason = data.stop_reason;
            if (stopReason === 'end_turn') {
                const textBlock = data.content?.find((b) => b.type === 'text');
                return textBlock?.text || null;
            }
            if (stopReason === 'tool_use') {
                const toolUses = data.content.filter((b) => b.type === 'tool_use');
                if (!toolUses.length)
                    break;
                this.logger.log(`[AdminGerente] Iter ${i} — herramientas: ${toolUses.map((b) => b.name).join(', ')}`);
                const toolResults = await Promise.all(toolUses.map(async (tu) => {
                    const result = await this.dispatch(tu.name, tu.input || {}, clienteId, admin.id);
                    return {
                        type: 'tool_result',
                        tool_use_id: tu.id,
                        content: JSON.stringify(result ?? { error: `Herramienta desconocida: ${tu.name}` }),
                    };
                }));
                messages.push({ role: 'assistant', content: data.content });
                messages.push({ role: 'user', content: toolResults });
                continue;
            }
            this.logger.warn(`[AdminGerente] stop_reason inesperado: ${stopReason}`);
            break;
        }
        return null;
    }
    async dispatch(nombre, input, clienteId, adminId) {
        let result = await this.adminTools.ejecutar(nombre, input, clienteId);
        if (result !== undefined)
            return result;
        result = await this.fuentesTools.ejecutar(nombre, input, clienteId, adminId);
        if (result !== null)
            return result;
        result = await this.logisticaTools.ejecutar(nombre, input, clienteId, adminId);
        if (result !== null)
            return result;
        result = await this.comprasTools.ejecutar(nombre, input, clienteId, adminId);
        if (result !== null)
            return result;
        result = await this.cajaTools.ejecutar(nombre, input, clienteId, adminId);
        if (result !== null)
            return result;
        return { error: `Herramienta no reconocida: ${nombre}` };
    }
    getAllToolDefs() {
        return [
            ...this.adminTools.getToolDefs(),
            ...this.fuentesTools.getToolDefs(),
            ...this.logisticaTools.getToolDefs(),
            ...this.comprasTools.getToolDefs(),
            ...this.cajaTools.getToolDefs(),
        ];
    }
    buildSystemPrompt(admin, nombreEmpresa) {
        return `Eres el asistente administrativo del Gerente de ${nombreEmpresa}.
Gerente: ${admin.nombres} (Rol: ${admin.rol})

Tienes 19 herramientas disponibles agrupadas por área:

INVENTARIO: consultar_stock_producto, registrar_ingreso_mercaderia, registrar_venta
CLIENTES: consultar_deudas_cliente
FUENTES DE FONDOS: consultar_fuentes, registrar_ingreso_fuente, registrar_egreso_fuente, registrar_transferencia_fuente
LOGÍSTICA: consultar_orden_importacion, registrar_pago_proveedor_importacion, registrar_gasto_logistica
COMPRAS: consultar_compras, crear_compra, recibir_compra_almacen, finalizar_compra_inventario
CAJA/POS: consultar_sesion_caja, abrir_caja, cerrar_caja

Reglas de comportamiento:
- Para operaciones de escritura (registrar, crear, finalizar), confirma los datos clave con el Gerente antes de ejecutar, a menos que ya lo haya confirmado explícitamente.
- Usa herramientas de consulta primero cuando necesites IDs o información específica (ej. usa consultar_fuentes antes de registrar un movimiento).
- Para crear una compra, si el Gerente da nombres de productos úsalos tal como están (la herramienta los busca).
- Para abrir caja, indica el nombre de la caja a abrir (usa consultar_sesion_caja si no sabes los nombres disponibles).
- Proporciona números exactos, fechas precisas y totales calculados.
- Responde siempre en español, de forma concisa y directa.`;
    }
};
AdminGerenteService = AdminGerenteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        admin_gerente_tools_service_1.AdminGerenteToolsService,
        admin_gerente_fuentes_service_1.AdminGerenteFuentesService,
        admin_gerente_logistica_service_1.AdminGerenteLogisticaService,
        admin_gerente_compras_service_1.AdminGerenteComprasService,
        admin_gerente_caja_service_1.AdminGerenteCajaService])
], AdminGerenteService);
exports.AdminGerenteService = AdminGerenteService;
//# sourceMappingURL=admin-gerente.service.js.map