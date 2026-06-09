import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Producto } from '../entity/producto.entity'
import { PrecioProducto } from '../entity/precio-producto.entity'
import { CategoriaProducto } from '../../categorias-producto/entity/categoria-producto.entity'
import { SubcategoriaProducto } from '../../subcategorias-producto/entity/subcategoria-producto.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateProductoDto, UpdateProductoDto } from '../dto/producto.dto'

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly repo: Repository<Producto>,
    @InjectRepository(PrecioProducto)
    private readonly precioRepo: Repository<PrecioProducto>,
    @InjectRepository(CategoriaProducto)
    private readonly categoriaRepo: Repository<CategoriaProducto>,
    @InjectRepository(SubcategoriaProducto)
    private readonly subcategoriaRepo: Repository<SubcategoriaProducto>,
  ) {}

  async listar(clienteId: string, subcategoriaId?: string, q?: string): Promise<Producto[]> {
    const qb = this.repo
      .createQueryBuilder('p')
      .where('p.cliente_id = :clienteId AND p._estado = :estado', { clienteId, estado: Status.ACTIVE })
      .orderBy('p.nombre', 'ASC')
    if (subcategoriaId) {
      qb.andWhere('p.subcategoria_id = :subcategoriaId', { subcategoriaId })
    }
    if (q && q.trim()) {
      qb.andWhere(
        '(LOWER(p.nombre) LIKE LOWER(:q) OR LOWER(p.codigo_tienda) LIKE LOWER(:q) OR LOWER(p.codigo_barras) LIKE LOWER(:q))',
        { q: `%${q.trim()}%` },
      )
    }
    return qb.getMany()
  }

  async obtener(clienteId: string, id: string): Promise<Producto> {
    const p = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!p) throw new NotFoundException(Messages.NOT_FOUND)
    return p
  }

  async crear(clienteId: string, dto: CreateProductoDto, usuarioCreacion: string): Promise<Producto> {
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

  async actualizar(clienteId: string, id: string, dto: UpdateProductoDto, usuarioModificacion: string): Promise<Producto> {
    const p = await this.obtener(clienteId, id)
    const { estado: estadoDto, ...rest } = dto
    const activo = estadoDto !== undefined ? estadoDto !== 'inactivo' : p.activo
    Object.assign(p, { ...rest, activo, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(p)
  }

  async listarParaPOS(clienteId: string, q?: string): Promise<any[]> {
    const productos = await this.listar(clienteId, undefined, q)
    if (!productos.length) return []

    const ids = productos.map(p => p.id)

    // ── Precios — todos los tiers activos VENTA ordenados por cantidadMin ────
    const precios = await this.precioRepo
      .createQueryBuilder('pp')
      .where('pp.cliente_id = :clienteId AND pp.producto_id IN (:...ids) AND pp.activo = true AND pp._estado = :est', {
        clienteId, ids, est: Status.ACTIVE,
      })
      .andWhere("pp.tipo = 'VENTA'")
      .orderBy('pp.cantidad_min', 'ASC')
      .getMany()

    // Agrupar todos los tiers por productoId
    const tiersMap = new Map<string, { cantidadMin: number; cantidadMax: number | null; precio: number }[]>()
    for (const pr of precios) {
      if (!tiersMap.has(pr.productoId)) tiersMap.set(pr.productoId, [])
      tiersMap.get(pr.productoId)!.push({
        cantidadMin: pr.cantidadMin,
        cantidadMax: pr.cantidadMax ?? null,
        precio: Number(pr.precio),
      })
    }

    // ── Subcategorías y Categorías ───────────────────────────────────────────
    const subcatIds = [...new Set(productos.map(p => p.subcategoriaId).filter(Boolean))]
    const subcategorias = subcatIds.length
      ? await this.subcategoriaRepo.find({ where: { id: In(subcatIds) } })
      : []
    const subcatMap = new Map(subcategorias.map(s => [s.id, s]))

    const catIds = [...new Set(subcategorias.map(s => s.categoriaId).filter(Boolean))]
    const categorias = catIds.length
      ? await this.categoriaRepo.find({ where: { id: In(catIds) } })
      : []
    const catMap = new Map(categorias.map(c => [c.id, c]))

    return productos.map(p => {
      const subcat = subcatMap.get(p.subcategoriaId)
      const cat = subcat ? catMap.get(subcat.categoriaId) : undefined
      const tiersSF = tiersMap.get(p.id) ?? []
      const pctFactura = Number(p.porcentajeFactura || 0)
      const tiersCF = pctFactura > 0
        ? tiersSF.map(t => ({ ...t, precio: Number((t.precio * (1 + pctFactura / 100)).toFixed(2)) }))
        : []

      return {
        id: p.id,
        nombre: p.nombre,
        codigoTienda: p.codigoTienda,
        codigoBarras: p.codigoBarras,
        unidadMedida: p.unidadMedida,
        requiereLote: p.requiereLote,
        metodoPicking: p.metodoPicking,
        porcentajeFactura: pctFactura,
        tiersSF,
        tiersCF,
        // precio base de fallback (primer tier SF)
        precio: tiersSF[0]?.precio ?? null,
        nombreCategoria: cat?.nombre ?? null,
        nombreSubcategoria: subcat?.nombre ?? null,
      }
    })
  }

  async eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const p = await this.obtener(clienteId, id)
    Object.assign(p, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(p)
  }
}
