import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'detalle_venta', schema: process.env.DB_SCHEMA || 'public' })
export class DetalleVenta extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'venta_id', type: 'uuid' })
  ventaId: string

  @Column({ name: 'producto_id', type: 'uuid' })
  productoId: string

  @Column({ name: 'lote_id', type: 'uuid', nullable: true })
  loteId?: string

  @Column({ name: 'nombre_producto', length: 200 })
  nombreProducto: string

  @Column({ name: 'cantidad', type: 'decimal', precision: 14, scale: 4 })
  cantidad: number

  @Column({ name: 'precio_unitario', type: 'decimal', precision: 14, scale: 4 })
  precioUnitario: number

  @Column({ name: 'descuento', type: 'decimal', precision: 14, scale: 4, default: 0 })
  descuento: number

  @Column({ name: 'subtotal', type: 'decimal', precision: 14, scale: 4 })
  subtotal: number

  constructor(data?: Partial<DetalleVenta>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
