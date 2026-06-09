import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'contacto_cliente', schema: process.env.DB_SCHEMA || 'public' })
export class ContactoCliente extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'empresa', length: 200, nullable: true })
  empresa?: string

  @Column({ name: 'grupo', length: 100, nullable: true })
  grupo?: string

  @Column({ name: 'direccion', length: 300, nullable: true })
  direccion?: string

  @Column({ name: 'web', length: 300, nullable: true })
  web?: string

  @Column({ name: 'notas', type: 'text', nullable: true })
  notas?: string

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<ContactoCliente>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
