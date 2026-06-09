import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, Repository } from 'typeorm'
import { Venta } from '../../ventas/entity/venta.entity'
import { Lote } from '../../lotes/entity/lote.entity'
import { Ingreso } from '../../ingresos/entity/ingreso.entity'
import { Gasto } from '../../gastos/entity/gasto.entity'
import { Fuente } from '../../fuentes/entity/fuente.entity'
import { MovimientoFuente } from '../../fuentes/entity/movimiento-fuente.entity'
import { Producto } from '../../productos/entity/producto.entity'
import { OrdenImportacion } from '../../logistica-ordenes/entity/orden-importacion.entity'
import { Status } from '../../../common/constants'

@Injectable()
export class BizIntelToolsService {
  constructor(
    @InjectRepository(Venta) private ventaRepo: Repository<Venta>,
    @InjectRepository(Lote) private loteRepo: Repository<Lote>,
    @InjectRepository(Ingreso) private ingresoRepo: Repository<Ingreso>,
    @InjectRepository(Gasto) private gastoRepo: Repository<Gasto>,
    @InjectRepository(Fuente) private fuenteRepo: Repository<Fuente>,
    @InjectRepository(MovimientoFuente) private movRepo: Repository<MovimientoFuente>,
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
    @InjectRepository(OrdenImportacion) private ordenRepo: Repository<OrdenImportacion>,
  ) {}

  // ── Tool definitions para Anthropic ────────────────────────────────────────

  getToolDefs(): any[] {
    return [
      {
        name: 'consultar_ventas',
        description: 'Consulta el resumen de ventas del negocio por período. Retorna totales, cantidad de ventas, métodos de pago y monto promedio.',
        input_schema: {
          type: 'object',
          properties: {
            periodo: {
              type: 'string',
              enum: ['hoy', 'semana', 'mes', 'ayer'],
              description: 'Período a consultar',
            },
          },
          required: ['periodo'],
        },
      },
      {
        name: 'consultar_stock',
        description: 'Consulta el estado del inventario/stock de productos. Puede filtrar por productos con stock bajo, agotados o ver todo.',
        input_schema: {
          type: 'object',
          properties: {
            tipo: {
              type: 'string',
              enum: ['todos', 'bajo', 'agotado'],
              description: 'todos=todo el inventario, bajo=stock bajo (menos de 10 unidades), agotado=sin stock',
            },
            limite: {
              type: 'number',
              description: 'Máximo de productos a retornar (default 15)',
            },
          },
          required: ['tipo'],
        },
      },
      {
        name: 'consultar_finanzas',
        description: 'Consulta el resumen financiero: ingresos, gastos, saldo de fuentes de fondos.',
        input_schema: {
          type: 'object',
          properties: {
            periodo: {
              type: 'string',
              enum: ['hoy', 'semana', 'mes'],
              description: 'Período para los ingresos y gastos',
            },
          },
          required: ['periodo'],
        },
      },
      {
        name: 'consultar_materiales',
        description: 'Consulta las órdenes de importación/compra de materiales recientes y su estado.',
        input_schema: {
          type: 'object',
          properties: {
            estado: {
              type: 'string',
              enum: ['todos', 'pendiente', 'en_transito', 'recibida', 'cerrada'],
              description: 'Filtrar por estado de la orden',
            },
            limite: {
              type: 'number',
              description: 'Máximo de órdenes a retornar (default 10)',
            },
          },
          required: ['estado'],
        },
      },
    ]
  }

  // ── Dispatcher ──────────────────────────────────────────────────────────────

  async ejecutar(nombre: string, input: any, clienteId: string): Promise<any> {
    switch (nombre) {
      case 'consultar_ventas':    return this.consultarVentas(input, clienteId)
      case 'consultar_stock':     return this.consultarStock(input, clienteId)
      case 'consultar_finanzas':  return this.consultarFinanzas(input, clienteId)
      case 'consultar_materiales': return this.consultarMateriales(input, clienteId)
      default: return { error: `Herramienta desconocida: ${nombre}` }
    }
  }

  // ── Implementaciones ────────────────────────────────────────────────────────

  private async consultarVentas(input: any, clienteId: string): Promise<any> {
    const { inicio, fin, label } = this.rangoDeFechas(input.periodo)

    const ventas = await this.ventaRepo
      .createQueryBuilder('v')
      .where('v.cliente_id = :clienteId AND v._estado = :estado AND v.fecha BETWEEN :inicio AND :fin', {
        clienteId, estado: Status.ACTIVE, inicio, fin,
      })
      .andWhere("v.estado_venta != 'ANULADA'")
      .getMany()

    const total = ventas.reduce((s, v) => s + Number(v.total), 0)
    const porMetodo: Record<string, number> = {}
    for (const v of ventas) {
      const m = v.metodoPago || 'N/A'
      porMetodo[m] = (porMetodo[m] || 0) + Number(v.total)
    }

    return {
      periodo: label,
      cantidadVentas: ventas.length,
      montoTotal: Number(total.toFixed(2)),
      promedioPorVenta: ventas.length ? Number((total / ventas.length).toFixed(2)) : 0,
      porMetodoPago: porMetodo,
    }
  }

