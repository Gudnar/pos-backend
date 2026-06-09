import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'categoria_producto', schema: process.env.DB_SCHEMA || 'public' })
export class CategoriaProducto extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string

  @Column({ name: 'color', length: 20, nullable: true, default: '#6366f1' })
  color?: string

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<CategoriaProducto>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
