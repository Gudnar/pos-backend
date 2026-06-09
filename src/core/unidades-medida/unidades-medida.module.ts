import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UnidadMedida } from './entity/unidad-medida.entity'
import { UnidadesMedidaService } from './service/unidades-medida.service'
import { UnidadesMedidaController } from './controller/unidades-medida.controller'

@Module({
  imports: [TypeOrmModule.forFeature([UnidadMedida])],
  controllers: [UnidadesMedidaController],
  providers: [UnidadesMedidaService],
  exports: [UnidadesMedidaService],
})
export class UnidadesMedidaModule {}
