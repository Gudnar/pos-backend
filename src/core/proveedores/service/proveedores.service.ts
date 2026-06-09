import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Proveedor } from '../entity/proveedor.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateProveedorDto, UpdateProveedorDto } from '../dto/proveedor.dto'
import { RepresentantesService } from '../../representantes/service/representantes.service'

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly repo: Repository<Proveedor>,
    private readonly repSvc: RepresentantesService,
  ) {}

  async listar(clienteId: string, q?: string): Promise<any[]> {
    const qb = this.repo
      .createQueryBuilder('p')
      .where('p.cliente_id = :clienteId AND p._estado = :estado', { clienteId, estado: Status.ACTIVE })
      .orderBy('p.nombre', 'ASC')

    if (q && q.trim().length >= 1) {
      qb.andWhere(
        '(LOWER(p.nombre) LIKE LOWER(:q) OR LOWER(p.empresa) LIKE LOWER(:q))',
        { q: `%${q.trim()}%` },
      )
    }

    const proveedores = await qb.getMany()
    if (!proveedores.length) return []

    const repMap = await this.repSvc.listarActivosBatch(
      clienteId, 'PROVEEDOR', proveedores.map(p => p.id),
    )

    return proveedores.map(p => ({
      ...p,
      representanteActual: repMap.get(p.id) ?? null,
    }))
  }

  async obtener(clienteId: string, id: string): Promise<Proveedor> {
    const p = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!p) throw new NotFoundException(Messages.NOT_FOUND)
    return p
  }

  async crear(clienteId: string, dto: CreateProveedorDto, usuarioCreacion: string): Promise<Proveedor> {
    return this.repo.save(
      this.repo.create({
        ...dto,
        clienteId,
        activo: dto.estado !== 'inactivo',
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion,
      }),
    )
  }

  async actualizar(clienteId: string, id: string, dto: UpdateProveedorDto, usuarioModificacion: string): Promise<Proveedor> {
    const proveedor = await this.obtener(clienteId, id)
    const { estado: estadoDto, ...rest } = dto
    const activo = estadoDto !== undefined ? estadoDto !== 'inactivo' : proveedor.activo
    Object.assign(proveedor, { ...rest, activo, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(proveedor)
  }

  async eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const proveedor = await this.obtener(clienteId, id)
    Object.assign(proveedor, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(proveedor)
  }
}
