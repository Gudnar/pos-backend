import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TipoGastoLogistica } from './entity/tipo-gasto-logistica.entity'
import { LogisticaTiposGastoService } from './service/logistica-tipos-gasto.service'
import { LogisticaTiposGastoController } from './controller/logistica-tipos-gasto.controller'

@Module({
  imports: [TypeOrmModule.forFeature([TipoGastoLogistica])],
  controllers: [LogisticaTiposGastoController],
  providers: [LogisticaTiposGastoService],
  exports: [LogisticaTiposGastoService],
})
export class LogisticaTiposGastoModule {}
