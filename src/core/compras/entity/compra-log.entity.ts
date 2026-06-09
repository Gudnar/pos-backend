import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

export const TipoLog = {
  CREACION: 'CREACION',
  ESTADO:   'ESTADO',
  EDICION:  'EDICION',
  PAGO:     'PAGO',
}

@Entity({ name: 'compra_log', schema: process.env.DB_SCHEMA || 'public' })
export class CompraLog {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'compra_id', type: 'uuid' })
  compraId: string

  @Column({ name: 'tipo', length: 30 })
  tipo: string

  @Column({ name: 'estado_anterior', length: 30, nullable: true })
  estadoAnterior?: string

  @Column({ name: 'estado_nuevo', length: 30, nullable: true })
  estadoNuevo?: string

  @Column({ name: 'descripcion', type: 'text' })
  descripcion: string

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId?: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
