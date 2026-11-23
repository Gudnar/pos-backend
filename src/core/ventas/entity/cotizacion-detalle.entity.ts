import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'cotizacion_detalle', schema: process.env.DB_SCHEMA || 'public' })
@Index(['cotizacionId'])
export class CotizacionDetalle extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'cotizacion_id', type: 'uuid' })
  cotizacionId: string

  @Column({ name: 'producto_id', type: 'uuid' })
  productoId: string

  // Lote sugerido al cotizar; al convertir se vuelve a validar el stock
  @Column({ name: 'lote_id', type: 'uuid', nullable: true })
  loteId?: string

  @Column({ name: 'nombre_producto', length: 200 })
  nombreProducto: string

  @Column({ name: 'cantidad', type: 'decimal', precision: 14, scale: 4 })
  cantidad: number

  @Column({ name: 'precio_unitario', type: 'decimal', precision: 14, scale: 4 })
  precioUnitario: number

  @Column({ name: 'subtotal', type: 'decimal', precision: 14, scale: 2 })
  subtotal: number

  @Column({ name: 'orden', type: 'int', default: 0 })
  orden: number

  constructor(data?: Partial<CotizacionDetalle>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
