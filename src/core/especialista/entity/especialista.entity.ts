import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'especialista', schema: process.env.DB_SCHEMA || 'public' })
export class Especialista extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'especialidades', type: 'jsonb', default: [] })
  especialidades: string[]

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string

  @Column({ name: 'foto', length: 500, nullable: true })
  foto?: string

  @Column({ name: 'horarios', type: 'jsonb', default: [] })
  horarios: Array<{ dia: string; franjas: Array<{ inicio: string; fin: string }> }>

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<Especialista>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
