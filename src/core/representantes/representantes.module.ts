import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Representante } from './entity/representante.entity'
import { RepresentantesService } from './service/representantes.service'

@Module({
  imports: [TypeOrmModule.forFeature([Representante])],
  providers: [RepresentantesService],
  exports: [RepresentantesService],
})
export class RepresentantesModule {}
