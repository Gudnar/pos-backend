import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { ConversacionService } from '../../conversacion/service/conversacion.service'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const CALIFICACION_CONFIG_KEY = 'CALIFICACION_CONFIG'

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
- 0-19: Sin intención clara o conversación negativa`

@Injectable()
export class CalificacionBackgroundService {
  private readonly logger = new Logger(CalificacionBackgroundService.name)

  constructor(
    private readonly conversacionService: ConversacionService,
    private readonly confClienteService: ConfiguracionClienteService,
  ) {}

  async calificar(
    conversacionId: string,
    mensajes: Array<{ role: string; content: string }>,
    clienteId: string,
    apiKey: string,
    modelo: string,
  ): Promise<void> {
    if (!apiKey || mensajes.length < 2) return

    try {
      const configReg = await this.confClienteService.obtenerPorClave(clienteId, CALIFICACION_CONFIG_KEY)
      let promptCalif = PROMPT_DEFAULT
      if (configReg?.valor) {
        const cfg = JSON.parse(configReg.valor)
        if (cfg.prompt?.trim()) promptCalif = cfg.prompt.trim()
      }

      const convText = mensajes
        .slice(-20)
        .map(m => `${m.role === 'user' ? 'Paciente' : 'Asistente'}: ${m.content}`)
        .join('\n')

      const res = await axios.post(
        ANTHROPIC_API,
        {
          model: modelo || 'claude-haiku-4-5',
          max_tokens: 400,
          system: promptCalif,
          messages: [{ role: 'user', content: `Conversación:\n${convText}` }],
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          timeout: 15_000,
        },
      )

      const text: string = res.data?.content?.[0]?.text || ''
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) return

      const data = JSON.parse(match[0])

      await this.conversacionService.actualizarCalificacion(conversacionId, {
        score:            typeof data.score === 'number' ? Math.min(100, Math.max(0, data.score)) : undefined,
        intencion:        data.intencion        || undefined,
        urgencia:         data.urgencia         || undefined,
        sentimiento:      data.sentimiento      || undefined,
        servicioDetectado: data.servicioDetectado || undefined,
        etapaFunnel:      data.etapaFunnel      || undefined,
        datosCapturados:  data.datosCapturados  || undefined,
        scoreMotivo:      data.motivo           || undefined,
      })

      this.logger.log(`[Calificacion] conv ${conversacionId} → score=${data.score} intencion=${data.intencion}`)
    } catch (err: any) {
      this.logger.warn(`[Calificacion] Error en conv ${conversacionId}: ${err.message}`)
    }
  }
}
