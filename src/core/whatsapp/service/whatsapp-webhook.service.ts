import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { WhatsappService, WaConfig } from './whatsapp.service'
import { ConversacionService } from '../../conversacion/service/conversacion.service'
import { AgenteService } from '../../agente/service/agente.service'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { ClienteService } from '../../cliente/service/cliente.service'
import { ClinicaToolsService } from './clinica-tools.service'
import { CalificacionBackgroundService } from './calificacion-background.service'
import { CampanaService } from '../../campana/service/campana.service'
import { AgentToolsService } from '../../herramienta/service/agent-tools.service'
import { BizIntelToolsService } from '../../biz-intel/service/biz-intel-tools.service'
import { AdminGerenteService } from '../../admin-gerente/service/admin-gerente.service'
import { WaWebhookMessage } from '../dto/whatsapp.dto'
import { USUARIO_SISTEMA } from '../../../common/constants'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const MAX_HISTORY_MESSAGES = 20
const MAX_TOOL_ITERATIONS = 6

@Injectable()
export class WhatsappWebhookService {
  private readonly logger = new Logger(WhatsappWebhookService.name)

  constructor(
    private readonly waService: WhatsappService,
    private readonly conversacionService: ConversacionService,
    private readonly agenteService: AgenteService,
    private readonly confClienteService: ConfiguracionClienteService,
    private readonly clienteService: ClienteService,
    private readonly clinicaTools: ClinicaToolsService,
    private readonly calificacionBg: CalificacionBackgroundService,
    private readonly campanaService: CampanaService,
    private readonly agentTools: AgentToolsService,
    private readonly bizIntelTools: BizIntelToolsService,
    private readonly adminGerenteService: AdminGerenteService,
  ) {}

  // ── Main entry point called by controller ────────────────────

  async procesarMensajeEntrante(
    rawMessage: WaWebhookMessage,
    contactName: string,
    phoneNumberId: string,
  ): Promise<void> {
    const textoUsuario = this.extraerTexto(rawMessage)
    if (!textoUsuario) {
      this.logger.log(`[WA] Tipo no soportado: ${rawMessage.type} — ignorado`)
      return
    }

    const from = rawMessage.from

    const clienteId = await this.confClienteService.resolverClientePorPhoneNumberId(phoneNumberId)
    if (!clienteId) {
      this.logger.warn(`[WA] No se encontró cliente para phoneNumberId: ${phoneNumberId}`)
      return
    }

    this.logger.log(`[WA] Mensaje de ${from} (${contactName}) → cliente ${clienteId}: "${textoUsuario.slice(0, 80)}"`)

    try {
      // ── Detección del dueño ──────────────────────────────────
      const ownerCfg = await this.confClienteService.obtenerPorClave(clienteId, 'OWNER_WHATSAPP').catch(() => null)
      if (ownerCfg?.valor && ownerCfg.valor.trim() === from) {
        this.logger.log(`[WA] Mensaje del dueño (${from}) — modo BI`)
        const config = await this.waService.obtenerConfig(clienteId)
        this.waService.marcarLeido(rawMessage.id, config).catch(() => {})
        this.waService.mostrarTyping(rawMessage.id, config).catch(() => {})
        await this.procesarMensajeDueno(from, textoUsuario, clienteId, config)
        return
      }

      // ── Validación de usuario administrador (Gerente vía WhatsApp) ──────────
      const adminUser = await this.adminGerenteService.resolverAdmin(from, clienteId)
      if (adminUser) {
        this.logger.log(`[WA] Mensaje del Gerente ${adminUser.nombres} (${adminUser.rol})`)
        const adminConfig = await this.waService.obtenerConfig(clienteId)
        this.waService.marcarLeido(rawMessage.id, adminConfig).catch(() => {})
        this.waService.mostrarTyping(rawMessage.id, adminConfig).catch(() => {})
        const apiKeyCfg = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY').catch(() => null)
        const apiKey = apiKeyCfg?.valor
        if (apiKey && !apiKey.includes('•')) {
          const cliente = await this.clienteService.obtener(clienteId)
          const respuesta = await this.adminGerenteService.obtenerRespuesta(
            textoUsuario, adminUser, clienteId, apiKey, cliente?.nombre || 'la empresa',
          )
          if (respuesta) await this.waService.enviarTexto(from, respuesta, adminConfig)
        } else {
          this.logger.error('[WA-Admin] ANTHROPIC_API_KEY no configurada para este cliente')
        }
        return
      }

      const config = await this.waService.obtenerConfig(clienteId)
      if (!config.enabled) {
        this.logger.warn('[WA] Canal desactivado, mensaje ignorado')
        return
      }

      this.waService.marcarLeido(rawMessage.id, config).catch(() => {})
      this.waService.mostrarTyping(rawMessage.id, config).catch(() => {})

      if (!config.agenteId) {
        this.logger.warn('[WA] No hay agente asignado al canal WhatsApp')
        return
      }

      const origenReferral = rawMessage.referral?.source_id || rawMessage.referral?.ctwa_clid
      const agenteEfectivoId = await this.resolverAgenteEfectivo(textoUsuario, config.agenteId, clienteId, from, 'whatsapp', origenReferral)
      const agente = await this.agenteService.obtener(agenteEfectivoId, clienteId)
      if (!agente || !agente.activo) {
        this.logger.warn(`[WA] Agente ${config.agenteId} inactivo o no encontrado`)
        return
      }

      const conversacion = await this.encontrarOCrearConversacion(from, contactName, agente.id, clienteId)

      await this.conversacionService.agregarMensaje(conversacion.id, { role: 'user', content: textoUsuario })

      const convActualizada = await this.conversacionService.obtener(conversacion.id)
      const historial = (convActualizada.mensajes || [])
        .slice(-MAX_HISTORY_MESSAGES)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

      const resultado = await this.llamarClaudeConHerramientas(agente, historial, clienteId, from, conversacion.id)
      if (!resultado) return

      await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: resultado.texto })
      await this.agenteService.incrementarContadores(agente.id, 1)
      await this.waService.enviarTexto(from, resultado.texto, config)

