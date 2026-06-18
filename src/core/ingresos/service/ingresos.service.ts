import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, In, Repository } from 'typeorm'
import { Ingreso, TipoIngreso, EstadoIngreso } from '../entity/ingreso.entity'
import { CreateIngresoDto, UpdateIngresoDto } from '../dto/ingreso.dto'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class IngresosService {
  constructor(
    @InjectRepository(Ingreso)
    private readonly ingresoRepo: Repository<Ingreso>,
  ) {}

  async listar(clienteId: string, tipo?: string, categoria?: string, fecha?: string): Promise<Ingreso[]> {
    const where: any = { clienteId, estado: Status.ACTIVE }
    if (tipo) where.tipo = tipo
    if (categoria) where.categoria = categoria
    if (fecha) where.fecha = fecha
    return this.ingresoRepo.find({ where, order: { fechaCreacion: 'DESC' }, take: 500 })
  }

  async listarAdelantos(clienteId: string, contactoClienteId?: string): Promise<Ingreso[]> {
    const where: any = {
      clienteId,
      tipo: TipoIngreso.ADELANTO,
      estadoIngreso: In([EstadoIngreso.DISPONIBLE, EstadoIngreso.PARCIAL]),
      estado: Status.ACTIVE,
    }
    if (contactoClienteId) where.contactoClienteId = contactoClienteId
    return this.ingresoRepo.find({ where, order: { fechaCreacion: 'DESC' } })
  }

  async obtener(clienteId: string, id: string): Promise<Ingreso> {
    const ingreso = await this.ingresoRepo.findOne({
      where: { id, clienteId, estado: Status.ACTIVE },
    })
    if (!ingreso) throw new NotFoundException('Ingreso no encontrado')
    return ingreso
  }

  async crear(clienteId: string, dto: CreateIngresoDto, usuarioId: string): Promise<Ingreso> {
    const montoDisponible = dto.tipo === TipoIngreso.ADELANTO ? Number(dto.monto) : 0
    const estadoIngreso = dto.tipo === TipoIngreso.ADELANTO ? EstadoIngreso.DISPONIBLE : EstadoIngreso.DISPONIBLE

    const ingreso = this.ingresoRepo.create({
      clienteId,
      sucursalId: dto.sucursalId,
      tipo: dto.tipo,
      categoria: dto.categoria,
      monto: dto.monto,
      montoDisponible,
      estadoIngreso,
      fecha: dto.fecha,
      descripcion: dto.descripcion,
      referencia: dto.referencia,
      contactoClienteId: dto.contactoClienteId,
      nombreContacto: dto.nombreContacto,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion: usuarioId,
    } as any) as unknown as Ingreso
    return this.ingresoRepo.save(ingreso)
  }

  async actualizar(
    clienteId: string,
    id: string,
    dto: UpdateIngresoDto,
    usuarioId: string,
  ): Promise<Ingreso> {
    const ingreso = await this.obtener(clienteId, id)
    Object.assign(ingreso, {
      ...dto,
      transaccion: Transacccion.ACTUALIZAR,
      usuarioModificacion: usuarioId,
    })
    return this.ingresoRepo.save(ingreso)
  }

  async anular(clienteId: string, id: string, usuarioId: string): Promise<void> {
    const ingreso = await this.obtener(clienteId, id)
    if (ingreso.estadoIngreso === EstadoIngreso.UTILIZADO) {
      throw new BadRequestException('No se puede anular un adelanto ya utilizado completamente')
    }
    Object.assign(ingreso, {
      estadoIngreso: EstadoIngreso.ANULADO,
      estado: Status.ELIMINATE,
      transaccion: Transacccion.ELIMINAR,
      usuarioModificacion: usuarioId,
    })
    await this.ingresoRepo.save(ingreso)
  }

  async aplicarMonto(
    manager: EntityManager,
    clienteId: string,
    ingresoId: string,
    montoAplicar: number,
    usuarioId: string,
  ): Promise<void> {
    const ingreso = await manager.findOne(Ingreso, {
      where: { id: ingresoId, clienteId, tipo: TipoIngreso.ADELANTO, estado: Status.ACTIVE },
    })
    if (!ingreso) throw new NotFoundException('Adelanto no encontrado')
    if (ingreso.estadoIngreso === EstadoIngreso.UTILIZADO) {
      throw new BadRequestException('El adelanto ya fue utilizado completamente')
    }
    if (ingreso.estadoIngreso === EstadoIngreso.ANULADO) {
      throw new BadRequestException('El adelanto está anulado')
    }

    const disponible = Number(ingreso.montoDisponible)
    if (montoAplicar > disponible) {
      throw new BadRequestException(
        `Saldo insuficiente en el adelanto. Disponible: ${disponible.toFixed(2)}, Solicitado: ${montoAplicar.toFixed(2)}`,
      )
    }

    const nuevoDisponible = disponible - montoAplicar
    ingreso.montoDisponible = nuevoDisponible
    ingreso.estadoIngreso = nuevoDisponible <= 0 ? EstadoIngreso.UTILIZADO : EstadoIngreso.PARCIAL
    ingreso.transaccion = Transacccion.ACTUALIZAR
    ingreso.usuarioModificacion = usuarioId
    await manager.save(Ingreso, ingreso)
  }
}
