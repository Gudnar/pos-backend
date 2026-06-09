import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MovimientoStock } from './entity/movimiento-stock.entity'
import { Lote } from '../lotes/entity/lote.entity'
import { MovimientosStockService } from './service/movimientos-stock.service'
import { MovimientosStockController } from './controller/movimientos-stock.controller'

@Module({
  imports: [TypeOrmModule.forFeature([MovimientoStock, Lote])],
  controllers: [MovimientosStockController],
  providers: [MovimientosStockService],
  exports: [MovimientosStockService],
})
export class MovimientosStockModule {}
