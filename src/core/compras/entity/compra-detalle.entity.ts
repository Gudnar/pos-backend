import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'compra_detalle', schema: process.env.DB_SCHEMA || 'public' })
export class CompraDetalle extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'compra_id', type: 'uuid' })
  compraId: string

  @Column({ name: 'producto_id', type: 'uuid' })
  productoId: string

  @Column({ name: 'unidad_id', type: 'uuid', nullable: true })
  unidadId?: string

  @Column({ name: 'cantidad', type: 'decimal', precision: 14, scale: 4 })
  cantidad: number

  @Column({ name: 'precio_unitario', type: 'decimal', precision: 14, scale: 2, default: 0 })
  precioUnitario: number

  @Column({ name: 'descuento', type: 'decimal', precision: 14, scale: 2, default: 0 })
  descuento: number

  @Column({ name: 'subtotal', type: 'decimal', precision: 14, scale: 2, default: 0 })
  subtotal: number

  @Column({ name: 'total_compra', type: 'decimal', precision: 14, scale: 4, nullable: true })
  totalCompra?: number

  @Column({ name: 'moneda', length: 10, nullable: true, default: 'BOB' })
  moneda?: string

  @Column({ name: 'nro_lote', length: 100, nullable: true })
  nroLote?: string

  @Column({ name: 'fecha_vencimiento', type: 'date', nullable: true })
  fechaVencimiento?: string

  @Column({ name: 'lote_id', type: 'uuid', nullable: true })
  loteId?: string

  constructor(data?: Partial<CompraDetalle>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
