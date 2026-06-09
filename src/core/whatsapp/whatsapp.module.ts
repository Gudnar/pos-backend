import { Module } from '@nestjs/common'
import { WhatsappController } from './controller/whatsapp.controller'
import { WhatsappService } from './service/whatsapp.service'
import { WhatsappWebhookService } from './service/whatsapp-webhook.service'
import { ClinicaToolsService } from './service/clinica-tools.service'
import { CalificacionBackgroundService } from './service/calificacion-background.service'
import { ClienteModule } from '../cliente/cliente.module'
import { ConversacionModule } from '../conversacion/conversacion.module'
import { AgenteModule } from '../agente/agente.module'
import { CitasMedicasModule } from '../citas-medicas/citas-medicas.module'
import { CampanaModule } from '../campana/campana.module'
import { HerramientaModule } from '../herramienta/herramienta.module'
import { BizIntelModule } from '../biz-intel/biz-intel.module'

@Module({
  imports: [ClienteModule, ConversacionModule, AgenteModule, CitasMedicasModule, CampanaModule, HerramientaModule, BizIntelModule],
  controllers: [WhatsappController],
  providers: [WhatsappService, WhatsappWebhookService, ClinicaToolsService, CalificacionBackgroundService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
