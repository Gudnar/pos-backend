import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Cita } from './entity/cita.entity'
import { Paciente } from '../pacientes/entity/paciente.entity'
import { Cliente } from '../cliente/entity/cliente.entity'
import { CitasMedicasService } from './service/citas-medicas.service'
import { CitasMedicasController } from './controller/citas-medicas.controller'
import { EspecialistaModule } from '../especialista/especialista.module'

@Module({
  imports: [TypeOrmModule.forFeature([Cita, Paciente, Cliente]), EspecialistaModule],
  providers: [CitasMedicasService],
  controllers: [CitasMedicasController],
  exports: [CitasMedicasService, EspecialistaModule],
})
export class CitasMedicasModule {}
