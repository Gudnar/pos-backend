import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'logistica_pais', schema: process.env.DB_SCHEMA || 'public' })
export class PaisLogistica extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'nombre', length: 150 })
  nombre: string

  @Column({ name: 'codigo', length: 5, nullable: true })
  codigo?: string

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<PaisLogistica>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
