import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { ComprasService } from '../../compras/service/compras.service'
import { Producto } from '../../productos/entity/producto.entity'
import { Status } from '../../../common/constants'

@Injectable()
export class AdminGerenteComprasService {
  private readonly logger = new Logger(AdminGerenteComprasService.name)

  constructor(
    private readonly comprasService: ComprasService,
    @InjectRepository(Producto) private readonly productoRepo: Repository<Producto>,
  ) {}

  // ── Tool definitions ──────────────────────────────────────────────────────

  getToolDefs(): any[] {
    return [
      {
        name: 'consultar_compras',
        description: 'Lista las órdenes de compra con sus estados, totales y montos pagados. Filtra por estado para ver en tránsito, pendientes de recepción o finalizadas.',
        input_schema: {
          type: 'object',
          properties: {
            estado: {
              type: 'string',
              enum: ['EN_TRANSITO', 'PENDIENTE', 'FINALIZADO', 'ANULADA'],
              description: 'Filtrar por estado. Omitir para ver todas las activas.',
            },
            limite: { type: 'number', description: 'Máximo de resultados (default 10)' },
          },
        },
      },
      {
        name: 'crear_compra',
        description: 'Crea una nueva orden de compra a un proveedor. Tipo COMPRA inicia en EN_TRANSITO (mercadería en camino). Tipo INICIAL carga directamente al inventario. Para crear la compra necesitas el sucursal_id.',
        input_schema: {
          type: 'object',
          properties: {
            sucursal_id: { type: 'string', description: 'UUID de la sucursal destino' },
            tipo_compra: {
              type: 'string',
              enum: ['COMPRA', 'INICIAL'],
              description: 'COMPRA: mercadería en tránsito. INICIAL: carga directa al inventario.',
            },
            items: {
              type: 'array',
              description: 'Productos de la compra',
              items: {
                type: 'object',
                properties: {
                  nombre_producto: { type: 'string', description: 'Nombre del producto (búsqueda parcial)' },
                  cantidad: { type: 'number', description: 'Cantidad a comprar' },
                  precio_unitario: { type: 'number', description: 'Precio de compra unitario' },
                  nro_lote: { type: 'string', description: 'Número de lote (opcional)' },
                  fecha_vencimiento: { type: 'string', description: 'Fecha vencimiento del lote YYYY-MM-DD (opcional)' },
                },
                required: ['nombre_producto', 'cantidad', 'precio_unitario'],
              },
            },
            proveedor_id: { type: 'string', description: 'UUID del proveedor (opcional)' },
            nro_factura: { type: 'string', description: 'Número de factura del proveedor (opcional)' },
            fecha: { type: 'string', description: 'Fecha de la compra YYYY-MM-DD (default: hoy)' },
            fecha_estimada_llegada: { type: 'string', description: 'Fecha estimada de llegada YYYY-MM-DD (opcional)' },
            observaciones: { type: 'string', description: 'Notas adicionales (opcional)' },
          },
          required: ['sucursal_id', 'tipo_compra', 'items'],
        },
      },
      {
        name: 'recibir_compra_almacen',
        description: 'Marca una compra como recibida en almacén (transición EN_TRANSITO → PENDIENTE). Después de esto se puede finalizar para cargar al inventario.',
        input_schema: {
          type: 'object',
          properties: {
            nro_compra: { type: 'string', description: 'Número de la compra (ej. COM-0001)' },
            condicion_mercancia: {
              type: 'string',
              enum: ['BUENA', 'DAÑADA', 'PARCIAL'],
              description: 'Estado en que llegó la mercadería (default: BUENA)',
            },
            observaciones: { type: 'string', description: 'Observaciones de la recepción (opcional)' },
          },
          required: ['nro_compra'],
        },
      },
      {
        name: 'finalizar_compra_inventario',
        description: 'Finaliza una compra PENDIENTE y carga los productos al inventario. Crea los lotes y registra los movimientos de stock.',
        input_schema: {
          type: 'object',
          properties: {
            nro_compra: { type: 'string', description: 'Número de la compra (ej. COM-0001)' },
            observaciones: { type: 'string', description: 'Observaciones de la finalización (opcional)' },
          },
          required: ['nro_compra'],
        },
      },
    ]
  }

  // ── Dispatcher ────────────────────────────────────────────────────────────

  async ejecutar(nombre: string, input: any, clienteId: string, adminId: string): Promise<any> {
    switch (nombre) {
      case 'consultar_compras':          return this.consultarCompras(input, clienteId)
      case 'crear_compra':               return this.crearCompra(input, clienteId, adminId)
      case 'recibir_compra_almacen':     return this.recibirCompra(input, clienteId, adminId)
      case 'finalizar_compra_inventario': return this.finalizarCompra(input, clienteId, adminId)
      default: return null
    }
  }

