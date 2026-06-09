import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'precio_promocional', schema: process.env.DB_SCHEMA || 'public' })
export class PrecioPromocional extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'producto_id', type: 'uuid' })
  productoId: string

  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'precio', type: 'decimal', precision: 10, scale: 2 })
  precio: number

  @Column({ name: 'moneda', length: 10, default: 'BOB' })
  moneda: string

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fechaInicio?: string

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin?: string

  @Column({ name: 'habilitado', type: 'boolean', default: true })
  habilitado: boolean

  @Column({ name: 'notas', type: 'text', nullable: true })
  notas?: string

  constructor(data?: Partial<PrecioPromocional>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
