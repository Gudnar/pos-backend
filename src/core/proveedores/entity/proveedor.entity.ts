import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'proveedor', schema: process.env.DB_SCHEMA || 'public' })
export class Proveedor extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'empresa', length: 200, nullable: true })
  empresa?: string

  @Column({ name: 'nit', length: 50, nullable: true })
  nit?: string

  @Column({ name: 'categoria', length: 100, nullable: true })
  categoria?: string

  @Column({ name: 'direccion', length: 300, nullable: true })
  direccion?: string

  @Column({ name: 'notas', type: 'text', nullable: true })
  notas?: string

  @Column({ name: 'color', length: 20, nullable: true, default: '#6366f1' })
  color?: string

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<Proveedor>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
