import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Producto } from './entity/producto.entity'
import { PrecioProducto } from './entity/precio-producto.entity'
import { PrecioPromocional } from './entity/precio-promocional.entity'
import { PresentacionProducto } from './entity/presentacion-producto.entity'
import { CategoriaProducto } from '../categorias-producto/entity/categoria-producto.entity'
import { SubcategoriaProducto } from '../subcategorias-producto/entity/subcategoria-producto.entity'
import { UnidadMedida } from '../unidades-medida/entity/unidad-medida.entity'
import { ProductosService } from './service/productos.service'
import { PreciosService } from './service/precios.service'
import { ImportExportService } from './service/importexport.service'
import { ProductosController } from './controller/productos.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Producto, PrecioProducto, PrecioPromocional, PresentacionProducto,
      CategoriaProducto, SubcategoriaProducto, UnidadMedida,
    ]),
  ],
  controllers: [ProductosController],
  providers: [ProductosService, PreciosService, ImportExportService],
  exports: [ProductosService, PreciosService, ImportExportService],
})
export class ProductosModule {}
