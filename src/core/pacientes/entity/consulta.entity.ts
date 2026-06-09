import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'consulta', schema: process.env.DB_SCHEMA || 'public' })
export class Consulta extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'paciente_id', type: 'uuid' })
  pacienteId: string

  @Column({ name: 'cita_id', type: 'uuid', nullable: true })
  citaId?: string

  @Column({ name: 'fecha', length: 10 })
  fecha: string

  @Column({ name: 'servicio', length: 200, nullable: true })
  servicio?: string

  @Column({ name: 'diagnostico', type: 'text' })
  diagnostico: string

  @Column({ name: 'tratamiento', type: 'text', nullable: true })
  tratamiento?: string

  @Column({ name: 'medicamentos', type: 'text', nullable: true })
  medicamentos?: string

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string

  @Column({ name: 'proxima_cita', length: 10, nullable: true })
  proximaCita?: string

  constructor(data?: Partial<Consulta>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
