import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { OrdenImportacion } from '../../logistica-ordenes/entity/orden-importacion.entity'
import { ItemOrdenImportacion } from '../../logistica-ordenes/entity/item-orden-importacion.entity'
import { PagoProveedorImportacion } from '../../logistica-ordenes/entity/pago-proveedor-importacion.entity'
import { GastoLogistica } from '../../logistica-ordenes/entity/gasto-logistica.entity'
import { Moneda } from '../../logistica-monedas/entity/moneda.entity'
import { Fuente } from '../../fuentes/entity/fuente.entity'
import { MovimientoFuente } from '../../fuentes/entity/movimiento-fuente.entity'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class AdminGerenteLogisticaService {
  private readonly logger = new Logger(AdminGerenteLogisticaService.name)

  constructor(
    @InjectRepository(OrdenImportacion) private readonly ordenRepo: Repository<OrdenImportacion>,
    @InjectRepository(ItemOrdenImportacion) private readonly itemRepo: Repository<ItemOrdenImportacion>,
    @InjectRepository(PagoProveedorImportacion) private readonly pagoRepo: Repository<PagoProveedorImportacion>,
    @InjectRepository(GastoLogistica) private readonly gastoRepo: Repository<GastoLogistica>,
    @InjectRepository(Moneda) private readonly monedaRepo: Repository<Moneda>,
    @InjectRepository(Fuente) private readonly fuenteRepo: Repository<Fuente>,
    @InjectRepository(MovimientoFuente) private readonly movFuenteRepo: Repository<MovimientoFuente>,
  ) {}

  // ── Tool definitions ──────────────────────────────────────────────────────

  getToolDefs(): any[] {
    return [
      {
        name: 'consultar_orden_importacion',
        description: 'Consulta el detalle completo de una orden de importación: ítems, pagos realizados a proveedor y gastos de logística registrados.',
        input_schema: {
          type: 'object',
          properties: {
            numero_orden: {
              type: 'string',
              description: 'Número de la orden (ej. IMP-2024-001). Si se omite, lista las últimas 10 órdenes activas.',
            },
          },
        },
      },
      {
        name: 'registrar_pago_proveedor_importacion',
        description: 'Registra un pago realizado al proveedor de una orden de importación. Si se indica una fuente de fondos, también registra el egreso en esa fuente.',
        input_schema: {
          type: 'object',
          properties: {
            numero_orden: { type: 'string', description: 'Número de la orden de importación' },
            monto: { type: 'number', description: 'Monto pagado en la moneda indicada' },
            moneda_codigo: { type: 'string', description: 'Código ISO de la moneda (ej. USD, BOB, EUR)' },
            tipo_cambio: { type: 'number', description: 'Tipo de cambio a moneda base (default: 1 si es moneda base)' },
            metodo_pago: {
              type: 'string',
              enum: ['TRANSFERENCIA', 'CARTA_CREDITO', 'EFECTIVO', 'OTRO'],
              description: 'Método de pago (default: TRANSFERENCIA)',
            },
            referencia: { type: 'string', description: 'Nro. de transferencia o referencia (opcional)' },
            nombre_fuente: { type: 'string', description: 'Nombre de la fuente de fondos de donde sale el dinero (opcional)' },
            fecha: { type: 'string', description: 'Fecha del pago YYYY-MM-DD (default: hoy)' },
            observaciones: { type: 'string', description: 'Notas adicionales (opcional)' },
          },
          required: ['numero_orden', 'monto', 'moneda_codigo'],
        },
      },
      {
        name: 'registrar_gasto_logistica',
        description: 'Registra un gasto de logística asociado a una orden de importación (flete, aduana, almacenaje, etc.). Opcionalmente registra el egreso en una fuente de fondos.',
        input_schema: {
          type: 'object',
          properties: {
            numero_orden: { type: 'string', description: 'Número de la orden de importación' },
            descripcion: { type: 'string', description: 'Descripción del gasto (ej. Flete marítimo, Agente aduanas)' },
            monto: { type: 'number', description: 'Monto del gasto en la moneda indicada' },
            moneda_codigo: { type: 'string', description: 'Código ISO de la moneda (ej. USD, BOB)' },
            tipo_cambio: { type: 'number', description: 'Tipo de cambio a moneda base (default: 1)' },
            pais: { type: 'string', description: 'País donde se incurrió el gasto (opcional)' },
            nombre_fuente: { type: 'string', description: 'Fuente de fondos de donde sale el pago (opcional)' },
            fecha: { type: 'string', description: 'Fecha del gasto YYYY-MM-DD (default: hoy)' },
            comprobante: { type: 'string', description: 'Nro. de comprobante (opcional)' },
          },
          required: ['numero_orden', 'descripcion', 'monto', 'moneda_codigo'],
        },
      },
    ]
  }

  // ── Dispatcher ────────────────────────────────────────────────────────────

  async ejecutar(nombre: string, input: any, clienteId: string, adminId: string): Promise<any> {
    switch (nombre) {
      case 'consultar_orden_importacion':           return this.consultarOrden(input, clienteId)
      case 'registrar_pago_proveedor_importacion':  return this.registrarPago(input, clienteId, adminId)
      case 'registrar_gasto_logistica':             return this.registrarGasto(input, clienteId, adminId)
      default: return null
    }
  }

  // ── Implementaciones ──────────────────────────────────────────────────────

  private async consultarOrden(input: any, clienteId: string): Promise<any> {
    if (input.numero_orden) {
      const orden = await this.ordenRepo.findOne({
        where: { numero: input.numero_orden, clienteId, estado: Status.ACTIVE } as any,
      })
      if (!orden) return { error: `Orden "${input.numero_orden}" no encontrada` }

      const [items, pagos, gastos] = await Promise.all([
        this.itemRepo.find({ where: { ordenImportacionId: orden.id, clienteId, estado: Status.ACTIVE } as any }),
        this.pagoRepo.find({ where: { ordenImportacionId: orden.id, clienteId, estado: Status.ACTIVE } as any }),
        this.gastoRepo.find({ where: { ordenImportacionId: orden.id, clienteId, estado: Status.ACTIVE } as any }),
      ])

      const totalPagado = pagos.reduce((s, p) => s + Number(p.monto) * Number(p.tipoCambio), 0)
      const totalGastos = gastos.reduce((s, g) => s + Number(g.monto) * Number(g.tipoCambio), 0)

      return {
        numero: orden.numero,
        estado: orden.estadoOrden,
        paisOrigen: orden.paisOrigen,
        fechaOrden: orden.fechaOrden,
        fechaEstimadaLlegada: orden.fechaEstimadaLlegada || null,
        costoProductosBase: Number(orden.totalProductosMonedaBase || 0),
        costoGastosBase: Number(orden.totalGastosMonedaBase || 0),
        costoTotalBase: Number(orden.costoTotalMonedaBase || 0),
        totalPagadoProveedor: Number(totalPagado.toFixed(2)),
        totalGastosLogistica: Number(totalGastos.toFixed(2)),
        items: items.map(i => ({
          producto: i.descripcionProducto,
          cantidadUnidades: i.cantidadUnidades,
          costoUnitario: Number(i.costoTotalUnitario || 0),
          precioVenta: Number(i.precioVentaManual || i.precioVentaSugerido || 0),
        })),
        pagos: pagos.map(p => ({
          monto: Number(p.monto), tipoCambio: Number(p.tipoCambio),
          montoBase: Number(p.montoMonedaBase || 0),
          fecha: p.fechaPago, metodo: p.metodoPago,
        })),
        gastosLogistica: gastos.map(g => ({
          descripcion: g.descripcion, monto: Number(g.monto),
          tipoCambio: Number(g.tipoCambio), montoBase: Number(g.montoMonedaBase || 0),
          fecha: g.fechaGasto, pais: g.pais || '',
        })),
      }
    }

    // Sin número: listar últimas 10 órdenes activas
    const ordenes = await this.ordenRepo
      .createQueryBuilder('o')
      .where("o.cliente_id = :clienteId AND o._estado = :activo AND o.estado != 'BORRADOR'", {
        clienteId, activo: Status.ACTIVE,
      })
      .orderBy('o._fecha_creacion', 'DESC')
      .limit(10)
      .getMany()

    return {
      ordenes: ordenes.map(o => ({
        numero: o.numero,
        estado: o.estadoOrden,
        paisOrigen: o.paisOrigen,
        fechaOrden: o.fechaOrden,
        costoTotal: Number(o.costoTotalMonedaBase || 0),
      })),
    }
  }

  private async registrarPago(input: any, clienteId: string, adminId: string): Promise<any> {
    const orden = await this.ordenRepo.findOne({
      where: { numero: input.numero_orden, clienteId, estado: Status.ACTIVE } as any,
    })
    if (!orden) return { error: `Orden "${input.numero_orden}" no encontrada` }

    const moneda = await this.monedaRepo.findOne({
      where: { codigo: input.moneda_codigo.toUpperCase(), clienteId, estado: Status.ACTIVE } as any,
    })
    if (!moneda) return { error: `Moneda "${input.moneda_codigo}" no encontrada. Verifica el código ISO.` }

    const tipoCambio = Number(input.tipo_cambio || 1)
    const montoBase = Number(input.monto) * tipoCambio
    const hoy = new Date().toISOString().split('T')[0]

    const pago = this.pagoRepo.create({
      clienteId,
      ordenImportacionId: orden.id,
      monedaId: moneda.id,
      monto: input.monto,
      tipoCambio,
      montoMonedaBase: montoBase,
      fechaPago: input.fecha || hoy,
      metodoPago: input.metodo_pago || 'TRANSFERENCIA',
      referencia: input.referencia || null,
      observaciones: input.observaciones || null,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion: adminId,
    } as any)
    await this.pagoRepo.save(pago)

    // Registrar egreso en fuente si se indicó
    if (input.nombre_fuente) {
      await this.registrarEgresoFuente(
        input.nombre_fuente, clienteId, adminId,
        montoBase,
        `Pago proveedor - Orden ${orden.numero}`,
        'PAGO_PROVEEDOR',
        input.referencia || null,
        input.fecha || hoy,
      )
    }

    return {
      exito: true,
      orden: orden.numero,
      monto: Number(input.monto),
      moneda: moneda.codigo,
      montoBase: Number(montoBase.toFixed(2)),
      mensaje: `Pago de ${input.monto} ${moneda.codigo} registrado en orden ${orden.numero}.${input.nombre_fuente ? ` Egreso registrado en fuente.` : ''}`,
    }
  }

  private async registrarGasto(input: any, clienteId: string, adminId: string): Promise<any> {
    const orden = await this.ordenRepo.findOne({
      where: { numero: input.numero_orden, clienteId, estado: Status.ACTIVE } as any,
    })
    if (!orden) return { error: `Orden "${input.numero_orden}" no encontrada` }

    const moneda = await this.monedaRepo.findOne({
      where: { codigo: input.moneda_codigo.toUpperCase(), clienteId, estado: Status.ACTIVE } as any,
    })
    if (!moneda) return { error: `Moneda "${input.moneda_codigo}" no encontrada. Verifica el código ISO.` }

    const tipoCambio = Number(input.tipo_cambio || 1)
    const montoBase = Number(input.monto) * tipoCambio
    const hoy = new Date().toISOString().split('T')[0]

    const gasto = this.gastoRepo.create({
      clienteId,
      ordenImportacionId: orden.id,
      descripcion: input.descripcion,
      monedaId: moneda.id,
      monto: input.monto,
      tipoCambio,
      montoMonedaBase: montoBase,
      fechaGasto: input.fecha || hoy,
      pais: input.pais || null,
      comprobante: input.comprobante || null,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion: adminId,
    } as any)
    await this.gastoRepo.save(gasto)

    if (input.nombre_fuente) {
      await this.registrarEgresoFuente(
        input.nombre_fuente, clienteId, adminId,
        montoBase,
        `Gasto logística - Orden ${orden.numero}: ${input.descripcion}`,
        'GASTO_LOGISTICA',
        input.comprobante || null,
        input.fecha || hoy,
      )
    }

    return {
      exito: true,
      orden: orden.numero,
      descripcion: input.descripcion,
      monto: Number(input.monto),
      moneda: moneda.codigo,
      montoBase: Number(montoBase.toFixed(2)),
      mensaje: `Gasto de logística de ${input.monto} ${moneda.codigo} registrado en orden ${orden.numero}.`,
    }
  }

  // ── Helper: egreso en fuente de fondos ────────────────────────────────────

  private async registrarEgresoFuente(
    nombreFuente: string,
    clienteId: string,
    adminId: string,
    monto: number,
    concepto: string,
    categoria: string,
    referencia: string | null,
    fecha: string,
  ): Promise<void> {
    const fuentes = await this.fuenteRepo.find({ where: { clienteId, estado: Status.ACTIVE } as any })
    const fuente = fuentes.find(f => f.nombre.toLowerCase().includes(nombreFuente.toLowerCase()))
    if (!fuente) return

    await this.movFuenteRepo.save(
      this.movFuenteRepo.create({
        clienteId, fuenteId: fuente.id,
        tipo: 'EGRESO', concepto, referencia, categoria,
        monto, tipoCambio: 1, montoNativo: monto, fecha,
        estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: adminId,
      } as any),
    )
  }
}
