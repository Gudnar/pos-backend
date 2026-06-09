import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PaisLogistica } from './entity/pais-logistica.entity'
import { LogisticaPaisesService } from './service/logistica-paises.service'
import { LogisticaPaisesController } from './controller/logistica-paises.controller'

@Module({
  imports: [TypeOrmModule.forFeature([PaisLogistica])],
  controllers: [LogisticaPaisesController],
  providers: [LogisticaPaisesService],
  exports: [LogisticaPaisesService],
})
export class LogisticaPaisesModule {}
