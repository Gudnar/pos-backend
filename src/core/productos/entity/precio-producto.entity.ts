import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'precio_producto', schema: process.env.DB_SCHEMA || 'public' })
export class PrecioProducto extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'producto_id', type: 'uuid' })
  productoId: string

  @Column({ name: 'tipo', length: 30, default: 'VENTA' })
  tipo: string

  @Column({ name: 'precio', type: 'decimal', precision: 10, scale: 2 })
  precio: number

  @Column({ name: 'moneda', length: 10, default: 'BOB' })
  moneda: string

  @Column({ name: 'fecha_vigencia', type: 'date', nullable: true })
  fechaVigencia?: string

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin?: string

  @Column({ name: 'unidad_id', type: 'uuid', nullable: true })
  unidadId?: string

  @Column({ name: 'cantidad_min', type: 'int', default: 1 })
  cantidadMin: number

  @Column({ name: 'cantidad_max', type: 'int', nullable: true })
  cantidadMax?: number

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  @Column({ name: 'notas', type: 'text', nullable: true })
  notas?: string

  constructor(data?: Partial<PrecioProducto>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
