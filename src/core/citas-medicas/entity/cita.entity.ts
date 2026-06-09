import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'cita', schema: process.env.DB_SCHEMA || 'public' })
export class Cita extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'fecha', length: 10 })
  fecha: string

  @Column({ name: 'hora_inicio', length: 5 })
  horaInicio: string

  @Column({ name: 'hora_fin', length: 5 })
  horaFin: string

  @Column({ name: 'servicio', length: 200 })
  servicio: string

  @Column({ name: 'paciente_nombre', length: 200 })
  pacienteNombre: string

  @Column({ name: 'paciente_telefono', length: 30 })
  pacienteTelefono: string

  @Column({ name: 'paciente_email', length: 150, nullable: true })
  pacienteEmail?: string

  @Column({ name: 'notas', type: 'text', nullable: true })
  notas?: string

  @Column({ name: 'estado_cita', length: 20, default: 'PENDIENTE' })
  estadoCita: string

  @Column({ name: 'origen_registro', length: 20, default: 'STAFF' })
  origenRegistro: string

  @Column({ name: 'agente_id', type: 'bigint', nullable: true })
  agenteId?: string

  @Column({ name: 'especialista_id', type: 'bigint', nullable: true })
  especialistaId?: string

  @Column({ name: 'especialista_nombre', length: 200, nullable: true })
  especialistaNombre?: string

  constructor(data?: Partial<Cita>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
