import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Especialista } from './entity/especialista.entity'
import { EspecialistaService } from './service/especialista.service'
import { EspecialistaController } from './controller/especialista.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Especialista])],
  providers: [EspecialistaService],
  controllers: [EspecialistaController],
  exports: [EspecialistaService],
})
export class EspecialistaModule {}
