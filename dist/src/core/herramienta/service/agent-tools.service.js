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
var AgentToolsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentToolsService = void 0;
const common_1 = require("@nestjs/common");
const herramienta_service_1 = require("./herramienta.service");
const conversacion_service_1 = require("../../conversacion/service/conversacion.service");
function parsearParametros(parametros) {
    const properties = {};
    const required = [];
    for (const param of parametros) {
        const isOptional = param.includes('?');
        const clean = param.replace('?', '');
        const colonIdx = clean.indexOf(':');
        if (colonIdx === -1)
            continue;
        const name = clean.slice(0, colonIdx).trim();
        const typePart = clean.slice(colonIdx + 1).trim();
        if (typePart.includes("'") && typePart.includes('|')) {
            const enumVals = [...typePart.matchAll(/'([^']+)'/g)].map(m => m[1]);
            properties[name] = { type: 'string', enum: enumVals, description: param };
        }
        else if (typePart.startsWith('number')) {
            properties[name] = { type: 'number', description: param };
        }
        else if (typePart.startsWith('boolean')) {
            properties[name] = { type: 'boolean', description: param };
        }
        else {
            properties[name] = { type: 'string', description: param };
        }
        if (!isOptional)
            required.push(name);
    }
    return { type: 'object', properties, required };
}
let AgentToolsService = AgentToolsService_1 = class AgentToolsService {
    constructor(herramientaService, conversacionService) {
        this.herramientaService = herramientaService;
        this.conversacionService = conversacionService;
        this.logger = new common_1.Logger(AgentToolsService_1.name);
    }
    async getToolDefs(agenteId) {
        const herramientas = await this.herramientaService.listarPorAgente(agenteId);
        return this.buildDefs(herramientas.filter(h => h.activa));
    }
    buildDefs(herramientas) {
        return herramientas.map(h => ({
            name: h.nombre,
            description: h.descripcion,
            input_schema: parsearParametros(h.parametros || []),
        }));
    }
    async getNombres(agenteId) {
        const herramientas = await this.herramientaService.listarPorAgente(agenteId);
        return new Set(herramientas.filter(h => h.activa).map(h => h.nombre));
    }
    async ejecutar(nombre, input, conversacionId) {
        this.logger.log(`[AgentTools] ${nombre} → conv=${conversacionId}`);
        try {
            switch (nombre) {
                case 'calificar_lead':
                    await this.conversacionService.actualizarCalificacion(conversacionId, {
                        score: Number(input.score) || 0,
                        scoreMotivo: String(input.razon || input.motivo || ''),
                    });
                    return { exito: true, mensaje: `Lead calificado con score ${input.score}` };
                case 'cambiar_estado':
                    await this.conversacionService.actualizarEstado(conversacionId, input.estado);
                    return { exito: true, mensaje: `Estado cambiado a "${input.estado}"` };
                case 'escalar_agente':
                    await this.conversacionService.actualizarEscalado(conversacionId, true, `[Escalado] ${input.razon || ''}${input.prioridad ? ` | Prioridad: ${input.prioridad}` : ''}`);
                    return { exito: true, mensaje: 'Conversación escalada a un agente humano' };
                case 'crear_nota':
                    await this.conversacionService.agregarNota(conversacionId, input.nota);
                    return { exito: true, mensaje: 'Nota interna creada' };
                default:
                    this.logger.log(`[AgentTools] Herramienta personalizada: ${nombre} input=${JSON.stringify(input)}`);
                    return { exito: true, mensaje: `${nombre} ejecutado`, datos: input };
            }
        }
        catch (err) {
            this.logger.warn(`[AgentTools] Error en ${nombre}: ${err.message}`);
            return { error: err.message };
        }
    }
};
AgentToolsService = AgentToolsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [herramienta_service_1.HerramientaService,
        conversacion_service_1.ConversacionService])
], AgentToolsService);
exports.AgentToolsService = AgentToolsService;
//# sourceMappingURL=agent-tools.service.js.map