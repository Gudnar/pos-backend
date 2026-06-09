import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Lote } from './entity/lote.entity'
import { MovimientoStock } from '../movimientos-stock/entity/movimiento-stock.entity'
import { Producto } from '../productos/entity/producto.entity'
import { LotesService } from './service/lotes.service'
import { LotesController } from './controller/lotes.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Lote, MovimientoStock, Producto])],
  controllers: [LotesController],
  providers: [LotesService],
  exports: [LotesService, TypeOrmModule],
})
export class LotesModule {}
