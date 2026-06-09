import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'subcategoria_producto', schema: process.env.DB_SCHEMA || 'public' })
export class SubcategoriaProducto extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'categoria_id', type: 'uuid' })
  categoriaId: string

  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<SubcategoriaProducto>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
