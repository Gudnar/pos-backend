import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Venta, EstadoVenta } from '../entity/venta.entity'
import { VentaPago, OrigenPagoVenta } from '../entity/venta-pago.entity'
import { VentaDocumentosService } from './venta-documentos.service'
import { MovimientosFuenteService } from '../../fuentes/service/movimientos-fuente.service'
import { Status, Transacccion } from '../../../common/constants'
import { RegistrarPagoVentaDto } from '../dto/venta-pago.dto'

export const ORIGEN_MOV_PAGO = 'venta_pago'

const r2 = (n: number) => Math.round(n * 100) / 100

/** Lo pagado nunca supera el total: si hubo cambio, montoPagado incluye lo entregado de más. */
const pagadoDe = (v: Venta) => r2(Math.min(Number(v.total || 0), Number(v.montoPagado || 0)))

/** Pagos de una venta: los cobrados en el POS y los abonos posteriores, cada uno con su comprobante. */
@Injectable()
export class VentaPagosService {
  private schema = process.env.DB_SCHEMA || 'public'

  constructor(
    @InjectRepository(Venta) private readonly ventaRepo: Repository<Venta>,
    @InjectRepository(VentaPago) private readonly pagoRepo: Repository<VentaPago>,
    private readonly docsSvc: VentaDocumentosService,
    private readonly movimientosSvc: MovimientosFuenteService,
    private readonly ds: DataSource,
  ) {}

  private async obtenerVenta(clienteId: string, ventaId: string): Promise<Venta> {
    const venta = await this.ventaRepo.findOne({ where: { id: ventaId, clienteId, estado: Status.ACTIVE } })
    if (!venta) throw new NotFoundException('Venta no encontrada')
    return venta
  }

  async listar(clienteId: string, ventaId: string): Promise<any> {
    const venta = await this.obtenerVenta(clienteId, ventaId)
    const pagos = await this.ds.query(
      `SELECT p.id, p.origen, p.fecha::text AS fecha, p.metodo_pago AS "metodoPago", p.monto::float AS monto,
              p.referencia, p.observaciones, p.fuente_id AS "fuenteId", f.nombre AS "fuenteNombre",
              p.comprobante_nombre AS "comprobanteNombre", p.comprobante_mime AS "comprobanteMime",
              p.comprobante_tamano AS "comprobanteTamano"
       FROM ${this.schema}.venta_pago p
       LEFT JOIN ${this.schema}.fuente f ON f.id = p.fuente_id
       WHERE p.cliente_id = $1 AND p.venta_id = $2 AND p._estado = $3
       ORDER BY p.fecha ASC, p._fecha_creacion ASC`,
      [clienteId, ventaId, Status.ACTIVE],
    )
    const total = r2(Number(venta.total || 0))
    const pagado = pagadoDe(venta)
    const conDetalle = r2(pagos.reduce((s: number, p: any) => s + Number(p.monto), 0))
    return {
      total,
      pagado,
      saldo: r2(Math.max(0, total - pagado)),
      // Ventas anteriores a este registro: lo pagado al venderlas no tiene detalle por pago
      pagoInicialSinDetalle: r2(Math.max(0, pagado - conDetalle)),
      pagos,
    }
  }

