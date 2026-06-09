import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { FacebookService } from './facebook.service'
import { ConversacionService } from '../../conversacion/service/conversacion.service'
import { AgenteService } from '../../agente/service/agente.service'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { CampanaService } from '../../campana/service/campana.service'
import { AgentToolsService } from '../../herramienta/service/agent-tools.service'
import { USUARIO_SISTEMA } from '../../../common/constants'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const MAX_HISTORY = 20
const MAX_ITERS = 5

@Injectable()
export class FacebookWebhookService {
  private readonly logger = new Logger(FacebookWebhookService.name)

  constructor(
    private readonly fbService: FacebookService,
    private readonly conversacionService: ConversacionService,
    private readonly agenteService: AgenteService,
    private readonly confClienteService: ConfiguracionClienteService,
    private readonly campanaService: CampanaService,
    private readonly agentTools: AgentToolsService,
  ) {}

  // ── Entry point: one page entry from Meta webhook ────────────────

  async procesarEntrada(entry: any, pageId: string): Promise<void> {
    const clienteId = await this.confClienteService.resolverClientePorPageId(pageId)
    if (!clienteId) {
      this.logger.warn(`[FB] No se encontró cliente para pageId: ${pageId}`)
      return
    }

    const config = await this.fbService.obtenerConfig(clienteId)
    if (!config.enabled) return

    // Messenger messages
    for (const msg of entry.messaging || []) {
      if (msg.message && !msg.message.is_echo) {
        this.procesarMensajeMessenger(msg, clienteId, config).catch(e =>
          this.logger.error(`[FB] Messenger error: ${e.message}`),
        )
      }
    }

    // Page feed events (comments on posts)
    for (const change of entry.changes || []) {
      if (change.field === 'feed' && config.replyComments) {
        const v = change.value
        if (v?.item === 'comment' && v?.verb === 'add' && v?.from?.id !== pageId) {
          this.procesarComentario(v, clienteId, config).catch(e =>
            this.logger.error(`[FB] Comment error: ${e.message}`),
          )
        }
      }
    }
  }

  // ── Messenger ────────────────────────────────────────────────────

