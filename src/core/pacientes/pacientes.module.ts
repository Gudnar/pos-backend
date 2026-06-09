import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Paciente } from './entity/paciente.entity'
import { Consulta } from './entity/consulta.entity'
import { Cita } from '../citas-medicas/entity/cita.entity'
import { PacientesService } from './service/pacientes.service'
import { PacientesController } from './controller/pacientes.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Paciente, Consulta, Cita])],
  providers: [PacientesService],
  controllers: [PacientesController],
  exports: [PacientesService],
})
export class PacientesModule {}
