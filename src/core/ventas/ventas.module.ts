import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Venta } from './entity/venta.entity'
import { DetalleVenta } from './entity/detalle-venta.entity'
import { Lote } from '../lotes/entity/lote.entity'
import { MovimientoStock } from '../movimientos-stock/entity/movimiento-stock.entity'
import { Producto } from '../productos/entity/producto.entity'
import { CajaSesion } from '../caja/entity/caja-sesion.entity'
import { IngresosModule } from '../ingresos/ingresos.module'
import { VentasService } from './service/ventas.service'
import { VentasController } from './controller/ventas.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, DetalleVenta, Lote, MovimientoStock, Producto, CajaSesion]),
    IngresosModule,
  ],
  controllers: [VentasController],
  providers: [VentasService],
  exports: [VentasService],
})
export class VentasModule {}
