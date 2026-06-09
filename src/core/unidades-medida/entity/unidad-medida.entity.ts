import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'unidad_medida', schema: process.env.DB_SCHEMA || 'public' })
export class UnidadMedida extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'nombre', length: 100 })
  nombre: string

  @Column({ name: 'abreviacion', length: 20, nullable: true })
  abreviacion?: string

  @Column({ name: 'es_base', type: 'boolean', default: true })
  esBase: boolean

  @Column({ name: 'unidad_base_id', type: 'uuid', nullable: true })
  unidadBaseId?: string

  @Column({ name: 'factor_conversion', type: 'decimal', precision: 10, scale: 4, default: 1 })
  factorConversion: number

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<UnidadMedida>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