  private async consultarStock(input: any, clienteId: string): Promise<any> {
    const limite = input.limite || 15
    const qb = this.loteRepo
      .createQueryBuilder('l')
      .select(['l.productoId', 'SUM(l.cantidadActual) AS total'])
      .where('l.cliente_id = :clienteId AND l._estado = :estado', { clienteId, estado: Status.ACTIVE })
      .andWhere("l.estado_lote = 'ACTIVO'")
      .groupBy('l.productoId')
      .orderBy('total', 'ASC')

    if (input.tipo === 'bajo') qb.having('SUM(l.cantidadActual) < 10').andHaving('SUM(l.cantidadActual) > 0')
    if (input.tipo === 'agotado') qb.having('SUM(l.cantidadActual) = 0')

    const rows = await qb.limit(limite).getRawMany()

    const productoIds = rows.map(r => r.l_producto_id)
    const productos = productoIds.length
      ? await this.productoRepo.find({ where: productoIds.map(id => ({ id, clienteId, estado: Status.ACTIVE })) as any })
      : []
    const prodMap = new Map(productos.map(p => [p.id, p.nombre]))

    return {
      tipo: input.tipo,
      productos: rows.map(r => ({
        nombre: prodMap.get(r.l_producto_id) || r.l_producto_id,
        stockActual: Number(r.total),
      })),
      total: rows.length,
    }
  }

  private async consultarFinanzas(input: any, clienteId: string): Promise<any> {
    const { inicio, fin, label } = this.rangoDeFechas(input.periodo)

    const [ingresos, gastos, fuentes] = await Promise.all([
      this.ingresoRepo
        .createQueryBuilder('i')
        .where('i.cliente_id = :clienteId AND i._estado = :estado AND i.fecha BETWEEN :inicio AND :fin', {
          clienteId, estado: Status.ACTIVE, inicio, fin,
        })
        .getMany(),
      this.gastoRepo
        .createQueryBuilder('g')
        .where('g.cliente_id = :clienteId AND g._estado = :estado AND g.fecha BETWEEN :inicio AND :fin', {
          clienteId, estado: Status.ACTIVE, inicio, fin,
        })
        .getMany(),
      this.fuenteRepo.find({ where: { clienteId, estado: Status.ACTIVE } as any }),
    ])

    const totalIngresos = ingresos.reduce((s, i) => s + Number(i.monto), 0)
    const totalGastos = gastos.reduce((s, g) => s + Number(g.monto), 0)

    // Calcular saldo de cada fuente
    const fuentesConSaldo = await Promise.all(
      fuentes.map(async f => {
        const res = await this.movRepo
          .createQueryBuilder('m')
          .select([
            "SUM(CASE WHEN m.tipo IN ('INGRESO','TRANSFERENCIA_ENTRADA') THEN m.monto_nativo ELSE 0 END) AS entradas",
            "SUM(CASE WHEN m.tipo IN ('EGRESO','TRANSFERENCIA_SALIDA') THEN m.monto_nativo ELSE 0 END) AS salidas",
          ])
          .where('m.cliente_id = :clienteId AND m.fuente_id = :fuenteId AND m._estado = :estado', {
            clienteId, fuenteId: f.id, estado: Status.ACTIVE,
          })
          .getRawOne()
        const saldo = Number(f.saldoInicial) + Number(res?.entradas || 0) - Number(res?.salidas || 0)
        return { nombre: f.nombre, tipo: f.tipo, saldo: Number(saldo.toFixed(2)) }
      }),
    )

    return {
      periodo: label,
      totalIngresos: Number(totalIngresos.toFixed(2)),
      totalGastos: Number(totalGastos.toFixed(2)),
      balance: Number((totalIngresos - totalGastos).toFixed(2)),
      fuentesDeFondos: fuentesConSaldo,
    }
  }

  private async consultarMateriales(input: any, clienteId: string): Promise<any> {
    const limite = input.limite || 10
    const qb = this.ordenRepo
      .createQueryBuilder('o')
      .where('o.cliente_id = :clienteId AND o._estado = :estado', { clienteId, estado: Status.ACTIVE })
      .orderBy('o._fecha_creacion', 'DESC')
      .limit(limite)

    if (input.estado !== 'todos') {
      const estadoMap: Record<string, string> = {
        pendiente: 'PENDIENTE',
        en_transito: 'EN_TRANSITO',
        recibida: 'RECIBIDA',
        cerrada: 'CERRADA',
      }
      const estadoDB = estadoMap[input.estado]
      if (estadoDB) qb.andWhere('o.estado = :estadoO', { estadoO: estadoDB })
    }

    const ordenes = await qb.getMany()

    return {
      ordenes: ordenes.map(o => ({
        numero: o.numero,
        estado: o.estadoOrden,
        fechaOrden: o.fechaOrden,
        paisOrigen: o.paisOrigen,
        totalBase: Number(o.costoTotalMonedaBase || 0).toFixed(2),
        observaciones: o.observaciones || '',
      })),
      total: ordenes.length,
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private rangoDeFechas(periodo: string): { inicio: string; fin: string; label: string } {
    const hoy = new Date()
    const fmt = (d: Date) => d.toISOString().split('T')[0]

    switch (periodo) {
      case 'hoy':
        return { inicio: fmt(hoy), fin: fmt(hoy), label: 'hoy' }
      case 'ayer': {
        const ayer = new Date(hoy); ayer.setDate(ayer.getDate() - 1)
        return { inicio: fmt(ayer), fin: fmt(ayer), label: 'ayer' }
      }
      case 'semana': {
        const hace7 = new Date(hoy); hace7.setDate(hace7.getDate() - 7)
        return { inicio: fmt(hace7), fin: fmt(hoy), label: 'últimos 7 días' }
      }
      case 'mes': {
        const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
        return { inicio: fmt(inicio), fin: fmt(hoy), label: 'este mes' }
      }
      default:
        return { inicio: fmt(hoy), fin: fmt(hoy), label: 'hoy' }
    }
  }
}
