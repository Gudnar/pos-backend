import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'paciente', schema: process.env.DB_SCHEMA || 'public' })
export class Paciente extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  // Datos básicos
  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'telefono', length: 30 })
  telefono: string

  @Column({ name: 'email', length: 150, nullable: true })
  email?: string

  // Datos personales extendidos
  @Column({ name: 'ci', length: 30, nullable: true })
  ci?: string

  @Column({ name: 'fecha_nacimiento', length: 10, nullable: true })
  fechaNacimiento?: string

  @Column({ name: 'genero', length: 1, nullable: true })
  genero?: string

  @Column({ name: 'grupo_sanguineo', length: 5, nullable: true })
  grupoSanguineo?: string

  @Column({ name: 'direccion', length: 300, nullable: true })
  direccion?: string

  // Antecedentes médicos
  @Column({ name: 'alergias', type: 'text', nullable: true })
  alergias?: string

  @Column({ name: 'enfermedades_cronicas', type: 'text', nullable: true })
  enfermedadesCronicas?: string

  @Column({ name: 'cirugias_previas', type: 'text', nullable: true })
  cirugiasPrevias?: string

  @Column({ name: 'medicamentos_actuales', type: 'text', nullable: true })
  medicamentosActuales?: string

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string

  // Contacto de emergencia
  @Column({ name: 'contacto_emergencia_nombre', length: 200, nullable: true })
  contactoEmergenciaNombre?: string

  @Column({ name: 'contacto_emergencia_telefono', length: 30, nullable: true })
  contactoEmergenciaTelefono?: string

  @Column({ name: 'origen_registro', length: 20, default: 'STAFF' })
  origenRegistro: string

  constructor(data?: Partial<Paciente>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
