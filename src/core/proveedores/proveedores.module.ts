import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Proveedor } from './entity/proveedor.entity'
import { ProveedoresService } from './service/proveedores.service'
import { ProveedoresController } from './controller/proveedores.controller'
import { RepresentantesModule } from '../representantes/representantes.module'

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor]), RepresentantesModule],
  providers: [ProveedoresService],
  controllers: [ProveedoresController],
  exports: [ProveedoresService],
})
export class ProveedoresModule {}
