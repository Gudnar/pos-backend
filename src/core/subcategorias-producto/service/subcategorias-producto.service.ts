import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SubcategoriaProducto } from '../entity/subcategoria-producto.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateSubcategoriaProductoDto, UpdateSubcategoriaProductoDto } from '../dto/subcategoria-producto.dto'

@Injectable()
export class SubcategoriasProductoService {
  constructor(
    @InjectRepository(SubcategoriaProducto)
    private readonly repo: Repository<SubcategoriaProducto>,
  ) {}

  async listar(clienteId: string, categoriaId?: string, soloActivos = false): Promise<SubcategoriaProducto[]> {
    const where: any = { clienteId, estado: Status.ACTIVE }
    if (categoriaId) where.categoriaId = categoriaId
    if (soloActivos) where.activo = true
    return this.repo.find({ where, order: { nombre: 'ASC' } })
  }

  async obtener(clienteId: string, id: string): Promise<SubcategoriaProducto> {
    const s = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!s) throw new NotFoundException(Messages.NOT_FOUND)
    return s
  }

  async crear(clienteId: string, dto: CreateSubcategoriaProductoDto, usuarioCreacion: string): Promise<SubcategoriaProducto> {
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

  async actualizar(clienteId: string, id: string, dto: UpdateSubcategoriaProductoDto, usuarioModificacion: string): Promise<SubcategoriaProducto> {
    const s = await this.obtener(clienteId, id)
    const { estado: estadoDto, ...rest } = dto
    const activo = estadoDto !== undefined ? estadoDto !== 'inactivo' : s.activo
    Object.assign(s, { ...rest, activo, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(s)
  }

  async eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const s = await this.obtener(clienteId, id)
    Object.assign(s, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(s)
  }
}
