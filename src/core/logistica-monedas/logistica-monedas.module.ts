import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Moneda } from './entity/moneda.entity'
import { LogisticaMonedasService } from './service/logistica-monedas.service'
import { LogisticaMonedasController } from './controller/logistica-monedas.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Moneda])],
  controllers: [LogisticaMonedasController],
  providers: [LogisticaMonedasService],
  exports: [LogisticaMonedasService],
})
export class LogisticaMonedasModule {}
