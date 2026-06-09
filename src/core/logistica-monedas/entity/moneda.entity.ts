import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'logistica_moneda', schema: process.env.DB_SCHEMA || 'public' })
export class Moneda extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'codigo', length: 10 })
  codigo: string

  @Column({ name: 'nombre', length: 100 })
  nombre: string

  @Column({ name: 'simbolo', length: 5 })
  simbolo: string

  @Column({ name: 'es_moneda_base', type: 'boolean', default: false })
  esMonedaBase: boolean

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<Moneda>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