  async registrarAbono(clienteId: string, ventaId: string, dto: RegistrarPagoVentaDto, usuarioId: string): Promise<VentaPago> {
    const [fuente] = await this.ds.query(
      `SELECT id FROM ${this.schema}.fuente WHERE id = $1 AND cliente_id = $2 AND _estado = $3`,
      [dto.fuenteId, clienteId, Status.ACTIVE],
    )
    if (!fuente) throw new NotFoundException('Fuente de fondos no encontrada')

    return this.ds.transaction(async manager => {
      // Bloqueo de la venta: dos abonos simultáneos no pueden superar el saldo
      const venta = await manager.findOne(Venta, {
        where: { id: ventaId, clienteId, estado: Status.ACTIVE },
        lock: { mode: 'pessimistic_write' },
      })
      if (!venta) throw new NotFoundException('Venta no encontrada')
      if (venta.estadoVenta === EstadoVenta.ANULADA) throw new BadRequestException('La venta está anulada')

      const total = r2(Number(venta.total || 0))
      const pagado = pagadoDe(venta)
      const saldo = r2(total - pagado)
      const monto = r2(Number(dto.monto))
      if (saldo <= 0) throw new BadRequestException('La venta no tiene saldo pendiente')
      if (monto > saldo + 0.009) throw new BadRequestException(`El pago supera el saldo pendiente (Bs ${saldo.toFixed(2)})`)

      const pago = await manager.save(VentaPago, manager.create(VentaPago, {
        clienteId, ventaId, origen: OrigenPagoVenta.ABONO,
        fecha: dto.fecha, metodoPago: dto.metodoPago, monto,
        referencia: dto.referencia || undefined, fuenteId: dto.fuenteId, observaciones: dto.observaciones || undefined,
        estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: usuarioId,
      }))

      const nuevoPagado = r2(pagado + monto)
      await manager.update(Venta, { id: ventaId }, {
        montoPagado: nuevoPagado,
        estadoVenta: nuevoPagado >= total - 0.009 ? EstadoVenta.PAGADA : EstadoVenta.PENDIENTE,
        usuarioModificacion: usuarioId,
        transaccion: Transacccion.ACTUALIZAR,
      })

      await this.movimientosSvc.registrarExterno(
        clienteId, dto.fuenteId, 'INGRESO',
        `Cobro venta ${venta.nroVenta}${venta.nombreCliente ? ` - ${venta.nombreCliente}` : ''}${dto.referencia ? ` (ref. ${dto.referencia})` : ''}`,
        monto, undefined, 1, dto.fecha, 'INGRESO_VENTA', ORIGEN_MOV_PAGO, pago.id, usuarioId,
      )
      return pago
    })
  }

  async eliminarAbono(clienteId: string, ventaId: string, pagoId: string, usuarioId: string): Promise<void> {
    await this.ds.transaction(async manager => {
      const venta = await manager.findOne(Venta, {
        where: { id: ventaId, clienteId, estado: Status.ACTIVE },
        lock: { mode: 'pessimistic_write' },
      })
      if (!venta) throw new NotFoundException('Venta no encontrada')
      const pago = await this.buscarPago(clienteId, ventaId, pagoId)
      if (pago.origen !== OrigenPagoVenta.ABONO) {
        throw new BadRequestException('Los pagos cobrados en el POS no se eliminan aquí; anula la venta si corresponde')
      }

      await manager.update(VentaPago, { id: pago.id }, {
        estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion: usuarioId,
      })
      if (venta.estadoVenta !== EstadoVenta.ANULADA) {
        const total = r2(Number(venta.total || 0))
        const nuevoPagado = r2(Math.max(0, pagadoDe(venta) - Number(pago.monto)))
        await manager.update(Venta, { id: ventaId }, {
          montoPagado: nuevoPagado,
          estadoVenta: nuevoPagado >= total - 0.009 ? EstadoVenta.PAGADA : EstadoVenta.PENDIENTE,
          usuarioModificacion: usuarioId,
          transaccion: Transacccion.ACTUALIZAR,
        })
      }
      await this.movimientosSvc.cancelarPorOrigen(clienteId, ORIGEN_MOV_PAGO, pago.id, usuarioId)
      await this.docsSvc.borrarArchivo(pago.comprobanteRuta)
    })
  }

  /** Al anular la venta, los cobros que entraron a fuentes de fondos se revierten. */
  async cancelarMovimientosDeVenta(clienteId: string, ventaId: string, usuarioId: string): Promise<void> {
    const abonos = await this.pagoRepo.find({ where: { clienteId, ventaId, origen: OrigenPagoVenta.ABONO, estado: Status.ACTIVE } })
    for (const p of abonos) await this.movimientosSvc.cancelarPorOrigen(clienteId, ORIGEN_MOV_PAGO, p.id, usuarioId)
  }

