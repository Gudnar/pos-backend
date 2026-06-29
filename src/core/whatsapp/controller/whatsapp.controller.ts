import { Body, Controller, Get, Post, Put, Query, Res, UseGuards, Request, HttpCode, Logger } from '@nestjs/common'
import { Response } from 'express'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { WhatsappService } from '../service/whatsapp.service'
import { WhatsappWebhookService } from '../service/whatsapp-webhook.service'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { FuentesService } from '../../fuentes/service/fuentes.service'
import { WhatsappConfigDto, EnviarMensajeDto, TestConexionDto, WaWebhookMessage, WaContact } from '../dto/whatsapp.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name)

  constructor(
    private readonly waService: WhatsappService,
    private readonly webhookService: WhatsappWebhookService,
    private readonly confClienteService: ConfiguracionClienteService,
    private readonly fuentesService: FuentesService,
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

  // ── WhatsApp Flow — Data Exchange ─────────────────────────────
  // Endpoint público llamado por Meta. Identificar el cliente mediante
  // ?phoneNumberId=<WA_PHONE_NUMBER_ID> en la URL del Flow.

  @Post('flow-data-exchange')
  @HttpCode(200)
  async flowDataExchange(
    @Body() body: any,
    @Query('phoneNumberId') phoneNumberId: string,
    @Query('clienteId') clienteIdParam: string,
    @Res() res: Response,
  ): Promise<void> {
    const { action, screen } = body ?? {}
    this.logger.log(`[WA-Flow] action=${action} screen=${screen} phoneNumberId=${phoneNumberId}`)

    const clienteId = clienteIdParam
      || (phoneNumberId ? await this.confClienteService.resolverClientePorPhoneNumberId(phoneNumberId) : null)

    if (!clienteId) {
      res.status(400).json({ error: 'phoneNumberId no reconocido o clienteId no proporcionado' })
      return
    }

    if (action === 'ping' || (action === 'data_exchange' && screen === 'SELECCIONAR_CUENTA_PAGO')) {
      const fuentes = await this.fuentesService.listar(clienteId)

      const cuentasFormateadas = fuentes
        .filter(f => f.activo !== false)
        .map(f => ({
          id: f.id,
          title: f.nombre,
          description: [f.banco, f.numeroCuenta].filter(Boolean).join(' · ') || f.tipo,
        }))

      res.status(200).json({
        version: '3.1',
        screen: 'SELECCIONAR_CUENTA_PAGO',
        data: {
          cuentas_bancarias: cuentasFormateadas,
        },
      })
      return
    }

    res.status(400).json({ error: 'Acción no soportada' })
  }
}
