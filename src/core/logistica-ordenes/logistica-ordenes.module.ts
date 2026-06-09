import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrdenImportacion } from './entity/orden-importacion.entity'
import { ItemOrdenImportacion } from './entity/item-orden-importacion.entity'
import { PagoProveedorImportacion } from './entity/pago-proveedor-importacion.entity'
import { GastoLogistica } from './entity/gasto-logistica.entity'
import { PrecioProducto } from '../productos/entity/precio-producto.entity'
import { LotesModule } from '../lotes/lotes.module'
import { FuentesModule } from '../fuentes/fuentes.module'
import { OrdenesImportacionService } from './service/ordenes-importacion.service'
import { ItemsOrdenService } from './service/items-orden.service'
import { PagosProveedorService } from './service/pagos-proveedor.service'
import { GastosLogisticaService } from './service/gastos-logistica.service'
import { LogisticaOrdenesController } from './controller/logistica-ordenes.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrdenImportacion,
      ItemOrdenImportacion,
      PagoProveedorImportacion,
      GastoLogistica,
      PrecioProducto,
    ]),
    LotesModule,
    FuentesModule,
  ],
  controllers: [LogisticaOrdenesController],
  providers: [OrdenesImportacionService, ItemsOrdenService, PagosProveedorService, GastosLogisticaService],
  exports: [OrdenesImportacionService],
})
export class LogisticaOrdenesModule {}