      // Enviar menú interactivo de servicios después del texto de Claude
      if (resultado.serviciosLista?.length) {
        this.waService.enviarListaServicios(from, resultado.serviciosLista, config)
          .catch(e => this.logger.warn(`[WA] Lista interactiva: ${e.message}`))
      }

      this.logger.log(`[WA] Respuesta enviada a ${from}: "${resultado.texto.slice(0, 80)}"`)

      // Calificación IA en background (no bloquea la respuesta)
      const apiKeyConfig = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY').catch(() => null)
      if (apiKeyConfig?.valor && !apiKeyConfig.valor.includes('•')) {
        const convFinal = await this.conversacionService.obtener(conversacion.id).catch(() => null)
        if (convFinal) {
          const msgs = (convFinal.mensajes || []).map(m => ({ role: m.role, content: m.content }))
          this.calificacionBg.calificar(conversacion.id, msgs, clienteId, apiKeyConfig.valor, agente.modelo)
            .catch(e => this.logger.warn(`[Calificacion] ${e.message}`))
        }
      }
    } catch (err: any) {
      this.logger.error(`[WA] Error procesando mensaje de ${from}: ${err.message}`)
    }
  }

  // ── Agente del dueño — Inteligencia de Negocio ───────────────

  private async procesarMensajeDueno(
    from: string,
    texto: string,
    clienteId: string,
    config: any,
  ): Promise<void> {
    const apiKeyConfig = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY').catch(() => null)
    const apiKey = apiKeyConfig?.valor
    if (!apiKey || apiKey.includes('•')) {
      this.logger.error('[WA-Dueño] ANTHROPIC_API_KEY no configurada')
      return
    }

    const promptCfg = await this.confClienteService.obtenerPorClave(clienteId, 'OWNER_SYSTEM_PROMPT').catch(() => null)
    const systemPrompt = promptCfg?.valor ||
      `Eres el asistente personal del dueño del negocio. Proporciona información precisa sobre ventas, inventario, finanzas y logística usando las herramientas disponibles. Responde de forma clara, estructurada y en español. Incluye números concretos siempre que sea posible.`

    const toolDefs = this.bizIntelTools.getToolDefs()
    const messages: any[] = [{ role: 'user', content: texto }]

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      try {
        const res = await axios.post(ANTHROPIC_API, {
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
          system: systemPrompt,
          messages,
          tools: toolDefs,
        }, {
          headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        })

        const data = res.data
        if (data.stop_reason === 'end_turn') {
          const textBlock = data.content?.find((b: any) => b.type === 'text')
          if (textBlock?.text) {
            await this.waService.enviarTexto(from, textBlock.text, config)
            this.logger.log(`[WA-Dueño] Respuesta enviada: "${textBlock.text.slice(0, 80)}"`)
          }
          return
        }

        if (data.stop_reason === 'tool_use') {
          const toolUses = data.content.filter((b: any) => b.type === 'tool_use')
          this.logger.log(`[WA-Dueño] Herramientas: ${toolUses.map((b: any) => b.name).join(', ')}`)

          const toolResults = await Promise.all(
            toolUses.map(async (tu: any) => {
              const result = await this.bizIntelTools.ejecutar(tu.name, tu.input || {}, clienteId)
              return { type: 'tool_result' as const, tool_use_id: tu.id, content: JSON.stringify(result) }
            }),
          )

          messages.push({ role: 'assistant', content: data.content })
          messages.push({ role: 'user', content: toolResults })
          continue
        }

        break
      } catch (err: any) {
        this.logger.error(`[WA-Dueño] Error iter ${i}: ${err?.response?.data?.error?.message || err.message}`)
        return
      }
    }
  }

  // ── Claude con tool use (loop agentic) ───────────────────────

  private async llamarClaudeConHerramientas(
    agente: any,
    mensajesIniciales: Array<{ role: 'user' | 'assistant'; content: any }>,
    clienteId: string,
    from: string,
    conversacionId: string,
  ): Promise<{ texto: string; serviciosLista?: string[] } | null> {
    const apiKeyConfig = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY')
    const apiKey = apiKeyConfig?.valor
    if (!apiKey || apiKey.includes('•')) {
      this.logger.error('[WA] ANTHROPIC_API_KEY no configurada para este cliente')
      return null
    }

    const cliente = await this.clienteService.obtener(clienteId)
    const nombreEmpresa = cliente?.nombre || agente.nombre

    const rawPrompt = agente.systemPrompt ||
      `Eres ${agente.nombre}, un asistente IA ${agente.tono || 'profesional'}. Responde en ${agente.idioma || 'español'} de forma concisa y útil.`
    const systemPrompt = rawPrompt.replace(/\[NOMBRE_DEL_CONSULTORIO\]/g, nombreEmpresa)

    const clinicaToolDefs = await this.clinicaTools.getToolDefs(clienteId)
    const agentToolDefs = await this.agentTools.getToolDefs(agente.id)
    const agentToolNames = await this.agentTools.getNombres(agente.id)
    const allToolDefs = [...(clinicaToolDefs || []), ...agentToolDefs]

    const effectiveSystemPrompt = clinicaToolDefs
      ? systemPrompt + await this.clinicaTools.getSystemAddendum(clienteId)
      : systemPrompt
    const effectiveMaxTokens = allToolDefs.length > 0
      ? Math.max(agente.maxTokens || 1024, 1024)
      : (agente.maxTokens || 512)
    const messages: any[] = [...mensajesIniciales]

    let serviciosLista: string[] | undefined

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      try {
        const payload: any = {
          model: agente.modelo || 'claude-haiku-4-5',
          max_tokens: effectiveMaxTokens,
          system: effectiveSystemPrompt,
          messages,
        }
        if (allToolDefs.length > 0) payload.tools = allToolDefs

        const res = await axios.post(ANTHROPIC_API, payload, {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        })

        const data = res.data
        const stopReason: string = data.stop_reason

        if (stopReason === 'end_turn') {
          const textBlock = data.content?.find((b: any) => b.type === 'text')
          const texto = textBlock?.text
          if (!texto) return null
          return { texto, serviciosLista }
        }

        if (stopReason === 'tool_use') {
          const toolUseBlocks = data.content.filter((b: any) => b.type === 'tool_use')
          if (toolUseBlocks.length === 0) break

          this.logger.log(`[WA] Claude usa ${toolUseBlocks.length} herramienta(s): ${toolUseBlocks.map((b: any) => b.name).join(', ')}`)

          const toolResults = await Promise.all(
            toolUseBlocks.map(async (tu: any) => {
              let result: any
              if (agentToolNames.has(tu.name)) {
                result = await this.agentTools.ejecutar(tu.name, tu.input || {}, conversacionId)
              } else {
                result = await this.clinicaTools.ejecutar(tu.name, tu.input || {}, {
                  clienteId,
                  agenteId: agente.id,
                  from,
                  conversacionId,
                })
              }

              if (tu.name === 'obtener_servicios' && Array.isArray(result.servicios)) {
                serviciosLista = result.servicios
              }

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

        this.logger.warn(`[WA] stop_reason inesperado: ${stopReason}`)
        break
      } catch (err: any) {
        this.logger.error(`[WA] Error llamando a Claude (iter ${i}): ${err?.response?.data?.error?.message || err.message}`)
        return null
      }
    }

    return null
  }

  // ── Routing ──────────────────────────────────────────────────

  private async resolverAgenteEfectivo(
    texto: string,
    defaultAgenteId: string,
    clienteId: string,
    from: string,
    canal: string,
    origen?: string,
  ): Promise<string> {
    // 1. Stickiness
    const convAbierta = await this.conversacionService.buscarAbiertaPorContacto(clienteId, from)
    if (convAbierta) {
      this.logger.log(`[WA] Stickiness: agente ${convAbierta.agenteId} de conversación abierta`)
      return convAbierta.agenteId
    }

    // 2. Campaña por canal + origen
    const campana = await this.campanaService.resolverPorCanalYOrigen(clienteId, canal, origen)
    if (campana) {
      this.logger.log(`[WA] Campaña "${campana.nombre}" (${canal}/${origen || '*'}) → agente ${campana.agenteId}`)
      return campana.agenteId
    }

    // 3. Palabras clave
    const reglas = await this.waService.obtenerReglas(clienteId)
    const textoLower = texto.toLowerCase()
    for (const regla of reglas) {
      if (regla.agenteId && Array.isArray(regla.palabrasClave)) {
        for (const kw of regla.palabrasClave as string[]) {
          if (kw && textoLower.includes(kw.toLowerCase())) {
            this.logger.log(`[WA] Routing keyword "${kw}" → agente ${regla.agenteId}`)
            return regla.agenteId
          }
        }
      }
    }

    // 4. Default
    return defaultAgenteId
  }

  // ── Helpers ──────────────────────────────────────────────────

  private extraerTexto(msg: WaWebhookMessage): string | null {
    if (msg.type === 'text') return msg.text?.body || null
    if (msg.type === 'button') return msg.button?.text || null
    if (msg.type === 'interactive') {
      return msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || null
    }
    return null
  }

  private async encontrarOCrearConversacion(from: string, contactName: string, agenteId: string, clienteId: string) {
    const existentes = await this.conversacionService.listar(clienteId, agenteId)
    const delContacto = existentes.filter(c => c.contacto === from && c.canal === 'whatsapp')

    const abierta = delContacto.find(c => c.estadoConversacion !== 'resuelto' && c.estadoConversacion !== 'cerrado')
    if (abierta) return abierta

    const cerrada = delContacto[0]
    if (cerrada) {
      await this.conversacionService.actualizarEstado(cerrada.id, 'abierto')
      this.logger.log(`[WA] Conversación ${cerrada.id} reabierta para ${from}`)
      return { ...cerrada, estadoConversacion: 'abierto' }
    }

    return this.conversacionService.crear(
      {
        agenteId,
        contacto: from,
        canal: 'whatsapp',
        etiquetas: [],
        notas: contactName !== from ? `Nombre: ${contactName}` : undefined,
      },
      USUARIO_SISTEMA,
      clienteId,
    )
  }
}
