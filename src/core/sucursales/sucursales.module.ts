import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Sucursal } from './entity/sucursal.entity'
import { UsuarioSucursal } from './entity/usuario-sucursal.entity'
import { SucursalesService } from './service/sucursales.service'
import { SucursalesController } from './controller/sucursales.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Sucursal, UsuarioSucursal])],
  controllers: [SucursalesController],
  providers: [SucursalesService],
  exports: [SucursalesService, TypeOrmModule],
})
export class SucursalesModule {}
