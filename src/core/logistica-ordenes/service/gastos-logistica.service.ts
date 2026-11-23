import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { GastoLogistica } from '../entity/gasto-logistica.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateGastoLogisticaDto, UpdateGastoLogisticaDto } from '../dto/gasto-logistica.dto'
import { MovimientosFuenteService } from '../../fuentes/service/movimientos-fuente.service'
import { calcularConversion, camposConversion, ResultadoConversion } from '../../../common/lib/conversion-moneda'

const ORIGEN = 'logistica_gasto'

@Injectable()
export class GastosLogisticaService {
  constructor(
    @InjectRepository(GastoLogistica)
    private readonly repo: Repository<GastoLogistica>,
    private readonly movimientosSvc: MovimientosFuenteService,
  ) {}

  /** El egreso en la fuente es el total del gasto (monto × cantidad) convertido */
  private async sincronizarEgreso(clienteId: string, g: GastoLogistica, total: number, conv: ResultadoConversion, usuario: string, manager: EntityManager) {
    await this.movimientosSvc.reemplazarExterno(
      clienteId, ORIGEN, g.id,
      g.fuenteId
        ? {
          fuenteId: g.fuenteId,
          tipo: 'EGRESO',
          concepto: g.descripcion || 'Gasto logístico',
          fecha: g.fechaGasto,
          categoria: 'GASTO_LOGISTICA',
          monedaPagoId: g.monedaId,
          total,
          conversion: conv,
        }
        : null,
      usuario, manager,
    )
  }

  async listar(clienteId: string, ordenId: string): Promise<GastoLogistica[]> {
    return this.repo.find({
      where: { ordenImportacionId: ordenId, clienteId, estado: Status.ACTIVE },
      order: { fechaCreacion: 'ASC' },
    })
  }

  async obtener(clienteId: string, ordenId: string, id: string): Promise<GastoLogistica> {
    const g = await this.repo.findOne({ where: { id, ordenImportacionId: ordenId, clienteId, estado: Status.ACTIVE } })
    if (!g) throw new NotFoundException(Messages.NOT_FOUND)
    return g
  }

  async crear(clienteId: string, ordenId: string, dto: CreateGastoLogisticaDto, usuarioCreacion: string): Promise<GastoLogistica> {
    const { fuenteId, tcOperacion, monedaIntermediaId, tcPaso2, tcPaso2Operacion, ...gastoData } = dto
    const cantidad = Number(dto.cantidad) || 1
    const total = Number(dto.monto) * cantidad
    const conv = calcularConversion(total, dto)
    return this.repo.manager.transaction(async m => {
      const repo = m.getRepository(GastoLogistica)
      const gasto = await repo.save(
        repo.create({
          ...gastoData,
          ...camposConversion(conv),
          clienteId,
          ordenImportacionId: ordenId,
          cantidad,
          montoMonedaBase: conv.montoBase,
          fuenteId: fuenteId || undefined,
          estado: Status.ACTIVE,
          transaccion: Transacccion.CREAR,
          usuarioCreacion,
        }),
      )
      if (gasto.fuenteId) await this.sincronizarEgreso(clienteId, gasto, total, conv, usuarioCreacion, m)
      return gasto
    })
  }

  async actualizar(clienteId: string, ordenId: string, id: string, dto: UpdateGastoLogisticaDto, usuarioModificacion: string): Promise<GastoLogistica> {
    const g = await this.obtener(clienteId, ordenId, id)
    const { fuenteId, tcOperacion, monedaIntermediaId, tcPaso2, tcPaso2Operacion, ...rest } = dto
    const teniaFuente = !!g.fuenteId
    Object.assign(g, rest)
    const cantidad = Number(g.cantidad) || 1
    const total = Number(g.monto) * cantidad
    const conv = calcularConversion(total, {
      tipoCambio: dto.tipoCambio ?? (g.tcPaso1 != null ? Number(g.tcPaso1) : Number(g.tipoCambio)),
      tcOperacion: tcOperacion ?? g.tcOperacion,
      monedaIntermediaId: monedaIntermediaId !== undefined ? monedaIntermediaId : g.monedaIntermediaId,
      tcPaso2: tcPaso2 !== undefined ? tcPaso2 : g.tcPaso2,
      tcPaso2Operacion: tcPaso2Operacion !== undefined ? tcPaso2Operacion : g.tcPaso2Operacion,
    })
    Object.assign(g, camposConversion(conv), { cantidad, montoMonedaBase: conv.montoBase })
    // fuenteId: uuid = cambiar/mantener fuente · null/'' = quitar egreso · ausente = mantener la actual
    if (fuenteId !== undefined) g.fuenteId = fuenteId || null
    Object.assign(g, { transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.manager.transaction(async m => {
      const saved = await m.getRepository(GastoLogistica).save(g)
      if (saved.fuenteId || teniaFuente) await this.sincronizarEgreso(clienteId, saved, total, conv, usuarioModificacion, m)
      return saved
    })
  }

  async eliminar(clienteId: string, ordenId: string, id: string, usuarioModificacion: string): Promise<void> {
    const g = await this.obtener(clienteId, ordenId, id)
    Object.assign(g, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(g)
    await this.movimientosSvc.cancelarPorOrigen(clienteId, ORIGEN, id, usuarioModificacion)
  }
}
