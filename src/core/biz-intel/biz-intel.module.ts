import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Venta } from '../ventas/entity/venta.entity'
import { Lote } from '../lotes/entity/lote.entity'
import { Ingreso } from '../ingresos/entity/ingreso.entity'
import { Gasto } from '../gastos/entity/gasto.entity'
import { Fuente } from '../fuentes/entity/fuente.entity'
import { MovimientoFuente } from '../fuentes/entity/movimiento-fuente.entity'
import { Producto } from '../productos/entity/producto.entity'
import { OrdenImportacion } from '../logistica-ordenes/entity/orden-importacion.entity'
import { BizIntelToolsService } from './service/biz-intel-tools.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venta, Lote, Ingreso, Gasto, Fuente, MovimientoFuente, Producto, OrdenImportacion,
    ]),
  ],
  providers: [BizIntelToolsService],
  exports: [BizIntelToolsService],
})
export class BizIntelModule {}
