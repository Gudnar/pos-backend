import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PrecioProducto } from '../entity/precio-producto.entity'
import { PrecioPromocional } from '../entity/precio-promocional.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreatePrecioProductoDto, CreatePrecioPromocionalDto, UpdatePrecioPromocionalDto } from '../dto/precio.dto'

@Injectable()
export class PreciosService {
  constructor(
    @InjectRepository(PrecioProducto)
    private readonly precioRepo: Repository<PrecioProducto>,
    @InjectRepository(PrecioPromocional)
    private readonly promoRepo: Repository<PrecioPromocional>,
  ) {}

  // ── Precios con escala ───────────────────────────────────────────────────────

  async listarPrecios(clienteId: string, productoId: string): Promise<any> {
    const todos = await this.precioRepo.find({
      where: { clienteId, productoId, estado: Status.ACTIVE },
      order: { fechaVigencia: 'DESC', fechaCreacion: 'DESC', cantidadMin: 'ASC' },
    })

    // Agrupar por tipo + unidadId + activo para presentar escalas
    const activos: Record<string, PrecioProducto[]> = {}
    const historico: PrecioProducto[] = []

    for (const p of todos) {
      const key = `${p.tipo}__${p.unidadId || 'base'}__${p.fechaVigencia}`
      if (p.activo) {
        if (!activos[key]) activos[key] = []
        activos[key].push(p)
      } else {
        historico.push(p)
      }
    }

    return {
      escalasActivas: Object.values(activos).map(tiers => ({
        tipo: tiers[0].tipo,
        unidadId: tiers[0].unidadId,
        moneda: tiers[0].moneda,
        fechaVigencia: tiers[0].fechaVigencia,
        notas: tiers[0].notas,
        tiers: tiers.map(t => ({ id: t.id, cantidadMin: t.cantidadMin, cantidadMax: t.cantidadMax, precio: t.precio })),
      })),
      historico,
    }
  }

  async agregarEscalaPrecio(
    clienteId: string,
    productoId: string,
    dto: CreatePrecioProductoDto,
    usuarioCreacion: string,
  ): Promise<PrecioProducto[]> {
    const tipo = dto.tipo || 'VENTA'
    const hoy = dto.fechaVigencia || new Date().toISOString().split('T')[0]
    const unidadId = dto.unidadId || null

    // Desactivar escala vigente del mismo tipo + unidad
    const activos = await this.precioRepo.find({
      where: {
        clienteId, productoId, tipo, activo: true, estado: Status.ACTIVE,
        ...(unidadId ? { unidadId } : {}),
      },
    })
    for (const p of activos) {
      Object.assign(p, { activo: false, fechaFin: hoy, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion: usuarioCreacion })
      await this.precioRepo.save(p)
    }

    // Crear un registro por cada tier de la escala
    const nuevos: PrecioProducto[] = []
    for (const tier of dto.escala) {
      const nuevo = await this.precioRepo.save(
        this.precioRepo.create({
          clienteId,
          productoId,
          tipo,
          unidadId: unidadId ?? undefined,
          cantidadMin: tier.cantidadMin,
          cantidadMax: tier.cantidadMax ?? undefined,
          precio: tier.precio,
          moneda: dto.moneda || 'BOB',
          fechaVigencia: hoy,
          activo: true,
          notas: dto.notas,
          estado: Status.ACTIVE,
          transaccion: Transacccion.CREAR,
          usuarioCreacion,
        }),
      )
      nuevos.push(nuevo)
    }
    return nuevos
  }

  // ── Precios promocionales ────────────────────────────────────────────────────

  async listarPromociones(clienteId: string, productoId: string): Promise<PrecioPromocional[]> {
    return this.promoRepo.find({
      where: { clienteId, productoId, estado: Status.ACTIVE },
      order: { fechaInicio: 'DESC' },
    })
  }

  async crearPromocion(clienteId: string, productoId: string, dto: CreatePrecioPromocionalDto, usuarioCreacion: string): Promise<PrecioPromocional> {
    return this.promoRepo.save(
      this.promoRepo.create({
        ...dto,
        clienteId,
        productoId,
        habilitado: dto.habilitado !== false,
        moneda: dto.moneda || 'BOB',
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion,
      }),
    )
  }

  async actualizarPromocion(clienteId: string, promoId: string, dto: UpdatePrecioPromocionalDto, usuarioModificacion: string): Promise<PrecioPromocional> {
    const promo = await this.promoRepo.findOne({ where: { id: promoId, clienteId, estado: Status.ACTIVE } })
    if (!promo) throw new NotFoundException(Messages.NOT_FOUND)
    Object.assign(promo, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.promoRepo.save(promo)
  }

  async togglePromocion(clienteId: string, promoId: string, usuarioModificacion: string): Promise<PrecioPromocional> {
    const promo = await this.promoRepo.findOne({ where: { id: promoId, clienteId, estado: Status.ACTIVE } })
    if (!promo) throw new NotFoundException(Messages.NOT_FOUND)
    Object.assign(promo, { habilitado: !promo.habilitado, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.promoRepo.save(promo)
  }

  async eliminarPromocion(clienteId: string, promoId: string, usuarioModificacion: string): Promise<void> {
    const promo = await this.promoRepo.findOne({ where: { id: promoId, clienteId, estado: Status.ACTIVE } })
    if (!promo) throw new NotFoundException(Messages.NOT_FOUND)
    Object.assign(promo, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.promoRepo.save(promo)
  }
}
