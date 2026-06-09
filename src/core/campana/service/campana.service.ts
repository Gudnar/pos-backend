import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { Campana } from '../entity/campana.entity'
import { CreateCampanaDto, UpdateCampanaDto } from '../dto/campana.dto'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'

@Injectable()
export class CampanaService {
  constructor(
    @InjectRepository(Campana)
    private readonly campanaRepo: Repository<Campana>,
  ) {}

  async listar(clienteId: string): Promise<Campana[]> {
    return this.campanaRepo.find({
      where: { clienteId, estado: Status.ACTIVE },
      order: { canal: 'ASC', nombre: 'ASC' },
    })
  }

  async obtener(id: string, clienteId: string): Promise<Campana> {
    const c = await this.campanaRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!c) throw new NotFoundException(Messages.NOT_FOUND)
    return c
  }

  async crear(clienteId: string, dto: CreateCampanaDto, usuarioCreacion: string): Promise<Campana> {
    const campana = this.campanaRepo.create({
      ...dto,
      clienteId,
      activa: dto.activa ?? true,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.campanaRepo.save(campana)
  }

  async actualizar(id: string, clienteId: string, dto: UpdateCampanaDto, usuarioModificacion: string): Promise<Campana> {
    const campana = await this.obtener(id, clienteId)
    Object.assign(campana, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.campanaRepo.save(campana)
  }

  async eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void> {
    const campana = await this.obtener(id, clienteId)
    Object.assign(campana, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.campanaRepo.save(campana)
  }

  async resolverPorCanalYOrigen(clienteId: string, canal: string, origen?: string): Promise<Campana | null> {
    if (origen) {
      const exacta = await this.campanaRepo.findOne({
        where: { clienteId, canal, origen, activa: true, estado: Status.ACTIVE },
      })
      if (exacta) return exacta
    }

    return this.campanaRepo.findOne({
      where: { clienteId, canal, origen: IsNull(), activa: true, estado: Status.ACTIVE },
    })
  }
}
