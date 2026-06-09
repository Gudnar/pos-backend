import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CategoriaProducto } from '../entity/categoria-producto.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateCategoriaProductoDto, UpdateCategoriaProductoDto } from '../dto/categoria-producto.dto'

@Injectable()
export class CategoriasProductoService {
  constructor(
    @InjectRepository(CategoriaProducto)
    private readonly repo: Repository<CategoriaProducto>,
  ) {}

  async listar(clienteId: string, q?: string): Promise<CategoriaProducto[]> {
    const qb = this.repo
      .createQueryBuilder('c')
      .where('c.cliente_id = :clienteId AND c._estado = :estado', { clienteId, estado: Status.ACTIVE })
      .orderBy('c.nombre', 'ASC')
    if (q && q.trim()) {
      qb.andWhere('LOWER(c.nombre) LIKE LOWER(:q)', { q: `%${q.trim()}%` })
    }
    return qb.getMany()
  }

  async obtener(clienteId: string, id: string): Promise<CategoriaProducto> {
    const c = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!c) throw new NotFoundException(Messages.NOT_FOUND)
    return c
  }

  async crear(clienteId: string, dto: CreateCategoriaProductoDto, usuarioCreacion: string): Promise<CategoriaProducto> {
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

  async actualizar(clienteId: string, id: string, dto: UpdateCategoriaProductoDto, usuarioModificacion: string): Promise<CategoriaProducto> {
    const c = await this.obtener(clienteId, id)
    const { estado: estadoDto, ...rest } = dto
    const activo = estadoDto !== undefined ? estadoDto !== 'inactivo' : c.activo
    Object.assign(c, { ...rest, activo, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(c)
  }

  async eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const c = await this.obtener(clienteId, id)
    Object.assign(c, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(c)
  }
}
