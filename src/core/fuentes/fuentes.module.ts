import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Fuente } from './entity/fuente.entity'
import { MovimientoFuente } from './entity/movimiento-fuente.entity'
import { FuentesService } from './service/fuentes.service'
import { MovimientosFuenteService } from './service/movimientos-fuente.service'
import { FuentesController } from './controller/fuentes.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Fuente, MovimientoFuente])],
  controllers: [FuentesController],
  providers: [FuentesService, MovimientosFuenteService],
  exports: [FuentesService, MovimientosFuenteService],
})
export class FuentesModule {}
