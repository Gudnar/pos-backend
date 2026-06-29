import { Injectable, Logger } from '@nestjs/common'
import * as crypto from 'crypto'
import axios from 'axios'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { IngresosService } from '../../ingresos/service/ingresos.service'
import { GastosService } from '../../gastos/service/gastos.service'
import { USUARIO_SISTEMA } from '../../../common/constants'
import {
  WaFlowEncryptedRequest,
  WaFlowActionPayload,
  WaFlowResponsePayload,
} from '../dto/whatsapp-flows.dto'

const WA_API_VERSION = 'v19.0'
const WA_BASE_URL    = `https://graph.facebook.com/${WA_API_VERSION}`

function fechaHoy(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

@Injectable()
export class WhatsappFlowsService {
  private readonly logger = new Logger(WhatsappFlowsService.name)

  constructor(
    private readonly confClienteService: ConfiguracionClienteService,
    private readonly ingresosService: IngresosService,
    private readonly gastosService: GastosService,
  ) {}

  // ── Enviar Flow al teléfono del Gerente ──────────────────────────────────

  async enviarFlow(to: string, clienteId: string): Promise<void> {
    const [tokenCfg, phoneIdCfg, flowIdCfg, flowTokenCfg] = await Promise.all([
      this.confClienteService.obtenerPorClave(clienteId, 'WA_ACCESS_TOKEN'),
      this.confClienteService.obtenerPorClave(clienteId, 'WA_PHONE_NUMBER_ID'),
      this.confClienteService.obtenerPorClave(clienteId, 'WA_FLOW_ID'),
      this.confClienteService.obtenerPorClave(clienteId, 'WA_FLOW_TOKEN'),
    ])

    const accessToken   = tokenCfg?.valor   || ''
    const phoneNumberId = phoneIdCfg?.valor  || ''
    const flowId        = flowIdCfg?.valor   || ''
    const flowToken     = flowTokenCfg?.valor || 'flow_default'

    if (!accessToken || !phoneNumberId || !flowId) {
      this.logger.error('[FLOW] Configuración incompleta: WA_ACCESS_TOKEN / WA_PHONE_NUMBER_ID / WA_FLOW_ID')
      return
    }

    const body = {
      messaging_product: 'whatsapp',
      recipient_type:    'individual',
      to:                to.replace(/\D/g, ''),
      type:              'interactive',
      interactive: {
        type:   'flow',
        header: { type: 'text', text: 'Registrar movimiento' },
        body:   { text: 'Completa el formulario para registrar un ingreso o gasto.' },
        footer: { text: 'Sistema de gestión' },
        action: {
          name: 'flow',
          parameters: {
            flow_message_version: '3',
            flow_token:           flowToken,
            flow_id:              flowId,
            flow_cta:             'Abrir formulario',
            flow_action:          'navigate',
            flow_action_payload: {
              screen: 'SELECCION',
              data:   { fecha_hoy: fechaHoy() },
            },
          },
        },
      },
    }

    try {
      const res = await axios.post(`${WA_BASE_URL}/${phoneNumberId}/messages`, body, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      })
      this.logger.log(`[FLOW] Flow enviado a ${to} — msgId: ${res.data?.messages?.[0]?.id}`)
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message
      this.logger.error(`[FLOW] Error enviando Flow a ${to}: ${msg}`)
    }
  }

  // ── Desencriptar request de Meta (RSA-OAEP + AES-128-GCM) ────────────────

  desencriptarRequest(
    body: WaFlowEncryptedRequest,
    privateKeyPem: string,
  ): { payload: WaFlowActionPayload; aesKey: Buffer; iv: Buffer } {
    const aesKey = crypto.privateDecrypt(
      {
        key:      privateKeyPem,
        padding:  crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(body.encrypted_aes_key, 'base64'),
    )

    const iv            = Buffer.from(body.initial_vector, 'base64')
    const encryptedData = Buffer.from(body.encrypted_flow_data, 'base64')
    const authTag       = encryptedData.slice(-16)
    const ciphertext    = encryptedData.slice(0, -16)

    const decipher = crypto.createDecipheriv('aes-128-gcm', aesKey, iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    const payload   = JSON.parse(decrypted.toString('utf8')) as WaFlowActionPayload

    this.logger.log(`[FLOW] Desencriptado — action=${payload.action} screen=${payload.screen ?? '-'}`)
    return { payload, aesKey, iv }
  }

  // ── Cifrar respuesta para Meta (IV con último byte invertido) ─────────────

  encriptarResponse(responseData: object, aesKey: Buffer, iv: Buffer): string {
    const flippedIv = Buffer.from(iv)
    flippedIv[flippedIv.length - 1] ^= 0xFF   // requisito estricto de Meta

    const cipher    = crypto.createCipheriv('aes-128-gcm', aesKey, flippedIv)
    const plaintext = Buffer.from(JSON.stringify(responseData), 'utf8')
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()])
    const authTag   = cipher.getAuthTag()

    return Buffer.concat([encrypted, authTag]).toString('base64')
  }

  // ── Lógica de pantallas ───────────────────────────────────────────────────

  async procesarAccion(
    payload: WaFlowActionPayload,
    clienteId: string,
  ): Promise<WaFlowResponsePayload> {
    // Health check de Meta al registrar/activar el endpoint
    if (payload.action === 'ping') {
      return { data: { status: 'active' } }
    }

    // Carga inicial del Flow
    if (payload.action === 'INIT') {
      return {
        screen: 'SELECCION',
        data:   { fecha_hoy: fechaHoy() },
      }
    }

    // Navegación: usuario eligió Ingreso o Gasto
    if (payload.action === 'data_exchange' && payload.screen === 'SELECCION') {
      const tipo       = payload.data?.tipo_operacion as string
      const nextScreen = tipo === 'ingreso' ? 'REGISTRO_INGRESO' : 'REGISTRO_GASTO'
      return {
        screen: nextScreen,
        data:   { fecha_hoy: fechaHoy() },
      }
    }

    // Envío del formulario (terminal screens)
    if (payload.action === 'data_exchange' && payload.data?.pantalla) {
      await this.guardarRegistro(payload.data, clienteId)
      return { close_flow: true }
    }

    this.logger.warn(`[FLOW] Acción no manejada: action=${payload.action} screen=${payload.screen}`)
    return { close_flow: true }
  }

  // ── Guardar en BD ─────────────────────────────────────────────────────────

  private async guardarRegistro(data: Record<string, any>, clienteId: string): Promise<void> {
    const pantalla    = data.pantalla as string
    const monto       = parseFloat(String(data.monto || '0').replace(',', '.'))
    const fecha       = (data.fecha as string) || fechaHoy()
    const categoria   = data.categoria as string
    const tipo        = data.tipo as string
    const descripcion = (data.descripcion as string) || ''

    if (isNaN(monto) || monto <= 0) {
      this.logger.error(`[FLOW] Monto inválido recibido: "${data.monto}"`)
      return
    }

    try {
      if (pantalla === 'REGISTRO_INGRESO') {
        const ingreso = await this.ingresosService.crear(
          clienteId,
          { tipo, categoria, monto, fecha, descripcion } as any,
          USUARIO_SISTEMA,
        )
        this.logger.log(`[FLOW] Ingreso creado: id=${ingreso.id} tipo=${tipo} monto=${monto}`)

      } else if (pantalla === 'REGISTRO_GASTO') {
        const gasto = await this.gastosService.crear(
          clienteId,
          { tipo, categoria, monto, fecha, descripcion } as any,
          USUARIO_SISTEMA,
        )
        this.logger.log(`[FLOW] Gasto creado: id=${gasto.id} tipo=${tipo} monto=${monto}`)

      } else {
        this.logger.warn(`[FLOW] Pantalla desconocida: ${pantalla}`)
      }
    } catch (err: any) {
      this.logger.error(`[FLOW] Error guardando registro (${pantalla}): ${err.message}`)
    }
  }

  // ── Obtener clave privada RSA desde BD ────────────────────────────────────

  async obtenerClavePrivada(clienteId: string): Promise<string | null> {
    const cfg = await this.confClienteService.obtenerPorClave(clienteId, 'WA_FLOW_PRIVATE_KEY')
    return cfg?.valor ?? null
  }
}
