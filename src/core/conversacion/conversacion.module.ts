import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Conversacion } from './entity/conversacion.entity'
import { ConversacionService } from './service/conversacion.service'
import { ConversacionController } from './controller/conversacion.controller'
import { ClienteModule } from '../cliente/cliente.module'

@Module({
  imports: [TypeOrmModule.forFeature([Conversacion]), ClienteModule],
  providers: [ConversacionService],
  exports: [ConversacionService, TypeOrmModule],
  controllers: [ConversacionController],
})
export class ConversacionModule {}
