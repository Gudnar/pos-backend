import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'sucursal', schema: process.env.DB_SCHEMA || 'public' })
export class Sucursal extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'codigo', length: 20, nullable: true })
  codigo?: string

  @Column({ name: 'direccion', length: 300, nullable: true })
  direccion?: string

  @Column({ name: 'ciudad', length: 100, nullable: true })
  ciudad?: string

  @Column({ name: 'telefono', length: 50, nullable: true })
  telefono?: string

  @Column({ name: 'email', length: 150, nullable: true })
  email?: string

  @Column({ name: 'es_principal', type: 'boolean', default: false })
  esPrincipal: boolean

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<Sucursal>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
