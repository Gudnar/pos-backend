import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

// Entidades propias del módulo
import { Usuario } from '../usuario/entity/usuario.entity'
import { Producto } from '../productos/entity/producto.entity'
import { Lote } from '../lotes/entity/lote.entity'
import { MovimientoStock } from '../movimientos-stock/entity/movimiento-stock.entity'
import { Venta } from '../ventas/entity/venta.entity'
import { DetalleVenta } from '../ventas/entity/detalle-venta.entity'
import { OrdenImportacion } from '../logistica-ordenes/entity/orden-importacion.entity'
// Fuentes
import { Fuente } from '../fuentes/entity/fuente.entity'
import { MovimientoFuente } from '../fuentes/entity/movimiento-fuente.entity'
// Logística
import { ItemOrdenImportacion } from '../logistica-ordenes/entity/item-orden-importacion.entity'
import { PagoProveedorImportacion } from '../logistica-ordenes/entity/pago-proveedor-importacion.entity'
import { GastoLogistica } from '../logistica-ordenes/entity/gasto-logistica.entity'
import { Moneda } from '../logistica-monedas/entity/moneda.entity'
// Caja
import { Caja } from '../caja/entity/caja.entity'
import { CajaSesion } from '../caja/entity/caja-sesion.entity'

// Módulos con servicios complejos
import { ComprasModule } from '../compras/compras.module'

// Servicios propios
import { AdminGerenteService } from './service/admin-gerente.service'
import { AdminGerenteToolsService } from './service/admin-gerente-tools.service'
import { AdminGerenteFuentesService } from './service/admin-gerente-fuentes.service'
import { AdminGerenteLogisticaService } from './service/admin-gerente-logistica.service'
import { AdminGerenteComprasService } from './service/admin-gerente-compras.service'
import { AdminGerenteCajaService } from './service/admin-gerente-caja.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Base (herramientas originales)
      Usuario, Producto, Lote, MovimientoStock, Venta, DetalleVenta, OrdenImportacion,
      // Fuentes de fondos
      Fuente, MovimientoFuente,
      // Logística
      ItemOrdenImportacion, PagoProveedorImportacion, GastoLogistica, Moneda,
      // Caja / POS
      Caja, CajaSesion,
    ]),
    ComprasModule,
  ],
  providers: [
    AdminGerenteService,
    AdminGerenteToolsService,
    AdminGerenteFuentesService,
    AdminGerenteLogisticaService,
    AdminGerenteComprasService,
    AdminGerenteCajaService,
  ],
  exports: [AdminGerenteService],
})
export class AdminGerenteModule {}
