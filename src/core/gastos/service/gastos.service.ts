import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Gasto } from '../entity/gasto.entity'
import { CreateGastoDto, UpdateGastoDto } from '../dto/gasto.dto'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class GastosService {
  constructor(
    @InjectRepository(Gasto)
    private readonly gastoRepo: Repository<Gasto>,
  ) {}

  async listar(clienteId: string, tipo?: string, categoria?: string, fecha?: string): Promise<Gasto[]> {
    const where: any = { clienteId, estado: Status.ACTIVE }
    if (tipo) where.tipo = tipo
    if (categoria) where.categoria = categoria
    if (fecha) where.fecha = fecha
    return this.gastoRepo.find({ where, order: { fechaCreacion: 'DESC' }, take: 500 })
  }

  async obtener(clienteId: string, id: string): Promise<Gasto> {
    const gasto = await this.gastoRepo.findOne({
      where: { id, clienteId, estado: Status.ACTIVE },
    })
    if (!gasto) throw new NotFoundException('Gasto no encontrado')
    return gasto
  }

  async crear(clienteId: string, dto: CreateGastoDto, usuarioId: string): Promise<Gasto> {
    const gasto = this.gastoRepo.create({
      clienteId,
      sucursalId: dto.sucursalId,
      tipo: dto.tipo,
      categoria: dto.categoria,
      monto: dto.monto,
      fecha: dto.fecha,
      descripcion: dto.descripcion,
      referencia: dto.referencia,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion: usuarioId,
    } as any) as unknown as Gasto
    return this.gastoRepo.save(gasto)
  }

  async actualizar(
    clienteId: string,
    id: string,
    dto: UpdateGastoDto,
    usuarioId: string,
  ): Promise<Gasto> {
    const gasto = await this.obtener(clienteId, id)
    Object.assign(gasto, {
      ...dto,
      transaccion: Transacccion.ACTUALIZAR,
      usuarioModificacion: usuarioId,
    })
    return this.gastoRepo.save(gasto)
  }

  async eliminar(clienteId: string, id: string, usuarioId: string): Promise<void> {
    const gasto = await this.obtener(clienteId, id)
    Object.assign(gasto, {
      estado: Status.ELIMINATE,
      transaccion: Transacccion.ELIMINAR,
      usuarioModificacion: usuarioId,
    })
    await this.gastoRepo.save(gasto)
  }
}
