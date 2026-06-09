import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'usuario_sucursal', schema: process.env.DB_SCHEMA || 'public' })
export class UsuarioSucursal extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'usuario_id', type: 'bigint' })
  usuarioId: string

  @Column({ name: 'sucursal_id', type: 'uuid' })
  sucursalId: string

  constructor(data?: Partial<UsuarioSucursal>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