  private async procesarMensajeMessenger(msg: any, clienteId: string, config: any): Promise<void> {
    const senderId: string = msg.sender.id
    const texto: string = msg.message.text || ''
    if (!texto.trim()) return

    this.logger.log(`[FB/Messenger] De ${senderId}: "${texto.slice(0, 80)}"`)

    this.fbService.marcarLeidoMessenger(senderId, config).catch(() => {})
    this.fbService.mostrarTypingMessenger(senderId, config).catch(() => {})

    const agenteId = await this.resolverAgente(texto, config.messengerAgenteId, clienteId, senderId, 'messenger')
    if (!agenteId) { this.logger.warn('[FB] Sin agente para Messenger'); return }

    const agente = await this.agenteService.obtener(agenteId, clienteId)
    if (!agente?.activo) return

    const conversacion = await this.encontrarOCrearConversacion(senderId, agenteId, clienteId, 'messenger')
    await this.conversacionService.agregarMensaje(conversacion.id, { role: 'user', content: texto })

    const convActual = await this.conversacionService.obtener(conversacion.id)
    const historial = (convActual.mensajes || [])
      .slice(-MAX_HISTORY)
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    const respuesta = await this.llamarClaude(agente, historial, clienteId, conversacion.id)
    if (!respuesta) return

    await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: respuesta })
    await this.agenteService.incrementarContadores(agente.id, 1)
    await this.fbService.enviarMensajeMessenger(senderId, respuesta, config)

    this.logger.log(`[FB/Messenger] Respuesta enviada a ${senderId}: "${respuesta.slice(0, 80)}"`)
  }

  // ── Post comments ────────────────────────────────────────────────

  private async procesarComentario(value: any, clienteId: string, config: any): Promise<void> {
    const userId: string   = value.from?.id
    const userName: string = value.from?.name || userId
    const commentId: string = value.comment_id
    const postId: string   = value.post_id
    const texto: string    = value.message || ''

    if (!texto.trim() || !commentId) return

    this.logger.log(`[FB/Comment] De ${userName} en post ${postId}: "${texto.slice(0, 80)}"`)

    const defaultAgenteId = config.commentsAgenteId || config.messengerAgenteId
    const agenteId = await this.resolverAgente(texto, defaultAgenteId, clienteId, userId, 'facebook-comment', postId)
    if (!agenteId) { this.logger.warn('[FB] Sin agente para comentarios'); return }

    const agente = await this.agenteService.obtener(agenteId, clienteId)
    if (!agente?.activo) return

    const conversacion = await this.encontrarOCrearConversacion(
      userId, agenteId, clienteId, 'facebook-comment',
      `Comentario en post ${postId}. Usuario: ${userName}`,
    )

    const contexto = `[Comentario de ${userName} en publicación]: ${texto}`
    await this.conversacionService.agregarMensaje(conversacion.id, { role: 'user', content: contexto })

    const convActual = await this.conversacionService.obtener(conversacion.id)
    const historial = (convActual.mensajes || [])
      .slice(-MAX_HISTORY)
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    const respuesta = await this.llamarClaude(agente, historial, clienteId, conversacion.id)
    if (!respuesta) return

    await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: respuesta })
    await this.agenteService.incrementarContadores(agente.id, 1)
    await this.fbService.responderComentario(commentId, respuesta, config)

    this.logger.log(`[FB/Comment] Respuesta publicada en comentario ${commentId}`)
  }

  // ── Helpers ──────────────────────────────────────────────────────

  private async resolverAgente(
    texto: string,
    defaultAgenteId: string,
    clienteId: string,
    contacto: string,
    canal: string,
    origen?: string,
  ): Promise<string | null> {
    if (!defaultAgenteId) return null

    // 1. Conversación abierta (stickiness)
    const conv = await this.conversacionService.buscarAbiertaPorContacto(clienteId, contacto, canal)
    if (conv) return conv.agenteId

    // 2. Campaña por canal + origen
    const campana = await this.campanaService.resolverPorCanalYOrigen(clienteId, canal, origen)
    if (campana) return campana.agenteId

    // 3. Default
    return defaultAgenteId
  }

  private async encontrarOCrearConversacion(
    contacto: string,
    agenteId: string,
    clienteId: string,
    canal: string,
    notas?: string,
  ) {
    const conv = await this.conversacionService.buscarAbiertaPorContacto(clienteId, contacto, canal)
    if (conv) return conv

    return this.conversacionService.crear(
      { agenteId, contacto, canal, etiquetas: [], notas },
      USUARIO_SISTEMA,
      clienteId,
    )
  }

  private async llamarClaude(
    agente: any,
    mensajesIniciales: Array<{ role: 'user' | 'assistant'; content: any }>,
    clienteId: string,
    conversacionId: string,
  ): Promise<string | null> {
    const apiKeyConfig = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY')
    const apiKey = apiKeyConfig?.valor
    if (!apiKey || apiKey.includes('•')) {
      this.logger.error('[FB] ANTHROPIC_API_KEY no configurada')
      return null
    }

    const systemPrompt = agente.systemPrompt ||
      `Eres ${agente.nombre}, un asistente IA ${agente.tono || 'profesional'}. Responde en ${agente.idioma || 'español'} de forma concisa y útil.`

    const agentToolDefs = await this.agentTools.getToolDefs(agente.id)
    const agentToolNames = await this.agentTools.getNombres(agente.id)
    const hasTools = agentToolDefs.length > 0
    const maxTokens = hasTools ? Math.max(agente.maxTokens || 1024, 1024) : (agente.maxTokens || 512)
    const messages: any[] = [...mensajesIniciales]

    for (let i = 0; i < MAX_ITERS; i++) {
      try {
        const payload: any = {
          model: agente.modelo || 'claude-haiku-4-5',
          max_tokens: maxTokens,
          system: systemPrompt,
          messages,
        }
        if (hasTools) payload.tools = agentToolDefs

        const res = await axios.post(ANTHROPIC_API, payload, {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        })

        const data = res.data
        if (data.stop_reason === 'end_turn') {
          return data.content?.find((b: any) => b.type === 'text')?.text || null
        }

        if (data.stop_reason === 'tool_use') {
          const toolUseBlocks = data.content.filter((b: any) => b.type === 'tool_use')
          if (!toolUseBlocks.length) break

          this.logger.log(`[FB] Claude usa ${toolUseBlocks.length} herramienta(s): ${toolUseBlocks.map((b: any) => b.name).join(', ')}`)

          const toolResults = await Promise.all(
            toolUseBlocks.map(async (tu: any) => {
              const result = agentToolNames.has(tu.name)
                ? await this.agentTools.ejecutar(tu.name, tu.input || {}, conversacionId)
                : { error: `Herramienta desconocida: ${tu.name}` }
              return {
                type: 'tool_result' as const,
                tool_use_id: tu.id,
                content: JSON.stringify(result),
              }
            }),
          )

          messages.push({ role: 'assistant', content: data.content })
          messages.push({ role: 'user', content: toolResults })
          continue
        }

        break
      } catch (err: any) {
        this.logger.error(`[FB] Error Claude (iter ${i}): ${err?.response?.data?.error?.message || err.message}`)
        return null
      }
    }
    return null
  }
}
