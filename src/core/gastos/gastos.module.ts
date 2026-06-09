import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Gasto } from './entity/gasto.entity'
import { GastosService } from './service/gastos.service'
import { GastosController } from './controller/gastos.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Gasto])],
  controllers: [GastosController],
  providers: [GastosService],
  exports: [GastosService],
})
export class GastosModule {}
