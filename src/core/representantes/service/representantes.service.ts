import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Representante } from '../entity/representante.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import {
  CreateRepresentanteDto,
  UpdateRepresentanteDto,
  DesactivarRepresentanteDto,
} from '../dto/representante.dto'

@Injectable()
export class RepresentantesService {
  constructor(
    @InjectRepository(Representante)
    private readonly repo: Repository<Representante>,
  ) {}

  async listar(clienteId: string, tipo: string, entidadId: string): Promise<Representante[]> {
    return this.repo.find({
      where: { clienteId, tipo, entidadId, estado: Status.ACTIVE },
      order: { activo: 'DESC', fechaInicio: 'DESC' },
    })
  }

  async listarActivosBatch(
    clienteId: string,
    tipo: string,
    entidadIds: string[],
  ): Promise<Map<string, Representante>> {
    if (!entidadIds.length) return new Map()
    const reps = await this.repo
      .createQueryBuilder('r')
      .where(
        'r.cliente_id = :clienteId AND r.tipo = :tipo AND r.activo = true AND r._estado = :estado AND r.entidad_id IN (:...ids)',
        { clienteId, tipo, estado: Status.ACTIVE, ids: entidadIds },
      )
      .orderBy('r.fecha_inicio', 'DESC')
      .getMany()
    const map = new Map<string, Representante>()
    reps.forEach(r => { if (!map.has(r.entidadId)) map.set(r.entidadId, r) })
    return map
  }

  async crear(
    clienteId: string,
    tipo: string,
    entidadId: string,
    dto: CreateRepresentanteDto,
    usuarioCreacion: string,
  ): Promise<Representante> {
    if (dto.reemplazarActual) {
      const activos = await this.repo.find({
        where: { clienteId, tipo, entidadId, activo: true, estado: Status.ACTIVE },
      })
      const hoy = dto.fechaInicio || new Date().toISOString().split('T')[0]
      for (const rep of activos) {
        Object.assign(rep, {
          activo: false,
          fechaFin: hoy,
          motivoCambio: dto.motivoCambio,
          transaccion: Transacccion.ACTUALIZAR,
          usuarioModificacion: usuarioCreacion,
        })
        await this.repo.save(rep)
      }
    }

    return this.repo.save(
      this.repo.create({
        nombre: dto.nombre,
        cargo: dto.cargo,
        telefono: dto.telefono,
        email: dto.email,
        fechaInicio: dto.fechaInicio,
        notas: dto.notas,
        clienteId,
        tipo,
        entidadId,
        activo: true,
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion,
      }),
    )
  }

  async actualizar(
    clienteId: string,
    repId: string,
    dto: UpdateRepresentanteDto,
    usuarioModificacion: string,
  ): Promise<Representante> {
    const rep = await this._obtener(clienteId, repId)
    Object.assign(rep, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(rep)
  }

  async desactivar(
    clienteId: string,
    repId: string,
    dto: DesactivarRepresentanteDto,
    usuarioModificacion: string,
  ): Promise<Representante> {
    const rep = await this._obtener(clienteId, repId)
    Object.assign(rep, {
      activo: false,
      fechaFin: dto.fechaFin || new Date().toISOString().split('T')[0],
      motivoCambio: dto.motivoCambio,
      transaccion: Transacccion.ACTUALIZAR,
      usuarioModificacion,
    })
    return this.repo.save(rep)
  }

  async eliminar(clienteId: string, repId: string, usuarioModificacion: string): Promise<void> {
    const rep = await this._obtener(clienteId, repId)
    Object.assign(rep, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(rep)
  }

  private async _obtener(clienteId: string, repId: string): Promise<Representante> {
    const rep = await this.repo.findOne({ where: { id: repId, clienteId, estado: Status.ACTIVE } })
    if (!rep) throw new NotFoundException(Messages.NOT_FOUND)
    return rep
  }
}
