import { Body, Controller, Get, Post, Put, Query, Res, UseGuards, Request, HttpCode, Logger } from '@nestjs/common'
import { Response } from 'express'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { WhatsappService } from '../service/whatsapp.service'
import { WhatsappWebhookService } from '../service/whatsapp-webhook.service'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { WhatsappConfigDto, EnviarMensajeDto, TestConexionDto, WaWebhookMessage, WaContact } from '../dto/whatsapp.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name)

  constructor(
    private readonly waService: WhatsappService,
    private readonly webhookService: WhatsappWebhookService,
    private readonly confClienteService: ConfiguracionClienteService,
  ) {}

  // ── Webhook verification (GET) ────────────────────────────────

  @Get('webhook')
  async verificarWebhook(@Query() query: any, @Res() res: Response): Promise<void> {
    const mode      = query['hub.mode']
    const token     = query['hub.verify_token']
    const challenge = query['hub.challenge']

    const clienteId = await this.confClienteService.resolverClientePorVerifyToken(token)

    if (mode === 'subscribe' && clienteId) {
      this.logger.log(`[WA] Webhook verificado para cliente ${clienteId}`)
      res.status(200).send(challenge)
    } else {
      this.logger.warn(`[WA] Verificación fallida — token: ${token}`)
      res.sendStatus(403)
    }
  }

  // ── Webhook receiver (POST) ───────────────────────────────────

  @Post('webhook')
  @HttpCode(200)
  async recibirWebhook(@Body() body: any): Promise<string> {
    if (body.object !== 'whatsapp_business_account') return 'EVENT_RECEIVED'

    try {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value
          if (!value) continue

          const phoneNumberId: string = value.metadata?.phone_number_id || ''
          const contacts: WaContact[] = value.contacts || []

          for (const rawMessage of (value.messages || []) as WaWebhookMessage[]) {
            const contact = contacts.find(c => c.wa_id === rawMessage.from)
            const displayName = contact?.profile?.name || rawMessage.from
            this.webhookService.procesarMensajeEntrante(rawMessage, displayName, phoneNumberId)
              .catch(err => this.logger.error(`[WA] Error async: ${err.message}`))
          }
        }
      }
    } catch (err: any) {
      this.logger.error(`[WA] Error procesando webhook: ${err.message}`)
    }

    return 'EVENT_RECEIVED'
  }

  // ── Authenticated endpoints ───────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('config')
  async obtenerConfig(@Request() req: any) {
    const config = await this.waService.obtenerConfig(req.user.clienteId)
    return { ...config, accessToken: config.accessToken ? '••••••••••••••••' : '' }
  }

  @UseGuards(JwtAuthGuard)
  @Post('config')
  async guardarConfig(@Body() dto: WhatsappConfigDto, @Request() req: any) {
    await this.waService.guardarConfig(req.user.clienteId, dto, req.user.id)
    return new SuccessResponseDto(null, 'Configuración WhatsApp guardada correctamente')
  }

  @UseGuards(JwtAuthGuard)
  @Post('test-connection')
  async testConexion(@Body() dto: TestConexionDto) {
    return this.waService.testConexion(dto.accessToken, dto.phoneNumberId)
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async obtenerEstado(@Request() req: any) {
    return this.waService.obtenerEstadisticas(req.user.clienteId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async enviarMensaje(@Body() dto: EnviarMensajeDto, @Request() req: any) {
    const config = await this.waService.obtenerConfig(req.user.clienteId)
    const result = await this.waService.enviarTexto(dto.celular, dto.mensaje, config)
    return new SuccessResponseDto(result, 'Mensaje enviado')
  }

  @UseGuards(JwtAuthGuard)
  @Get('routing')
  async obtenerRouting(@Request() req: any) {
    const datos = await this.waService.obtenerReglas(req.user.clienteId)
    return new SuccessResponseDto(datos)
  }

  @UseGuards(JwtAuthGuard)
  @Put('routing')
  async guardarRouting(@Body() body: any, @Request() req: any) {
    const reglas = Array.isArray(body) ? body : []
    await this.waService.guardarReglas(req.user.clienteId, reglas, req.user.id)
    return new SuccessResponseDto(null, 'Reglas de enrutamiento guardadas')
  }

  // ── Configuración del asistente del dueño ────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('owner-agent')
  async obtenerOwnerAgent(@Request() req: any) {
    const [phoneCfg, promptCfg] = await Promise.all([
      this.confClienteService.obtenerPorClave(req.user.clienteId, 'OWNER_WHATSAPP').catch(() => null),
      this.confClienteService.obtenerPorClave(req.user.clienteId, 'OWNER_SYSTEM_PROMPT').catch(() => null),
    ])
    return {
      finalizado: true, mensaje: 'OK',
      datos: {
        telefono: phoneCfg?.valor || '',
        systemPrompt: promptCfg?.valor || '',
      },
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('owner-agent')
  async guardarOwnerAgent(@Body() body: any, @Request() req: any) {
    await Promise.all([
      this.confClienteService.set(req.user.clienteId, { clave: 'OWNER_WHATSAPP', valor: body.telefono || '' }, req.user.id),
      this.confClienteService.set(req.user.clienteId, { clave: 'OWNER_SYSTEM_PROMPT', valor: body.systemPrompt || '' }, req.user.id),
    ])
    return new SuccessResponseDto(null, 'Configuración del asistente del dueño guardada')
  }
}
