import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Ingreso } from './entity/ingreso.entity'
import { IngresosService } from './service/ingresos.service'
import { IngresosController } from './controller/ingresos.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Ingreso])],
  controllers: [IngresosController],
  providers: [IngresosService],
  exports: [IngresosService],
})
export class IngresosModule {}
