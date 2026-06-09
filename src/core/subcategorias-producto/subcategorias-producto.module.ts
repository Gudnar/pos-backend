import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubcategoriaProducto } from './entity/subcategoria-producto.entity'
import { SubcategoriasProductoService } from './service/subcategorias-producto.service'
import { SubcategoriasProductoController } from './controller/subcategorias-producto.controller'

@Module({
  imports: [TypeOrmModule.forFeature([SubcategoriaProducto])],
  controllers: [SubcategoriasProductoController],
  providers: [SubcategoriasProductoService],
  exports: [SubcategoriasProductoService],
})
export class SubcategoriasProductoModule {}
