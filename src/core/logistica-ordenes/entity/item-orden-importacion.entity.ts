import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'logistica_item_orden', schema: process.env.DB_SCHEMA || 'public' })
export class ItemOrdenImportacion extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'orden_importacion_id', type: 'uuid' })
  ordenImportacionId: string

  @Column({ name: 'producto_id', type: 'uuid', nullable: true })
  productoId?: string

  @Column({ name: 'descripcion_producto', length: 300 })
  descripcionProducto: string

  @Column({ name: 'cantidad_unidades', type: 'int' })
  cantidadUnidades: number

  @Column({ name: 'precio_unitario_moneda_compra', type: 'decimal', precision: 20, scale: 10 })
  precioUnitarioMonedaCompra: number

  @Column({ name: 'tipo_cambio', type: 'decimal', precision: 20, scale: 12 })
  tipoCambio: number

  // ── Conversión (directa o en dos pasos); tipo_cambio queda como TC efectivo moneda compra → base ──
  @Column({ name: 'tc_paso1', type: 'decimal', precision: 20, scale: 10, nullable: true })
  tcPaso1?: number | null

  @Column({ name: 'tc_operacion', type: 'varchar', length: 12, nullable: true })
  tcOperacion?: string | null

  @Column({ name: 'moneda_intermedia_id', type: 'uuid', nullable: true })
  monedaIntermediaId?: string | null

  @Column({ name: 'monto_intermedio', type: 'decimal', precision: 18, scale: 2, nullable: true })
  montoIntermedio?: number | null

  @Column({ name: 'tc_paso2', type: 'decimal', precision: 20, scale: 10, nullable: true })
  tcPaso2?: number | null

  @Column({ name: 'tc_paso2_operacion', type: 'varchar', length: 12, nullable: true })
  tcPaso2Operacion?: string | null

  @Column({ name: 'moneda_compra_id', type: 'uuid', nullable: true })
  monedaCompraId?: string

  @Column({ name: 'precio_unitario_moneda_base', type: 'decimal', precision: 20, scale: 10, nullable: true })
  precioUnitarioMonedaBase?: number

  @Column({ name: 'subtotal_moneda_compra', type: 'decimal', precision: 15, scale: 2, nullable: true })
  subtotalMonedaCompra?: number

  @Column({ name: 'subtotal_moneda_base', type: 'decimal', precision: 15, scale: 2, nullable: true })
  subtotalMonedaBase?: number

  @Column({ name: 'costo_logistica_asignado', type: 'decimal', precision: 15, scale: 4, nullable: true })
  costoLogisticaAsignado?: number

  @Column({ name: 'costo_total_unitario', type: 'decimal', precision: 15, scale: 4, nullable: true })
  costoTotalUnitario?: number

  @Column({ name: 'margen_aplicado', type: 'decimal', precision: 5, scale: 2, nullable: true })
  margenAplicado?: number

  @Column({ name: 'precio_venta_sugerido', type: 'decimal', precision: 15, scale: 4, nullable: true })
  precioVentaSugerido?: number

  @Column({ name: 'precio_venta_manual', type: 'decimal', precision: 15, scale: 4, nullable: true })
  precioVentaManual?: number

  @Column({ name: 'precio_venta_con_iva', type: 'decimal', precision: 15, scale: 4, nullable: true })
  precioVentaConIva?: number

  @Column({ name: 'utilidad_tonelada', type: 'decimal', precision: 15, scale: 2, nullable: true })
  utilidadTonelada?: number

  @Column({ name: 'utilidad_tonelada_con_iva', type: 'decimal', precision: 15, scale: 2, nullable: true })
  utilidadToneladaConIva?: number

  constructor(data?: Partial<ItemOrdenImportacion>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
