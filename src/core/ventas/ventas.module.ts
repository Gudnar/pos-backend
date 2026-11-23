import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Venta } from './entity/venta.entity'
import { DetalleVenta } from './entity/detalle-venta.entity'
import { VentaDocumento } from './entity/venta-documento.entity'
import { VentaHojaRuta } from './entity/venta-hoja-ruta.entity'
import { VentaComision } from './entity/venta-comision.entity'
import { VentaPago } from './entity/venta-pago.entity'
import { Cotizacion } from './entity/cotizacion.entity'
import { CotizacionDetalle } from './entity/cotizacion-detalle.entity'
import { CotizacionesService } from './service/cotizaciones.service'
import { CotizacionesController } from './controller/cotizaciones.controller'
import { FuentesModule } from '../fuentes/fuentes.module'
import { Lote } from '../lotes/entity/lote.entity'
import { MovimientoStock } from '../movimientos-stock/entity/movimiento-stock.entity'
import { Producto } from '../productos/entity/producto.entity'
import { CajaSesion } from '../caja/entity/caja-sesion.entity'
import { IngresosModule } from '../ingresos/ingresos.module'
import { VentasService } from './service/ventas.service'
import { VentaDocumentosService } from './service/venta-documentos.service'
import { VentaExtrasService } from './service/venta-extras.service'
import { VentaPagosService } from './service/venta-pagos.service'
import { VentasController } from './controller/ventas.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, DetalleVenta, VentaDocumento, VentaHojaRuta, VentaComision, VentaPago, Cotizacion, CotizacionDetalle, Lote, MovimientoStock, Producto, CajaSesion]),
    IngresosModule,
    FuentesModule,
  ],
  controllers: [VentasController, CotizacionesController],
  providers: [VentasService, VentaDocumentosService, VentaExtrasService, VentaPagosService, CotizacionesService],
  exports: [VentasService],
})
export class VentasModule {}
