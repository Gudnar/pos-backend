import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Campana } from './entity/campana.entity'
import { CampanaService } from './service/campana.service'
import { CampanaController } from './controller/campana.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Campana])],
  controllers: [CampanaController],
  providers: [CampanaService],
  exports: [CampanaService],
})
export class CampanaModule {}
