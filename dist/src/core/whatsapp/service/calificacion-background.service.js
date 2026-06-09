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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CalificacionBackgroundService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalificacionBackgroundService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const conversacion_service_1 = require("../../conversacion/service/conversacion.service");
const configuracion_cliente_service_1 = require("../../cliente/service/configuracion-cliente.service");
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const CALIFICACION_CONFIG_KEY = 'CALIFICACION_CONFIG';
const PROMPT_DEFAULT = `Analiza esta conversación de un consultorio médico/dental y responde SOLO con JSON válido (sin texto adicional):
{
  "score": número 0-100 (probabilidad de que el paciente concrete una cita),
  "intencion": "RESERVAR" | "INFORMAR" | "CANCELAR" | "QUEJAR" | "OTRO",
  "urgencia": "INMEDIATA" | "ESTA_SEMANA" | "SIN_URGENCIA",
  "sentimiento": "POSITIVO" | "NEUTRAL" | "NEGATIVO" | "FRUSTRADO",
  "servicioDetectado": "nombre del servicio mencionado o null",
  "etapaFunnel": "DESCUBRIMIENTO" | "CONSIDERACION" | "DECISION" | "RECURRENTE",
  "datosCapturados": { "nombre": "...", "telefono": "...", "email": "..." },
  "motivo": "una oración explicando el score"
}

Criterios de score:
- 80-100: El paciente confirmó o está a punto de confirmar una cita
- 60-79: Alta intención, tiene servicio y fecha definidos
- 40-59: Interesado, preguntó por disponibilidad o precios
- 20-39: Solo buscó información general
- 0-19: Sin intención clara o conversación negativa`;
let CalificacionBackgroundService = CalificacionBackgroundService_1 = class CalificacionBackgroundService {
    constructor(conversacionService, confClienteService) {
        this.conversacionService = conversacionService;
        this.confClienteService = confClienteService;
        this.logger = new common_1.Logger(CalificacionBackgroundService_1.name);
    }
    async calificar(conversacionId, mensajes, clienteId, apiKey, modelo) {
        if (!apiKey || mensajes.length < 2)
            return;
        try {
            const configReg = await this.confClienteService.obtenerPorClave(clienteId, CALIFICACION_CONFIG_KEY);
            let promptCalif = PROMPT_DEFAULT;
            if (configReg?.valor) {
                const cfg = JSON.parse(configReg.valor);
                if (cfg.prompt?.trim())
                    promptCalif = cfg.prompt.trim();
            }
            const convText = mensajes
                .slice(-20)
                .map(m => `${m.role === 'user' ? 'Paciente' : 'Asistente'}: ${m.content}`)
                .join('\n');
            const res = await axios_1.default.post(ANTHROPIC_API, {
                model: modelo || 'claude-haiku-4-5',
                max_tokens: 400,
                system: promptCalif,
                messages: [{ role: 'user', content: `Conversación:\n${convText}` }],
            }, {
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                },
                timeout: 15000,
            });
            const text = res.data?.content?.[0]?.text || '';
            const match = text.match(/\{[\s\S]*\}/);
            if (!match)
                return;
            const data = JSON.parse(match[0]);
            await this.conversacionService.actualizarCalificacion(conversacionId, {
                score: typeof data.score === 'number' ? Math.min(100, Math.max(0, data.score)) : undefined,
                intencion: data.intencion || undefined,
                urgencia: data.urgencia || undefined,
                sentimiento: data.sentimiento || undefined,
                servicioDetectado: data.servicioDetectado || undefined,
                etapaFunnel: data.etapaFunnel || undefined,
                datosCapturados: data.datosCapturados || undefined,
                scoreMotivo: data.motivo || undefined,
            });
            this.logger.log(`[Calificacion] conv ${conversacionId} → score=${data.score} intencion=${data.intencion}`);
        }
        catch (err) {
            this.logger.warn(`[Calificacion] Error en conv ${conversacionId}: ${err.message}`);
        }
    }
};
CalificacionBackgroundService = CalificacionBackgroundService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [conversacion_service_1.ConversacionService,
        configuracion_cliente_service_1.ConfiguracionClienteService])
], CalificacionBackgroundService);
exports.CalificacionBackgroundService = CalificacionBackgroundService;
//# sourceMappingURL=calificacion-background.service.js.map