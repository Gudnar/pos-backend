import { Module } from '@nestjs/common'
import { WhatsappFlowsController } from './controller/whatsapp-flows.controller'
import { WhatsappFlowsService } from './service/whatsapp-flows.service'
import { ClienteModule } from '../cliente/cliente.module'
import { IngresosModule } from '../ingresos/ingresos.module'
import { GastosModule } from '../gastos/gastos.module'

@Module({
  imports:     [ClienteModule, IngresosModule, GastosModule],
  controllers: [WhatsappFlowsController],
  providers:   [WhatsappFlowsService],
  exports:     [WhatsappFlowsService],
})
export class WhatsappFlowsModule {}
