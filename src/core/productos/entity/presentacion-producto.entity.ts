import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'presentacion_producto', schema: process.env.DB_SCHEMA || 'public' })
export class PresentacionProducto extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'producto_id', type: 'uuid' })
  productoId: string

  @Column({ name: 'unidad_id', type: 'uuid' })
  unidadId: string

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<PresentacionProducto>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
