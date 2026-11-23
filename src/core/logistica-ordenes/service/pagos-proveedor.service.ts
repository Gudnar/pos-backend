import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { PagoProveedorImportacion } from '../entity/pago-proveedor-importacion.entity'
import { OrdenImportacion } from '../entity/orden-importacion.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreatePagoProveedorDto, UpdatePagoProveedorDto } from '../dto/pago-proveedor.dto'
import { MovimientosFuenteService } from '../../fuentes/service/movimientos-fuente.service'
import { calcularConversion, camposConversion, ResultadoConversion } from '../../../common/lib/conversion-moneda'

const ORIGEN = 'logistica_pago'

/** Monto en Bs de un pago: el guardado; si es un registro antiguo, monto × TC */
const baseDePago = (p: PagoProveedorImportacion) =>
  p.montoMonedaBase != null ? Number(p.montoMonedaBase) : Number(p.monto) * Number(p.tipoCambio)

@Injectable()
export class PagosProveedorService {
  constructor(
    @InjectRepository(PagoProveedorImportacion)
    private readonly repo: Repository<PagoProveedorImportacion>,
    @InjectRepository(OrdenImportacion)
    private readonly ordenRepo: Repository<OrdenImportacion>,
    private readonly movimientosSvc: MovimientosFuenteService,
  ) {}

  private async validarLimite(clienteId: string, ordenId: string, nuevoMontoBase: number, excluirId?: string): Promise<OrdenImportacion> {
    const orden = await this.ordenRepo.findOne({ where: { id: ordenId, clienteId } })
    if (!orden) throw new NotFoundException('Orden no encontrada')

    // Monto total adeudado = productos + gastos logísticos
    const totalProductos = Number(orden.totalProductosMonedaBase ?? 0)
    const totalGastos = Number(orden.totalGastosMonedaBase ?? 0)
    const montoTotal = totalProductos + totalGastos

    if (montoTotal === 0) return orden

    const pagos = await this.repo.find({ where: { ordenImportacionId: ordenId, clienteId, estado: Status.ACTIVE } })
    const totalExistente = pagos.filter(p => p.id !== excluirId).reduce((s, p) => s + baseDePago(p), 0)
    const nuevoTotal = totalExistente + nuevoMontoBase

    if (nuevoTotal > montoTotal + 0.01) {
      const pendiente = Math.max(0, montoTotal - totalExistente)
      throw new BadRequestException(
        `El pago excede el monto pendiente. Total adeudado: ${montoTotal.toFixed(2)}, Pagado: ${totalExistente.toFixed(2)}, Pendiente: ${pendiente.toFixed(2)} — Intenta pagar: ${nuevoMontoBase.toFixed(2)}`
      )
    }
    return orden
  }

  private async sincronizarEgreso(
    clienteId: string, pago: PagoProveedorImportacion, conv: ResultadoConversion, orden: OrdenImportacion,
    usuario: string, manager: EntityManager,
  ) {
    await this.movimientosSvc.reemplazarExterno(
      clienteId, ORIGEN, pago.id,
      pago.fuenteId
        ? {
          fuenteId: pago.fuenteId,
          tipo: 'EGRESO',
          concepto: `Pago proveedor — Orden ${orden.numero || 'logística'}${pago.referencia ? ' · ' + pago.referencia : ''}`,
          fecha: pago.fechaPago,
          categoria: 'PAGO_PROVEEDOR',
          monedaPagoId: pago.monedaId,
          total: Number(pago.monto),
          conversion: conv,
        }
        : null,
      usuario, manager,
    )
  }

  async listar(clienteId: string, ordenId: string): Promise<PagoProveedorImportacion[]> {
    return this.repo.find({
      where: { ordenImportacionId: ordenId, clienteId, estado: Status.ACTIVE },
      order: { fechaCreacion: 'ASC' },
    })
  }

  async obtener(clienteId: string, ordenId: string, id: string): Promise<PagoProveedorImportacion> {
    const p = await this.repo.findOne({ where: { id, ordenImportacionId: ordenId, clienteId, estado: Status.ACTIVE } })
    if (!p) throw new NotFoundException(Messages.NOT_FOUND)
    return p
  }

  async crear(clienteId: string, ordenId: string, dto: CreatePagoProveedorDto, usuarioCreacion: string): Promise<PagoProveedorImportacion> {
    const conv = calcularConversion(Number(dto.monto), dto)
    const orden = await this.validarLimite(clienteId, ordenId, conv.montoBase)
    const { fuenteId, tcOperacion, monedaIntermediaId, tcPaso2, tcPaso2Operacion, ...pagoData } = dto
    return this.repo.manager.transaction(async m => {
      const repo = m.getRepository(PagoProveedorImportacion)
      const pago = await repo.save(
        repo.create({
          ...pagoData,
          ...camposConversion(conv),
          clienteId,
          ordenImportacionId: ordenId,
          montoMonedaBase: conv.montoBase,
          metodoPago: dto.metodoPago ?? 'TRANSFERENCIA',
          fuenteId: fuenteId || undefined,
          estado: Status.ACTIVE,
          transaccion: Transacccion.CREAR,
          usuarioCreacion,
        }),
      )
      if (pago.fuenteId) await this.sincronizarEgreso(clienteId, pago, conv, orden, usuarioCreacion, m)
      return pago
    })
  }

  async actualizar(clienteId: string, ordenId: string, id: string, dto: UpdatePagoProveedorDto, usuarioModificacion: string): Promise<PagoProveedorImportacion> {
    const p = await this.obtener(clienteId, ordenId, id)
    const { fuenteId, tcOperacion, monedaIntermediaId, tcPaso2, tcPaso2Operacion, ...rest } = dto
    const monto = Number(dto.monto ?? p.monto)
    const conv = calcularConversion(monto, {
      tipoCambio: dto.tipoCambio ?? (p.tcPaso1 != null ? Number(p.tcPaso1) : Number(p.tipoCambio)),
      tcOperacion: tcOperacion ?? p.tcOperacion,
      monedaIntermediaId: monedaIntermediaId !== undefined ? monedaIntermediaId : p.monedaIntermediaId,
      tcPaso2: tcPaso2 !== undefined ? tcPaso2 : p.tcPaso2,
      tcPaso2Operacion: tcPaso2Operacion !== undefined ? tcPaso2Operacion : p.tcPaso2Operacion,
    })
    const orden = await this.validarLimite(clienteId, ordenId, conv.montoBase, id)
    const teniaFuente = !!p.fuenteId
    Object.assign(p, rest, camposConversion(conv), { monto, montoMonedaBase: conv.montoBase })
    // fuenteId: uuid = cambiar/mantener fuente · null/'' = quitar egreso · ausente = mantener la actual
    if (fuenteId !== undefined) p.fuenteId = fuenteId || null
    Object.assign(p, { transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.manager.transaction(async m => {
      const saved = await m.getRepository(PagoProveedorImportacion).save(p)
      if (saved.fuenteId || teniaFuente) await this.sincronizarEgreso(clienteId, saved, conv, orden, usuarioModificacion, m)
      return saved
    })
  }

  async eliminar(clienteId: string, ordenId: string, id: string, usuarioModificacion: string): Promise<void> {
    const p = await this.obtener(clienteId, ordenId, id)
    Object.assign(p, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(p)
    await this.movimientosSvc.cancelarPorOrigen(clienteId, ORIGEN, id, usuarioModificacion)
  }
}
