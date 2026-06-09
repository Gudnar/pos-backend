import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'campana', schema: process.env.DB_SCHEMA || 'public' })
export class Campana extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'canal', length: 50 })
  canal: string

  @Column({ name: 'origen', length: 500, nullable: true })
  origen?: string

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string

  @Column({ name: 'agente_id', type: 'bigint' })
  agenteId: string

  @Column({ name: 'activa', type: 'boolean', default: true })
  activa: boolean

  constructor(data?: Partial<Campana>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
