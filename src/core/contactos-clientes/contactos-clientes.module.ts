import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ContactoCliente } from './entity/contacto-cliente.entity'
import { ContactosClientesService } from './service/contactos-clientes.service'
import { ContactosClientesController } from './controller/contactos-clientes.controller'
import { RepresentantesModule } from '../representantes/representantes.module'

@Module({
  imports: [TypeOrmModule.forFeature([ContactoCliente]), RepresentantesModule],
  providers: [ContactosClientesService],
  controllers: [ContactosClientesController],
  exports: [ContactosClientesService],
})
export class ContactosClientesModule {}
