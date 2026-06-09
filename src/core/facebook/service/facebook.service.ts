import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'

const FB_API_VERSION = 'v19.0'
const FB_BASE = `https://graph.facebook.com/${FB_API_VERSION}`

export interface FbConfig {
  pageAccessToken: string
  pageId: string
  verifyToken: string
  messengerAgenteId: string
  commentsAgenteId: string
  enabled: boolean
  replyComments: boolean
}

@Injectable()
export class FacebookService {
  private readonly logger = new Logger(FacebookService.name)

  constructor(private readonly confClienteService: ConfiguracionClienteService) {}

  // ── Config ──────────────────────────────────────────────────────

  async obtenerConfig(clienteId: string): Promise<FbConfig> {
    const claves = [
      'FB_PAGE_ACCESS_TOKEN', 'FB_PAGE_ID', 'FB_VERIFY_TOKEN',
      'FB_MESSENGER_AGENTE_ID', 'FB_COMMENTS_AGENTE_ID', 'FB_ENABLED', 'FB_REPLY_COMMENTS',
    ]
    const configs = await Promise.all(claves.map(c => this.confClienteService.obtenerPorClave(clienteId, c)))
    return {
      pageAccessToken:   configs[0]?.valor || '',
      pageId:            configs[1]?.valor || '',
      verifyToken:       configs[2]?.valor || 'fb_verify_token',
      messengerAgenteId: configs[3]?.valor || '',
      commentsAgenteId:  configs[4]?.valor || '',
      enabled:           configs[5]?.valor === 'true',
      replyComments:     configs[6]?.valor !== 'false',
    }
  }

  async guardarConfig(clienteId: string, data: Partial<FbConfig>, usuarioId: string): Promise<void> {
    const entries = [
      { clave: 'FB_PAGE_ID',              valor: data.pageId            ?? '', esSecreto: false, desc: 'Facebook Page ID' },
      { clave: 'FB_VERIFY_TOKEN',         valor: data.verifyToken       ?? '', esSecreto: false, desc: 'Token verificación webhook Facebook' },
      { clave: 'FB_MESSENGER_AGENTE_ID',  valor: data.messengerAgenteId ?? '', esSecreto: false, desc: 'Agente IA para Messenger' },
      { clave: 'FB_COMMENTS_AGENTE_ID',   valor: data.commentsAgenteId  ?? '', esSecreto: false, desc: 'Agente IA para comentarios de publicaciones' },
      { clave: 'FB_ENABLED',              valor: String(data.enabled      ?? false), esSecreto: false, desc: 'Facebook activo/inactivo' },
      { clave: 'FB_REPLY_COMMENTS',       valor: String(data.replyComments ?? true), esSecreto: false, desc: 'Auto-responder comentarios en publicaciones' },
    ]
    if (data.pageAccessToken?.trim()) {
      entries.push({ clave: 'FB_PAGE_ACCESS_TOKEN', valor: data.pageAccessToken.trim(), esSecreto: true, desc: 'Facebook Page Access Token' })
    }
    for (const { clave, valor, esSecreto, desc } of entries) {
      if (valor !== '') {
        await this.confClienteService.set(clienteId, { clave, valor, esSecreto, descripcion: desc }, usuarioId)
      }
    }
  }

  // ── Messenger API ─────────────────────────────────────────────────

  async enviarMensajeMessenger(recipientPsid: string, text: string, config: FbConfig): Promise<void> {
    if (!config.pageAccessToken) throw new Error('FB_PAGE_ACCESS_TOKEN no configurado')
    try {
      await axios.post(
        `${FB_BASE}/me/messages`,
        { recipient: { id: recipientPsid }, message: { text }, messaging_type: 'RESPONSE' },
        { params: { access_token: config.pageAccessToken } },
      )
      this.logger.log(`[FB] Mensaje Messenger enviado a ${recipientPsid}`)
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message
      this.logger.error(`[FB] Error Messenger API: ${msg}`)
      throw new Error(msg)
    }
  }

  async mostrarTypingMessenger(recipientPsid: string, config: FbConfig): Promise<void> {
    try {
      await axios.post(
        `${FB_BASE}/me/messages`,
        { recipient: { id: recipientPsid }, sender_action: 'typing_on' },
        { params: { access_token: config.pageAccessToken } },
      )
    } catch { /* non-critical */ }
  }

  async marcarLeidoMessenger(recipientPsid: string, config: FbConfig): Promise<void> {
    try {
      await axios.post(
        `${FB_BASE}/me/messages`,
        { recipient: { id: recipientPsid }, sender_action: 'mark_seen' },
        { params: { access_token: config.pageAccessToken } },
      )
    } catch { /* non-critical */ }
  }

  // ── Graph API — Comments ──────────────────────────────────────────

  async responderComentario(commentId: string, text: string, config: FbConfig): Promise<void> {
    if (!config.pageAccessToken) throw new Error('FB_PAGE_ACCESS_TOKEN no configurado')
    try {
      await axios.post(
        `${FB_BASE}/${commentId}/comments`,
        { message: text },
        { params: { access_token: config.pageAccessToken } },
      )
      this.logger.log(`[FB] Comentario respondido en ${commentId}`)
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message
      this.logger.error(`[FB] Error respondiendo comentario: ${msg}`)
      throw new Error(msg)
    }
  }

  // ── Publicaciones ────────────────────────────────────────────────

  async obtenerPublicaciones(clienteId: string): Promise<any[]> {
    const config = await this.obtenerConfig(clienteId)
    if (!config.pageAccessToken || !config.pageId) {
      throw new Error('Facebook no configurado. Guarda el Page Access Token y Page ID primero.')
    }
    const res = await axios.get(`${FB_BASE}/${config.pageId}/posts`, {
      params: {
        fields: 'id,message,story,created_time,full_picture,permalink_url',
        limit: 25,
        access_token: config.pageAccessToken,
      },
    })
    return (res.data.data || []).map((p: any) => ({
      id:           p.id,
      texto:        p.message || p.story || '(sin texto)',
      imagen:       p.full_picture || null,
      enlace:       p.permalink_url || null,
      fechaPublicacion: p.created_time,
    }))
  }

  // ── Test connection ───────────────────────────────────────────────

  async testConexion(pageAccessToken: string, pageId: string): Promise<{ valida: boolean; info?: any; mensaje: string }> {
    try {
      const res = await axios.get(`${FB_BASE}/${pageId}`, {
        params: { fields: 'id,name,fan_count,verification_status', access_token: pageAccessToken },
      })
      const d = res.data
      return {
        valida: true,
        info: { nombre: d.name, seguidores: d.fan_count, verificada: d.verification_status },
        mensaje: `✅ Conectado: ${d.name}`,
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message || 'Error de conexión'
      return { valida: false, mensaje: `❌ ${msg}` }
    }
  }
}