  /**
   * Ventas anteriores al registro de pagos: lo pagado al venderlas no tiene fila propia.
   * Al adjuntar su comprobante se crea ese pago (origen POS, con el método y la fecha de la venta).
   */
  async detallarPagoInicialConComprobante(clienteId: string, ventaId: string, file: Express.Multer.File, usuarioId: string): Promise<VentaPago> {
    await this.obtenerVenta(clienteId, ventaId)
    // Primero se valida y guarda el archivo: si no es válido no se crea el pago
    const archivo = await this.docsSvc.guardarArchivo(clienteId, ventaId, 'comprobante-pago', file)
    try {
      return await this.ds.transaction(async manager => {
        const venta = await manager.findOne(Venta, {
          where: { id: ventaId, clienteId, estado: Status.ACTIVE },
          lock: { mode: 'pessimistic_write' },
        })
        if (!venta) throw new NotFoundException('Venta no encontrada')
        const [{ suma }] = await manager.query(
          `SELECT COALESCE(SUM(monto), 0)::float AS suma FROM ${this.schema}.venta_pago
           WHERE cliente_id = $1 AND venta_id = $2 AND _estado = $3`, [clienteId, ventaId, Status.ACTIVE])
        const sinDetalle = r2(pagadoDe(venta) - Number(suma))
        if (sinDetalle <= 0) throw new BadRequestException('Esta venta no tiene un pago inicial sin detalle')
        return manager.save(VentaPago, manager.create(VentaPago, {
          clienteId, ventaId, origen: OrigenPagoVenta.POS,
          fecha: venta.fecha, metodoPago: venta.metodoPago || 'EFECTIVO', monto: sinDetalle,
          comprobanteNombre: archivo.nombreOriginal, comprobanteMime: archivo.mimeType,
          comprobanteTamano: archivo.tamano, comprobanteRuta: archivo.rutaRelativa,
          estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: usuarioId,
        }))
      })
    } catch (e) {
      await this.docsSvc.borrarArchivo(archivo.rutaRelativa)
      throw e
    }
  }

  // ── Comprobante de cada pago ───────────────────────────────────────────────
  async subirComprobante(clienteId: string, ventaId: string, pagoId: string, file: Express.Multer.File, usuarioId: string): Promise<any> {
    await this.obtenerVenta(clienteId, ventaId)
    const pago = await this.buscarPago(clienteId, ventaId, pagoId)
    const archivo = await this.docsSvc.guardarArchivo(clienteId, ventaId, 'comprobante-pago', file)
    const anterior = pago.comprobanteRuta
    await this.pagoRepo.update({ id: pago.id }, {
      comprobanteNombre: archivo.nombreOriginal, comprobanteMime: archivo.mimeType,
      comprobanteTamano: archivo.tamano, comprobanteRuta: archivo.rutaRelativa,
      usuarioModificacion: usuarioId, transaccion: Transacccion.ACTUALIZAR,
    })
    await this.docsSvc.borrarArchivo(anterior)
    return { id: pago.id, comprobanteNombre: archivo.nombreOriginal, comprobanteMime: archivo.mimeType, comprobanteTamano: archivo.tamano }
  }

  async obtenerComprobante(clienteId: string, ventaId: string, pagoId: string): Promise<{ nombre: string; mime: string; rutaAbsoluta: string }> {
    await this.obtenerVenta(clienteId, ventaId)
    const pago = await this.buscarPago(clienteId, ventaId, pagoId)
    if (!pago.comprobanteRuta) throw new NotFoundException('El pago no tiene comprobante')
    return { nombre: pago.comprobanteNombre || 'comprobante', mime: pago.comprobanteMime || 'application/octet-stream', rutaAbsoluta: await this.docsSvc.rutaExistente(pago.comprobanteRuta) }
  }

  async eliminarComprobante(clienteId: string, ventaId: string, pagoId: string, usuarioId: string): Promise<void> {
    await this.obtenerVenta(clienteId, ventaId)
    const pago = await this.buscarPago(clienteId, ventaId, pagoId)
    if (!pago.comprobanteRuta) throw new NotFoundException('El pago no tiene comprobante')
    await this.pagoRepo.update({ id: pago.id }, {
      comprobanteNombre: null as any, comprobanteMime: null as any, comprobanteTamano: null as any, comprobanteRuta: null as any,
      usuarioModificacion: usuarioId, transaccion: Transacccion.ACTUALIZAR,
    })
    await this.docsSvc.borrarArchivo(pago.comprobanteRuta)
  }

  private async buscarPago(clienteId: string, ventaId: string, pagoId: string): Promise<VentaPago> {
    const pago = await this.pagoRepo.createQueryBuilder('p')
      .addSelect('p.comprobanteRuta')
      .where('p.id = :pagoId AND p.clienteId = :clienteId AND p.ventaId = :ventaId AND p.estado = :est',
        { pagoId, clienteId, ventaId, est: Status.ACTIVE })
      .getOne()
    if (!pago) throw new NotFoundException('Pago no encontrado')
    return pago
  }
}
