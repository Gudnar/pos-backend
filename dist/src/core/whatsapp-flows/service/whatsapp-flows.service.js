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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WhatsappFlowsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappFlowsService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const configuracion_cliente_service_1 = require("../../cliente/service/configuracion-cliente.service");
const ingresos_service_1 = require("../../ingresos/service/ingresos.service");
const gastos_service_1 = require("../../gastos/service/gastos.service");
const constants_1 = require("../../../common/constants");
const WA_API_VERSION = 'v19.0';
const WA_BASE_URL = `https://graph.facebook.com/${WA_API_VERSION}`;
function fechaHoy() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
let WhatsappFlowsService = WhatsappFlowsService_1 = class WhatsappFlowsService {
    constructor(confClienteService, ingresosService, gastosService) {
        this.confClienteService = confClienteService;
        this.ingresosService = ingresosService;
        this.gastosService = gastosService;
        this.logger = new common_1.Logger(WhatsappFlowsService_1.name);
    }
    async enviarFlow(to, clienteId) {
        const [tokenCfg, phoneIdCfg, flowIdCfg, flowTokenCfg] = await Promise.all([
            this.confClienteService.obtenerPorClave(clienteId, 'WA_ACCESS_TOKEN'),
            this.confClienteService.obtenerPorClave(clienteId, 'WA_PHONE_NUMBER_ID'),
            this.confClienteService.obtenerPorClave(clienteId, 'WA_FLOW_ID'),
            this.confClienteService.obtenerPorClave(clienteId, 'WA_FLOW_TOKEN'),
        ]);
        const accessToken = tokenCfg?.valor || '';
        const phoneNumberId = phoneIdCfg?.valor || '';
        const flowId = flowIdCfg?.valor || '';
        const flowToken = flowTokenCfg?.valor || 'flow_default';
        if (!accessToken || !phoneNumberId || !flowId) {
            this.logger.error('[FLOW] Configuración incompleta: WA_ACCESS_TOKEN / WA_PHONE_NUMBER_ID / WA_FLOW_ID');
            return;
        }
        const body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to.replace(/\D/g, ''),
            type: 'interactive',
            interactive: {
                type: 'flow',
                header: { type: 'text', text: 'Registrar movimiento' },
                body: { text: 'Completa el formulario para registrar un ingreso o gasto.' },
                footer: { text: 'Sistema de gestión' },
                action: {
                    name: 'flow',
                    parameters: {
                        flow_message_version: '3',
                        flow_token: flowToken,
                        flow_id: flowId,
                        flow_cta: 'Abrir formulario',
                        flow_action: 'navigate',
                        flow_action_payload: {
                            screen: 'SELECCION',
                            data: { fecha_hoy: fechaHoy() },
                        },
                    },
                },
            },
        };
        try {
            const res = await axios_1.default.post(`${WA_BASE_URL}/${phoneNumberId}/messages`, body, {
                headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            });
            this.logger.log(`[FLOW] Flow enviado a ${to} — msgId: ${res.data?.messages?.[0]?.id}`);
        }
        catch (err) {
            const msg = err?.response?.data?.error?.message || err.message;
            this.logger.error(`[FLOW] Error enviando Flow a ${to}: ${msg}`);
        }
    }
    desencriptarRequest(body, privateKeyPem) {
        const aesKey = crypto.privateDecrypt({
            key: privateKeyPem,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        }, Buffer.from(body.encrypted_aes_key, 'base64'));
        const iv = Buffer.from(body.initial_vector, 'base64');
        const encryptedData = Buffer.from(body.encrypted_flow_data, 'base64');
        const authTag = encryptedData.slice(-16);
        const ciphertext = encryptedData.slice(0, -16);
        const decipher = crypto.createDecipheriv('aes-128-gcm', aesKey, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        const payload = JSON.parse(decrypted.toString('utf8'));
        this.logger.log(`[FLOW] Desencriptado — action=${payload.action} screen=${payload.screen ?? '-'}`);
        return { payload, aesKey, iv };
    }
    encriptarResponse(responseData, aesKey, iv) {
        const flippedIv = Buffer.from(iv);
        flippedIv[flippedIv.length - 1] ^= 0xFF;
        const cipher = crypto.createCipheriv('aes-128-gcm', aesKey, flippedIv);
        const plaintext = Buffer.from(JSON.stringify(responseData), 'utf8');
        const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
        const authTag = cipher.getAuthTag();
        return Buffer.concat([encrypted, authTag]).toString('base64');
    }
    async procesarAccion(payload, clienteId) {
        if (payload.action === 'ping') {
            return { data: { status: 'active' } };
        }
        if (payload.action === 'INIT') {
            return {
                screen: 'SELECCION',
                data: { fecha_hoy: fechaHoy() },
            };
        }
        if (payload.action === 'data_exchange' && payload.screen === 'SELECCION') {
            const tipo = payload.data?.tipo_operacion;
            const nextScreen = tipo === 'ingreso' ? 'REGISTRO_INGRESO' : 'REGISTRO_GASTO';
            return {
                screen: nextScreen,
                data: { fecha_hoy: fechaHoy() },
            };
        }
        if (payload.action === 'data_exchange' && payload.data?.pantalla) {
            await this.guardarRegistro(payload.data, clienteId);
            return { close_flow: true };
        }
        this.logger.warn(`[FLOW] Acción no manejada: action=${payload.action} screen=${payload.screen}`);
        return { close_flow: true };
    }
    async guardarRegistro(data, clienteId) {
        const pantalla = data.pantalla;
        const monto = parseFloat(String(data.monto || '0').replace(',', '.'));
        const fecha = data.fecha || fechaHoy();
        const categoria = data.categoria;
        const tipo = data.tipo;
        const descripcion = data.descripcion || '';
        if (isNaN(monto) || monto <= 0) {
            this.logger.error(`[FLOW] Monto inválido recibido: "${data.monto}"`);
            return;
        }
        try {
            if (pantalla === 'REGISTRO_INGRESO') {
                const ingreso = await this.ingresosService.crear(clienteId, { tipo, categoria, monto, fecha, descripcion }, constants_1.USUARIO_SISTEMA);
                this.logger.log(`[FLOW] Ingreso creado: id=${ingreso.id} tipo=${tipo} monto=${monto}`);
            }
            else if (pantalla === 'REGISTRO_GASTO') {
                const gasto = await this.gastosService.crear(clienteId, { tipo, categoria, monto, fecha, descripcion }, constants_1.USUARIO_SISTEMA);
                this.logger.log(`[FLOW] Gasto creado: id=${gasto.id} tipo=${tipo} monto=${monto}`);
            }
            else {
                this.logger.warn(`[FLOW] Pantalla desconocida: ${pantalla}`);
            }
        }
        catch (err) {
            this.logger.error(`[FLOW] Error guardando registro (${pantalla}): ${err.message}`);
        }
    }
    async obtenerClavePrivada(clienteId) {
        const cfg = await this.confClienteService.obtenerPorClave(clienteId, 'WA_FLOW_PRIVATE_KEY');
        return cfg?.valor ?? null;
    }
};
WhatsappFlowsService = WhatsappFlowsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [configuracion_cliente_service_1.ConfiguracionClienteService,
        ingresos_service_1.IngresosService,
        gastos_service_1.GastosService])
], WhatsappFlowsService);
exports.WhatsappFlowsService = WhatsappFlowsService;
//# sourceMappingURL=whatsapp-flows.service.js.map