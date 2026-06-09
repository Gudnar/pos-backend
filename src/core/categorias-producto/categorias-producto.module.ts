import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoriaProducto } from './entity/categoria-producto.entity'
import { CategoriasProductoService } from './service/categorias-producto.service'
import { CategoriasProductoController } from './controller/categorias-producto.controller'

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaProducto])],
  controllers: [CategoriasProductoController],
  providers: [CategoriasProductoService],
  exports: [CategoriasProductoService],
})
export class CategoriasProductoModule {}
