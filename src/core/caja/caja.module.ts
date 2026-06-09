import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Caja } from './entity/caja.entity'
import { CajaSesion } from './entity/caja-sesion.entity'
import { CajaService } from './service/caja.service'
import { CajaController } from './controller/caja.controller'
import { Usuario } from '../usuario/entity/usuario.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Caja, CajaSesion, Usuario])],
  controllers: [CajaController],
  providers: [CajaService],
  exports: [CajaService, TypeOrmModule],
})
export class CajaModule {}
