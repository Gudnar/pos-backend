import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'caja', schema: process.env.DB_SCHEMA || 'public' })
export class Caja extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'sucursal_id', type: 'uuid' })
  sucursalId: string

  @Column({ name: 'nombre', length: 100 })
  nombre: string

  @Column({ name: 'descripcion', length: 200, nullable: true })
  descripcion?: string

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<Caja>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