  // ── Implementaciones ──────────────────────────────────────────────────────

  private async consultarCompras(input: any, clienteId: string): Promise<any> {
    const filtros: any = {}
    if (input.estado) filtros.estado = input.estado

    const compras = await this.comprasService.listar(clienteId, filtros)
    const limite = input.limite || 10

    return {
      compras: compras.slice(0, limite).map((c: any) => ({
        nroCompra: c.nroCompra,
        tipo: c.tipoCompra,
        estado: c.estadoCompra,
        estadoPago: c.estadoPago,
        fecha: c.fecha,
        fechaEstimadaLlegada: c.fechaEstimadaLlegada || null,
        total: Number(c.total || 0),
        montoPagado: Number(c.montoPagado || 0),
        saldoPendiente: Number(c.total || 0) - Number(c.montoPagado || 0),
        observaciones: c.observaciones || '',
      })),
      total: Math.min(compras.length, limite),
    }
  }

  private async crearCompra(input: any, clienteId: string, adminId: string): Promise<any> {
    const hoy = new Date().toISOString().split('T')[0]
    const detalles: any[] = []

    for (const item of input.items) {
      const productos = await this.productoRepo.find({
        where: { clienteId, nombre: ILike(`%${item.nombre_producto}%`), estado: Status.ACTIVE } as any,
      })
      if (!productos.length) {
        return { error: `Producto no encontrado: "${item.nombre_producto}"` }
      }
      detalles.push({
        productoId: productos[0].id,
        cantidad: item.cantidad,
        precioUnitario: item.precio_unitario,
        descuento: 0,
        nroLote: item.nro_lote || null,
        fechaVencimiento: item.fecha_vencimiento || null,
      })
    }

    const dto: any = {
      sucursalId: input.sucursal_id,
      tipoCompra: input.tipo_compra,
      fecha: input.fecha || hoy,
      proveedorId: input.proveedor_id || null,
      nroFactura: input.nro_factura || null,
      fechaEstimadaLlegada: input.fecha_estimada_llegada || null,
      observaciones: input.observaciones || null,
      detalles,
    }

    const compra = await this.comprasService.crear(clienteId, dto, adminId)

    return {
      exito: true,
      nroCompra: (compra as any).nroCompra,
      estado: (compra as any).estadoCompra,
      total: Number((compra as any).total || 0),
      mensaje: `Compra ${(compra as any).nroCompra} creada. Estado: ${(compra as any).estadoCompra}.`,
    }
  }

  private async recibirCompra(input: any, clienteId: string, adminId: string): Promise<any> {
    const compras = await this.comprasService.listar(clienteId, { estado: 'EN_TRANSITO' })
    const compra = compras.find((c: any) => c.nroCompra === input.nro_compra)
    if (!compra) return { error: `Compra "${input.nro_compra}" no encontrada en estado EN_TRANSITO` }

    const hoy = new Date().toISOString().split('T')[0]
    const dto: any = {
      fechaRecepcion: hoy,
      condicionMercancia: input.condicion_mercancia || 'BUENA',
      observacionesRecepcion: input.observaciones || null,
    }

    await this.comprasService.marcarPendiente(clienteId, (compra as any).id, dto, adminId)

    return {
      exito: true,
      nroCompra: input.nro_compra,
      condicion: dto.condicionMercancia,
      mensaje: `Compra ${input.nro_compra} marcada como recibida. Ahora puedes finalizarla para cargar al inventario.`,
    }
  }

  private async finalizarCompra(input: any, clienteId: string, adminId: string): Promise<any> {
    const compras = await this.comprasService.listar(clienteId, { estado: 'PENDIENTE' })
    const compra = compras.find((c: any) => c.nroCompra === input.nro_compra)
    if (!compra) return { error: `Compra "${input.nro_compra}" no encontrada en estado PENDIENTE` }

    const detalle = await this.comprasService.obtener(clienteId, (compra as any).id)

    const dto: any = {
      observacionesFinalizacion: input.observaciones || null,
      detalles: (detalle.detalles || []).map((d: any) => ({
        id: d.id,
        nroLote: d.nroLote || null,
        fechaVencimiento: d.fechaVencimiento || null,
      })),
    }

    await this.comprasService.finalizar(clienteId, (compra as any).id, dto, adminId)

    return {
      exito: true,
      nroCompra: input.nro_compra,
      itemsInventariados: dto.detalles.length,
      mensaje: `Compra ${input.nro_compra} finalizada. ${dto.detalles.length} producto(s) cargado(s) al inventario.`,
    }
  }
}
