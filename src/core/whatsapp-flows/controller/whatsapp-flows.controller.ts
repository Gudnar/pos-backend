import { Body, Controller, HttpCode, Logger, Post, Query, Res } from '@nestjs/common'
import { Response } from 'express'
import { WhatsappFlowsService } from '../service/whatsapp-flows.service'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { WaFlowEncryptedRequest } from '../dto/whatsapp-flows.dto'

// Endpoint público llamado por Meta. Identificar el cliente con ?clienteId= o ?phoneNumberId= en la URL del Flow.
@Controller('whatsapp')
export class WhatsappFlowsController {
  private readonly logger = new Logger(WhatsappFlowsController.name)

  constructor(
    private readonly flowsService: WhatsappFlowsService,
    private readonly confClienteService: ConfiguracionClienteService,
  ) {}

  @Post('flow')
  @HttpCode(200)
  async manejarFlow(
    @Body() body: WaFlowEncryptedRequest,
    @Query('clienteId') clienteIdParam: string,
    @Query('phoneNumberId') phoneNumberId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const clienteId = clienteIdParam
        || (phoneNumberId ? await this.confClienteService.resolverClientePorPhoneNumberId(phoneNumberId) : null)

      if (!clienteId) {
        this.logger.error('[FLOW] No se pudo identificar el cliente — falta clienteId o phoneNumberId')
        res.sendStatus(400)
        return
      }

      const privateKey = await this.flowsService.obtenerClavePrivada(clienteId)
      if (!privateKey) {
        this.logger.error(`[FLOW] WA_FLOW_PRIVATE_KEY no configurada para cliente ${clienteId}`)
        res.sendStatus(500)
        return
      }

      const { payload, aesKey, iv } = this.flowsService.desencriptarRequest(body, privateKey)
      const responseData = await this.flowsService.procesarAccion(payload, clienteId)
      const encrypted    = this.flowsService.encriptarResponse(responseData, aesKey, iv)

      // Meta requiere Content-Type: text/plain y el cuerpo en Base64
      res.set('Content-Type', 'text/plain').send(encrypted)
    } catch (err: any) {
      this.logger.error(`[FLOW] Error procesando flow: ${err.message}`)
      res.sendStatus(500)
    }
  }
}
