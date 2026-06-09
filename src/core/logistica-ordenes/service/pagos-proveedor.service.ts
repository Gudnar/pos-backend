import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PagoProveedorImportacion } from '../entity/pago-proveedor-importacion.entity'
import { OrdenImportacion } from '../entity/orden-importacion.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreatePagoProveedorDto, UpdatePagoProveedorDto } from '../dto/pago-proveedor.dto'
import { MovimientosFuenteService } from '../../fuentes/service/movimientos-fuente.service'

@Injectable()
export class PagosProveedorService {
  constructor(
    @InjectRepository(PagoProveedorImportacion)
    private readonly repo: Repository<PagoProveedorImportacion>,
    @InjectRepository(OrdenImportacion)
    private readonly ordenRepo: Repository<OrdenImportacion>,
    private readonly movimientosSvc: MovimientosFuenteService,
  ) {}

  private async validarLimite(clienteId: string, ordenId: string, nuevoMontoBase: number, excluirId?: string): Promise<void> {
    const orden = await this.ordenRepo.findOne({ where: { id: ordenId, clienteId } })
    if (!orden?.totalProductosMonedaBase) return
    const pagos = await this.repo.find({ where: { ordenImportacionId: ordenId, clienteId, estado: Status.ACTIVE } })
    const totalExistente = pagos
      .filter(p => p.id !== excluirId)
      .reduce((s, p) => s + Number(p.monto) * Number(p.tipoCambio), 0)
    const nuevoTotal = totalExistente + nuevoMontoBase
    const limite = Number(orden.totalProductosMonedaBase)
    if (nuevoTotal > limite + 0.01) {
      const pendiente = Math.max(0, limite - totalExistente)
      throw new BadRequestException(
        `El pago excede el monto pendiente. Pendiente: ${pendiente.toFixed(2)} — Este pago: ${nuevoMontoBase.toFixed(2)}`
      )
    }
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
    await this.validarLimite(clienteId, ordenId, Number(dto.monto) * Number(dto.tipoCambio))
    const { fuenteId, ...pagoData } = dto
    const pago = await this.repo.save(
      this.repo.create({
        ...pagoData,
        clienteId,
        ordenImportacionId: ordenId,
        montoMonedaBase: Number(dto.monto) * Number(dto.tipoCambio),
        metodoPago: dto.metodoPago ?? 'TRANSFERENCIA',
        fuenteId: fuenteId || undefined,
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion,
      }),
    )
    if (fuenteId) {
      await this.movimientosSvc.registrarExterno(
        clienteId, fuenteId, 'EGRESO',
        `Pago proveedor — Orden logística`,
        Number(dto.monto), dto.monedaId, Number(dto.tipoCambio),
        dto.fechaPago, 'PAGO_PROVEEDOR', 'logistica_pago', pago.id, usuarioCreacion,
      )
    }
    return pago
  }

  async actualizar(clienteId: string, ordenId: string, id: string, dto: UpdatePagoProveedorDto, usuarioModificacion: string): Promise<PagoProveedorImportacion> {
    const p = await this.obtener(clienteId, ordenId, id)
    const nuevoMonto = Number(dto.monto ?? p.monto)
    const nuevoTc = Number(dto.tipoCambio ?? p.tipoCambio)
    await this.validarLimite(clienteId, ordenId, nuevoMonto * nuevoTc, id)
    const { fuenteId, ...rest } = dto as any
    const nuevaFuente: string | undefined = fuenteId || undefined
    Object.assign(p, rest)
    p.montoMonedaBase = Number(p.monto) * Number(p.tipoCambio)
    if (nuevaFuente !== undefined) p.fuenteId = nuevaFuente
    Object.assign(p, { transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    const saved = await this.repo.save(p)
    if (nuevaFuente) {
      await this.movimientosSvc.registrarExterno(
        clienteId, nuevaFuente, 'EGRESO',
        `Pago proveedor actualizado — Orden logística`,
        Number(saved.monto), saved.monedaId, Number(saved.tipoCambio),
        saved.fechaPago, 'PAGO_PROVEEDOR', 'logistica_pago', saved.id, usuarioModificacion,
      )
    }
    return saved
  }

  async eliminar(clienteId: string, ordenId: string, id: string, usuarioModificacion: string): Promise<void> {
    const p = await this.obtener(clienteId, ordenId, id)
    Object.assign(p, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(p)
    if (p.fuenteId) {
      await this.movimientosSvc.cancelarPorOrigen(clienteId, 'logistica_pago', id, usuarioModificacion)
    }
  }
}
