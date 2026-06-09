import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Herramienta } from './entity/herramienta.entity'
import { HerramientaService } from './service/herramienta.service'
import { AgentToolsService } from './service/agent-tools.service'
import { HerramientaController } from './controller/herramienta.controller'
import { AgenteModule } from '../agente/agente.module'
import { ConversacionModule } from '../conversacion/conversacion.module'

@Module({
  imports: [TypeOrmModule.forFeature([Herramienta]), AgenteModule, ConversacionModule],
  providers: [HerramientaService, AgentToolsService],
  exports: [HerramientaService, AgentToolsService],
  controllers: [HerramientaController],
})
export class HerramientaModule {}
