import { Body, Controller, Get, HttpCode, Logger, Post, Query, Req, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { FacebookService } from '../service/facebook.service'
import { FacebookWebhookService } from '../service/facebook-webhook.service'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

@Controller('facebook')
export class FacebookController {
  private readonly logger = new Logger(FacebookController.name)

  constructor(
    private readonly fbService: FacebookService,
    private readonly webhookService: FacebookWebhookService,
    private readonly confClienteService: ConfiguracionClienteService,
  ) {}

  // ── Webhook verification (GET) ────────────────────────────────────

  @Get('webhook')
  async verificarWebhook(@Query() query: any, @Res() res: Response): Promise<void> {
    const mode      = query['hub.mode']
    const token     = query['hub.verify_token']
    const challenge = query['hub.challenge']

    const clienteId = await this.confClienteService.resolverClientePorFbVerifyToken(token)

    if (mode === 'subscribe' && clienteId) {
      this.logger.log(`[FB] Webhook verificado para cliente ${clienteId}`)
      res.status(200).send(challenge)
    } else {
      this.logger.warn(`[FB] Verificación fallida — token: ${token}`)
      res.sendStatus(403)
    }
  }

  // ── Webhook receiver (POST) ───────────────────────────────────────

  @Post('webhook')
  @HttpCode(200)
  async recibirWebhook(@Body() body: any): Promise<string> {
    if (body.object !== 'page') return 'EVENT_RECEIVED'

    try {
      for (const entry of body.entry || []) {
        const pageId: string = entry.id
        this.webhookService.procesarEntrada(entry, pageId)
          .catch(err => this.logger.error(`[FB] Error async: ${err.message}`))
      }
    } catch (err: any) {
      this.logger.error(`[FB] Error procesando webhook: ${err.message}`)
    }

    return 'EVENT_RECEIVED'
  }

  // ── Authenticated endpoints ───────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('config')
  async obtenerConfig(@Req() req: any) {
    const config = await this.fbService.obtenerConfig(req.user.clienteId)
    return { ...config, pageAccessToken: config.pageAccessToken ? '••••••••••••••••' : '' }
  }

  @UseGuards(JwtAuthGuard)
  @Post('config')
  async guardarConfig(@Body() body: any, @Req() req: any) {
    await this.fbService.guardarConfig(req.user.clienteId, body, req.user.id)
    return new SuccessResponseDto(null, 'Configuración Facebook guardada')
  }

  @UseGuards(JwtAuthGuard)
  @Post('test-connection')
  async testConexion(@Body() body: { pageAccessToken: string; pageId: string }) {
    return this.fbService.testConexion(body.pageAccessToken, body.pageId)
  }

  @UseGuards(JwtAuthGuard)
  @Get('publicaciones')
  async obtenerPublicaciones(@Req() req: any) {
    try {
      const datos = await this.fbService.obtenerPublicaciones(req.user.clienteId)
      return new SuccessResponseDto(datos)
    } catch (err: any) {
      return new SuccessResponseDto([], err.message)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async obtenerEstado(@Req() req: any) {
    const config = await this.fbService.obtenerConfig(req.user.clienteId)
    if (!config.pageAccessToken || !config.pageId) {
      return { valida: false, mensaje: 'Facebook no configurado' }
    }
    return this.fbService.testConexion(config.pageAccessToken, config.pageId)
  }
}
