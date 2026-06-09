import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Usuario } from '../usuario/entity/usuario.entity'
import { UsuarioSucursal } from '../sucursales/entity/usuario-sucursal.entity'
import { Sucursal } from '../sucursales/entity/sucursal.entity'
import { UsuariosSistemaService } from './service/usuarios-sistema.service'
import { UsuariosSistemaController } from './controller/usuarios-sistema.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, UsuarioSucursal, Sucursal])],
  controllers: [UsuariosSistemaController],
  providers: [UsuariosSistemaService],
})
export class UsuariosSistemaModule {}
