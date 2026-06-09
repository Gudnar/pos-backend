import { Module } from '@nestjs/common'
import { FacebookService } from './service/facebook.service'
import { FacebookWebhookService } from './service/facebook-webhook.service'
import { FacebookController } from './controller/facebook.controller'
import { ClienteModule } from '../cliente/cliente.module'
import { ConversacionModule } from '../conversacion/conversacion.module'
import { AgenteModule } from '../agente/agente.module'
import { CampanaModule } from '../campana/campana.module'
import { HerramientaModule } from '../herramienta/herramienta.module'

@Module({
  imports: [ClienteModule, ConversacionModule, AgenteModule, CampanaModule, HerramientaModule],
  controllers: [FacebookController],
  providers: [FacebookService, FacebookWebhookService],
  exports: [FacebookService],
})
export class FacebookModule {}
