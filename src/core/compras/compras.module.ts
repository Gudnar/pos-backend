import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Compra } from './entity/compra.entity'
import { CompraDetalle } from './entity/compra-detalle.entity'
import { PagoProveedor } from './entity/pago-proveedor.entity'
import { CompraLog } from './entity/compra-log.entity'
import { Lote } from '../lotes/entity/lote.entity'
import { MovimientoStock } from '../movimientos-stock/entity/movimiento-stock.entity'
import { ComprasService } from './service/compras.service'
import { ComprasController } from './controller/compras.controller'
import { FuentesModule } from '../fuentes/fuentes.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Compra, CompraDetalle, PagoProveedor, CompraLog, Lote, MovimientoStock]),
    FuentesModule,
  ],
  providers: [ComprasService],
  controllers: [ComprasController],
  exports: [ComprasService],
})
export class ComprasModule {}
