import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'representante', schema: process.env.DB_SCHEMA || 'public' })
export class Representante extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  /** 'PROVEEDOR' | 'CLIENTE' */
  @Column({ name: 'tipo', length: 20 })
  tipo: string

  @Column({ name: 'entidad_id', type: 'uuid' })
  entidadId: string

  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'cargo', length: 150, nullable: true })
  cargo?: string

  @Column({ name: 'telefono', length: 30, nullable: true })
  telefono?: string

  @Column({ name: 'email', length: 150, nullable: true })
  email?: string

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  @Column({ name: 'fecha_inicio', length: 10, nullable: true })
  fechaInicio?: string

  @Column({ name: 'fecha_fin', length: 10, nullable: true })
  fechaFin?: string

  @Column({ name: 'motivo_cambio', type: 'text', nullable: true })
  motivoCambio?: string

  @Column({ name: 'notas', type: 'text', nullable: true })
  notas?: string

  constructor(data?: Partial<Representante>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
