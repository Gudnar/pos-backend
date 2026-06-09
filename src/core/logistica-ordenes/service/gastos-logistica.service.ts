import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { GastoLogistica } from '../entity/gasto-logistica.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateGastoLogisticaDto, UpdateGastoLogisticaDto } from '../dto/gasto-logistica.dto'
import { MovimientosFuenteService } from '../../fuentes/service/movimientos-fuente.service'

@Injectable()
export class GastosLogisticaService {
  constructor(
    @InjectRepository(GastoLogistica)
    private readonly repo: Repository<GastoLogistica>,
    private readonly movimientosSvc: MovimientosFuenteService,
  ) {}

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
    const { fuenteId, ...gastoData } = dto
    const gasto = await this.repo.save(
      this.repo.create({
        ...gastoData,
        clienteId,
        ordenImportacionId: ordenId,
        montoMonedaBase: Number(dto.monto) * Number(dto.tipoCambio),
        fuenteId: fuenteId || undefined,
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion,
      }),
    )
    if (fuenteId) {
      await this.movimientosSvc.registrarExterno(
        clienteId, fuenteId, 'EGRESO',
        dto.descripcion ?? 'Gasto logístico',
        Number(dto.monto), dto.monedaId, Number(dto.tipoCambio),
        dto.fechaGasto, 'GASTO_LOGISTICA', 'logistica_gasto', gasto.id, usuarioCreacion,
      )
    }
    return gasto
  }

  async actualizar(clienteId: string, ordenId: string, id: string, dto: UpdateGastoLogisticaDto, usuarioModificacion: string): Promise<GastoLogistica> {
    const g = await this.obtener(clienteId, ordenId, id)
    const { fuenteId, ...rest } = dto as any
    const nuevaFuente: string | undefined = fuenteId || undefined
    Object.assign(g, rest)
    g.montoMonedaBase = Number(g.monto) * Number(g.tipoCambio)
    if (nuevaFuente !== undefined) g.fuenteId = nuevaFuente
    Object.assign(g, { transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    const saved = await this.repo.save(g)
    if (nuevaFuente) {
      await this.movimientosSvc.registrarExterno(
        clienteId, nuevaFuente, 'EGRESO',
        saved.descripcion ?? 'Gasto logístico actualizado',
        Number(saved.monto), saved.monedaId, Number(saved.tipoCambio),
        saved.fechaGasto, 'GASTO_LOGISTICA', 'logistica_gasto', saved.id, usuarioModificacion,
      )
    }
    return saved
  }

  async eliminar(clienteId: string, ordenId: string, id: string, usuarioModificacion: string): Promise<void> {
    const g = await this.obtener(clienteId, ordenId, id)
    Object.assign(g, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(g)
    if (g.fuenteId) {
      await this.movimientosSvc.cancelarPorOrigen(clienteId, 'logistica_gasto', id, usuarioModificacion)
    }
  }
}
