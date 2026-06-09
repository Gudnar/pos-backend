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
var ClinicaToolsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicaToolsService = exports.CLINIC_TOOL_DEFS = void 0;
const common_1 = require("@nestjs/common");
const citas_medicas_service_1 = require("../../citas-medicas/service/citas-medicas.service");
const especialista_service_1 = require("../../especialista/service/especialista.service");
const conversacion_service_1 = require("../../conversacion/service/conversacion.service");
const constants_1 = require("../../../common/constants");
function sumar30min(hora) {
    const [hh, mm] = hora.split(':').map(Number);
    const total = hh * 60 + mm + 30;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
function hoy() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
exports.CLINIC_TOOL_DEFS = [
    {
        name: 'obtener_servicios',
        description: 'Devuelve la lista de servicios médicos disponibles. Llama esto cuando el paciente pregunte qué servicios se ofrecen o antes de programar una consulta.',
        input_schema: { type: 'object', properties: {} },
    },
    {
        name: 'listar_especialistas',
        description: 'Devuelve la lista de especialistas/doctores disponibles. Llama esto cuando el paciente pregunte por médicos, especialistas o quiera saber con quién puede consultar. Puedes filtrar por especialidad.',
        input_schema: {
            type: 'object',
            properties: {
                especialidad: { type: 'string', description: 'Filtro opcional por especialidad (ej: "cardiología", "pediatría")' },
            },
        },
    },
    {
        name: 'consultar_disponibilidad',
        description: 'Consulta los horarios libres para una fecha específica, opcionalmente para un especialista en particular. SIEMPRE llama esto antes de proponer o confirmar un horario al paciente.',
        input_schema: {
            type: 'object',
            properties: {
                fecha: { type: 'string', description: 'Fecha en formato YYYY-MM-DD. Usa fechas futuras o de hoy.' },
                especialistaId: { type: 'string', description: 'ID del especialista (opcional). Si se omite, consulta disponibilidad general del consultorio.' },
            },
            required: ['fecha'],
        },
    },
    {
        name: 'programar_consulta',
        description: 'Programa una nueva consulta médica. Requisito: haber llamado a consultar_disponibilidad primero y confirmar los datos con el paciente. Si el paciente es nuevo, se registra automáticamente.',
        input_schema: {
            type: 'object',
            properties: {
                pacienteNombre: { type: 'string', description: 'Nombre completo del paciente' },
                pacienteTelefono: { type: 'string', description: 'Número de teléfono/WhatsApp del paciente' },
                fecha: { type: 'string', description: 'Fecha YYYY-MM-DD' },
                horaInicio: { type: 'string', description: 'Hora de inicio HH:MM (debe estar en la lista de disponibilidad)' },
                servicio: { type: 'string', description: 'Nombre del servicio o motivo de consulta' },
                especialistaId: { type: 'string', description: 'ID del especialista (opcional). Si el paciente eligió un especialista específico.' },
                notas: { type: 'string', description: 'Notas adicionales del paciente (opcional)' },
            },
            required: ['pacienteNombre', 'pacienteTelefono', 'fecha', 'horaInicio', 'servicio'],
        },
    },
    {
        name: 'consultar_consultas_paciente',
        description: 'Busca las consultas activas del paciente por su número de teléfono. Úsalo cuando el paciente pregunte por sus consultas pendientes o quiera cancelar/reprogramar.',
        input_schema: {
            type: 'object',
            properties: {
                telefono: { type: 'string', description: 'Número de teléfono del paciente' },
            },
            required: ['telefono'],
        },
    },
    {
        name: 'reprogramar_consulta',
        description: 'Reprograma (cambia la fecha y hora) de una consulta existente. Pide confirmación al paciente antes de llamar esta herramienta. Verifica disponibilidad con consultar_disponibilidad primero.',
        input_schema: {
            type: 'object',
            properties: {
                consultaId: { type: 'string', description: 'ID UUID de la consulta a reprogramar' },
                nuevaFecha: { type: 'string', description: 'Nueva fecha YYYY-MM-DD' },
                nuevaHoraInicio: { type: 'string', description: 'Nueva hora de inicio HH:MM' },
            },
            required: ['consultaId', 'nuevaFecha', 'nuevaHoraInicio'],
        },
    },
    {
        name: 'cancelar_consulta',
        description: 'Cancela una consulta existente. Pide confirmación al paciente antes de llamar esta herramienta.',
        input_schema: {
            type: 'object',
            properties: {
                consultaId: { type: 'string', description: 'ID UUID de la consulta a cancelar' },
                motivo: { type: 'string', description: 'Motivo de cancelación (opcional)' },
            },
            required: ['consultaId'],
        },
    },
    {
        name: 'cerrar_conversacion',
        description: 'Marca esta conversación como resuelta. Llama esto SOLO cuando el paciente se despida explícitamente, confirme que su consulta fue resuelta, o dé las gracias y no haya nada más pendiente. NO la uses si hay acciones pendientes.',
        input_schema: {
            type: 'object',
            properties: {
                motivo: { type: 'string', description: 'Breve descripción de lo que se resolvió (opcional)' },
            },
        },
    },
];
let ClinicaToolsService = ClinicaToolsService_1 = class ClinicaToolsService {
    constructor(citasSvc, especialistaSvc, conversacionSvc) {
        this.citasSvc = citasSvc;
        this.especialistaSvc = especialistaSvc;
        this.conversacionSvc = conversacionSvc;
        this.logger = new common_1.Logger(ClinicaToolsService_1.name);
    }
    async getToolDefs(clienteId) {
        const [servicios, especialistas] = await Promise.all([
            this.citasSvc.obtenerServicios(clienteId).catch(() => []),
            this.especialistaSvc.listar(clienteId).catch(() => []),
        ]);
        if (!servicios?.length && !especialistas?.length)
            return undefined;
        return exports.CLINIC_TOOL_DEFS;
    }
    async getSystemAddendum(clienteId) {
        const fechaHoy = hoy();
        const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const diaHoy = diasSemana[new Date().getDay()];
        const [servicios, especialistas] = await Promise.all([
            this.citasSvc.obtenerServicios(clienteId).catch(() => []),
            this.especialistaSvc.listar(clienteId).catch(() => []),
        ]);
        const serviciosStr = servicios.length > 0
            ? servicios.map(s => `  - "${s}"`).join('\n')
            : '  (sin servicios genéricos configurados)';
        const especialistasStr = especialistas.length > 0
            ? especialistas.map(e => `  - ID:${e.id} | ${e.nombre} | Especialidades: ${(e.especialidades || []).join(', ') || 'general'}`).join('\n')
            : '  (sin especialistas registrados)';
        return `

FECHA ACTUAL: ${fechaHoy} (${diaHoy})
Usa esta fecha para calcular "mañana", "el lunes", "la próxima semana", etc. Formato: YYYY-MM-DD.

ESPECIALISTAS DISPONIBLES:
${especialistasStr}
Cuando el paciente mencione un especialista o especialidad, usa el ID correspondiente en consultar_disponibilidad y programar_consulta.

SERVICIOS GENERALES (sin especialista):
${serviciosStr}

NÚMERO DE WHATSAPP DEL PACIENTE: úsalo como pacienteTelefono si el paciente no da otro.

FLUJO DE AGENDAMIENTO (sigue este orden estrictamente):
① SERVICIO → llama obtener_servicios. El menú interactivo se envía automáticamente al paciente.
  - La respuesta incluye "especialistasPorServicio": un mapa {servicio → [{id, nombre}]}.
  - En cuanto el paciente elija un servicio, muestra en texto los especialistas de ese servicio (si los hay).
  - Ejemplo: "Para *Consulta General* tenemos: Dr. García (Medicina Interna) y Dra. López (Pediatría). ¿Con cuál prefieres?"
  - Si el servicio no tiene especialistas asignados, salta directo al paso ③ sin especialista.
② ESPECIALISTA → el paciente elige uno. Guarda su ID para los pasos siguientes.
  - Si el paciente no tiene preferencia, puedes sugerirle el primero disponible.
③ DISPONIBILIDAD → llama consultar_disponibilidad con la fecha que indique el paciente y el especialistaId del paso ②.
  - Si no hay especialistaId, consulta disponibilidad general.
④ HORARIO → el paciente elige un slot de la lista retornada.
⑤ CONFIRMAR → repite: nombre, servicio, especialista, fecha y hora. Espera confirmación del paciente.
⑥ AGENDAR → llama programar_consulta SOLO después de confirmación. Pasa especialistaId si aplica.

OTRAS REGLAS:
- REPROGRAMAR: llama consultar_consultas_paciente → muestra la lista → paciente elige → consultar_disponibilidad → reprogramar_consulta con confirmación.
- CANCELAR: llama consultar_consultas_paciente → muestra la lista → confirma con el paciente → cancelar_consulta.
- MÉDICOS: si el paciente pregunta por especialistas sin elegir servicio primero, llama listar_especialistas.
- Teléfono: si el paciente no da teléfono, usa su número de WhatsApp como pacienteTelefono.
- NUNCA digas que una consulta fue agendada sin haber recibido { exito: true } de programar_consulta.
- CIERRE: cuando el paciente se despida (ej: "gracias", "hasta luego", "listo") y no haya nada pendiente, llama cerrar_conversacion DESPUÉS de enviar tu mensaje de despedida.`;
    }
    async ejecutar(nombre, input, ctx) {
        this.logger.log(`[ClinicaTool] ${nombre} → clienteId=${ctx.clienteId}`);
        try {
            switch (nombre) {
                case 'obtener_servicios':
                    return await this._obtenerServicios(ctx);
                case 'listar_especialistas':
                    return await this._listarEspecialistas(input.especialidad, ctx);
                case 'consultar_disponibilidad':
                    return await this._consultarDisponibilidad(input.fecha, input.especialistaId, ctx);
                case 'programar_consulta':
                    return await this._programarConsulta(input, ctx);
                case 'consultar_consultas_paciente':
                    return await this._consultarConsultasPaciente(input.telefono, ctx);
                case 'reprogramar_consulta':
                    return await this._reprogramarConsulta(input.consultaId, input.nuevaFecha, input.nuevaHoraInicio, ctx);
                case 'cancelar_consulta':
                    return await this._cancelarConsulta(input.consultaId, input.motivo, ctx);
                case 'programar_cita':
                    return await this._programarConsulta(input, ctx);
                case 'consultar_citas_paciente':
                    return await this._consultarConsultasPaciente(input.telefono, ctx);
                case 'cancelar_cita':
                    return await this._cancelarConsulta(input.citaId, input.motivo, ctx);
                case 'cerrar_conversacion':
                    return await this._cerrarConversacion(input.motivo, ctx);
                default:
                    return { error: `Herramienta desconocida: ${nombre}` };
            }
        }
        catch (err) {
            this.logger.warn(`[ClinicaTool] Error en ${nombre}: ${err.message}`);
            return { error: err.message || 'Error al ejecutar la herramienta' };
        }
    }
    async _obtenerServicios(ctx) {
        const [servicios, especialistas] = await Promise.all([
            this.citasSvc.obtenerServicios(ctx.clienteId),
            this.especialistaSvc.listar(ctx.clienteId),
        ]);
        const especialistasPorServicio = {};
        for (const servicio of servicios) {
            const svcLower = servicio.toLowerCase();
            const match = especialistas.filter(e => e.activo &&
                (e.especialidades || []).some(esp => esp.toLowerCase().includes(svcLower) || svcLower.includes(esp.toLowerCase())));
            especialistasPorServicio[servicio] = match.map(e => ({
                id: e.id,
                nombre: e.nombre,
                descripcion: e.descripcion || undefined,
            }));
        }
        return { servicios, especialistasPorServicio };
    }
    async _listarEspecialistas(especialidad, ctx) {
        const lista = await this.especialistaSvc.listar(ctx.clienteId, especialidad);
        if (lista.length === 0) {
            return { mensaje: 'No hay especialistas registrados para este consultorio.', especialistas: [] };
        }
        return {
            especialistas: lista.map(e => ({
                id: e.id,
                nombre: e.nombre,
                especialidades: e.especialidades || [],
                descripcion: e.descripcion || null,
            })),
        };
    }
    async _consultarDisponibilidad(fecha, especialistaId, ctx) {
        if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return { error: 'Formato de fecha inválido. Use YYYY-MM-DD.' };
        }
        if (fecha < hoy()) {
            return { error: 'No se pueden consultar fechas pasadas.' };
        }
        const slots = await this.citasSvc.disponibilidad(ctx.clienteId, fecha, especialistaId);
        if (slots.length === 0) {
            return { disponible: false, mensaje: 'No hay horarios disponibles para esa fecha.', slots: [] };
        }
        return { disponible: true, fecha, especialistaId: especialistaId || null, slots };
    }
    async _programarConsulta(input, ctx) {
        const { pacienteNombre, fecha, horaInicio, servicio, notas, especialistaId } = input;
        const pacienteTelefono = input.pacienteTelefono || ctx.from;
        if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return { error: 'Formato de fecha inválido. Usa YYYY-MM-DD (ej: 2026-05-12).' };
        }
        if (fecha < hoy()) {
            return { error: `La fecha ${fecha} ya pasó. La fecha actual es ${hoy()}. Usa una fecha futura.` };
        }
        let especialistaNombre;
        if (especialistaId) {
            const esp = await this.especialistaSvc.obtener(especialistaId, ctx.clienteId).catch(() => null);
            especialistaNombre = esp?.nombre;
        }
        const horaFin = sumar30min(horaInicio);
        const consulta = await this.citasSvc.crear(ctx.clienteId, {
            fecha,
            horaInicio,
            horaFin,
            servicio,
            pacienteNombre,
            pacienteTelefono,
            notas,
            especialistaId,
            especialistaNombre,
            estadoCita: 'PENDIENTE',
            origenRegistro: 'IA_AGENTE',
            agenteId: ctx.agenteId,
        }, constants_1.USUARIO_SISTEMA);
        return {
            exito: true,
            consultaId: consulta.id,
            mensaje: 'Consulta programada correctamente',
            resumen: {
                paciente: pacienteNombre,
                servicio,
                especialista: especialistaNombre || null,
                fecha,
                horaInicio,
                horaFin,
            },
        };
    }
    async _consultarConsultasPaciente(telefono, ctx) {
        const consultas = await this.citasSvc.citasPorTelefono(ctx.clienteId, telefono);
        const activas = consultas.filter(c => c.estadoCita !== 'CANCELADA' && c.fecha >= hoy());
        if (activas.length === 0) {
            return { mensaje: 'No se encontraron consultas activas para este número.', consultas: [] };
        }
        return {
            consultas: activas.map(c => ({
                id: c.id,
                fecha: c.fecha,
                horaInicio: c.horaInicio,
                horaFin: c.horaFin,
                servicio: c.servicio,
                especialista: c.especialistaNombre || null,
                estadoCita: c.estadoCita,
                notas: c.notas,
            })),
        };
    }
    async _reprogramarConsulta(consultaId, nuevaFecha, nuevaHoraInicio, ctx) {
        if (!nuevaFecha || !/^\d{4}-\d{2}-\d{2}$/.test(nuevaFecha)) {
            return { error: 'Formato de fecha inválido. Usa YYYY-MM-DD.' };
        }
        if (nuevaFecha < hoy()) {
            return { error: `La fecha ${nuevaFecha} ya pasó. Usa una fecha futura.` };
        }
        const nuevaHoraFin = sumar30min(nuevaHoraInicio);
        await this.citasSvc.actualizar(ctx.clienteId, consultaId, {
            fecha: nuevaFecha,
            horaInicio: nuevaHoraInicio,
            horaFin: nuevaHoraFin,
        }, constants_1.USUARIO_SISTEMA);
        return {
            exito: true,
            mensaje: 'Consulta reprogramada correctamente.',
            resumen: { consultaId, nuevaFecha, nuevaHoraInicio, nuevaHoraFin },
        };
    }
    async _cancelarConsulta(consultaId, motivo, ctx) {
        await this.citasSvc.actualizar(ctx.clienteId, consultaId, {
            estadoCita: 'CANCELADA',
            notas: motivo ? `Cancelada por el paciente: ${motivo}` : 'Cancelada por el paciente vía WhatsApp',
        }, constants_1.USUARIO_SISTEMA);
        return { exito: true, mensaje: 'Consulta cancelada correctamente.' };
    }
    async _cerrarConversacion(motivo, ctx) {
        await this.conversacionSvc.actualizarEstado(ctx.conversacionId, 'resuelto');
        this.logger.log(`[ClinicaTool] Conversación ${ctx.conversacionId} marcada como resuelta`);
        return { exito: true, mensaje: motivo || 'Conversación marcada como resuelta.' };
    }
};
ClinicaToolsService = ClinicaToolsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [citas_medicas_service_1.CitasMedicasService,
        especialista_service_1.EspecialistaService,
        conversacion_service_1.ConversacionService])
], ClinicaToolsService);
exports.ClinicaToolsService = ClinicaToolsService;
//# sourceMappingURL=clinica-tools.service.js.map