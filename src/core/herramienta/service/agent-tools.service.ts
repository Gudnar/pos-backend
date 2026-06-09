import { Injectable, Logger } from '@nestjs/common'
import { HerramientaService } from './herramienta.service'
import { ConversacionService } from '../../conversacion/service/conversacion.service'
import { Herramienta } from '../entity/herramienta.entity'

function parsearParametros(parametros: string[]): {
  type: 'object'
  properties: Record<string, any>
  required: string[]
} {
  const properties: Record<string, any> = {}
  const required: string[] = []

  for (const param of parametros) {
    const isOptional = param.includes('?')
    const clean = param.replace('?', '')
    const colonIdx = clean.indexOf(':')
    if (colonIdx === -1) continue

    const name = clean.slice(0, colonIdx).trim()
    const typePart = clean.slice(colonIdx + 1).trim()

    if (typePart.includes("'") && typePart.includes('|')) {
      const enumVals = [...typePart.matchAll(/'([^']+)'/g)].map(m => m[1])
      properties[name] = { type: 'string', enum: enumVals, description: param }
    } else if (typePart.startsWith('number')) {
      properties[name] = { type: 'number', description: param }
    } else if (typePart.startsWith('boolean')) {
      properties[name] = { type: 'boolean', description: param }
    } else {
      properties[name] = { type: 'string', description: param }
    }

    if (!isOptional) required.push(name)
  }

  return { type: 'object', properties, required }
}

@Injectable()
export class AgentToolsService {
  private readonly logger = new Logger(AgentToolsService.name)

  constructor(
    private readonly herramientaService: HerramientaService,
    private readonly conversacionService: ConversacionService,
  ) {}

  // ── Build Anthropic tool defs from DB herramientas ───────────────

  async getToolDefs(agenteId: string): Promise<any[]> {
    const herramientas = await this.herramientaService.listarPorAgente(agenteId)
    return this.buildDefs(herramientas.filter(h => h.activa))
  }

  buildDefs(herramientas: Herramienta[]): any[] {
    return herramientas.map(h => ({
      name: h.nombre,
      description: h.descripcion,
      input_schema: parsearParametros(h.parametros || []),
    }))
  }

  async getNombres(agenteId: string): Promise<Set<string>> {
    const herramientas = await this.herramientaService.listarPorAgente(agenteId)
    return new Set(herramientas.filter(h => h.activa).map(h => h.nombre))
  }

  // ── Execute ──────────────────────────────────────────────────────

  async ejecutar(nombre: string, input: Record<string, any>, conversacionId: string): Promise<any> {
    this.logger.log(`[AgentTools] ${nombre} → conv=${conversacionId}`)
    try {
      switch (nombre) {
        case 'calificar_lead':
          await this.conversacionService.actualizarCalificacion(conversacionId, {
            score:       Number(input.score) || 0,
            scoreMotivo: String(input.razon || input.motivo || ''),
          })
          return { exito: true, mensaje: `Lead calificado con score ${input.score}` }

        case 'cambiar_estado':
          await this.conversacionService.actualizarEstado(conversacionId, input.estado)
          return { exito: true, mensaje: `Estado cambiado a "${input.estado}"` }

        case 'escalar_agente':
          await this.conversacionService.actualizarEscalado(
            conversacionId, true,
            `[Escalado] ${input.razon || ''}${input.prioridad ? ` | Prioridad: ${input.prioridad}` : ''}`,
          )
          return { exito: true, mensaje: 'Conversación escalada a un agente humano' }

        case 'crear_nota':
          await this.conversacionService.agregarNota(conversacionId, input.nota)
          return { exito: true, mensaje: 'Nota interna creada' }

        default:
          this.logger.log(`[AgentTools] Herramienta personalizada: ${nombre} input=${JSON.stringify(input)}`)
          return { exito: true, mensaje: `${nombre} ejecutado`, datos: input }
      }
    } catch (err: any) {
      this.logger.warn(`[AgentTools] Error en ${nombre}: ${err.message}`)
      return { error: err.message }
    }
  }
}
