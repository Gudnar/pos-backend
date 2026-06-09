import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

export const TipoGasto = {
  ALIMENTACION: 'ALIMENTACION',
  TRANSPORTE: 'TRANSPORTE',
  SERVICIOS: 'SERVICIOS',
  MANTENIMIENTO: 'MANTENIMIENTO',
  OTROS: 'OTROS',
}

export const CategoriaGasto = {
  PERSONAL: 'PERSONAL',
  TRABAJO: 'TRABAJO',
}

@Entity({ name: 'gasto', schema: process.env.DB_SCHEMA || 'public' })
export class Gasto extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'sucursal_id', type: 'uuid', nullable: true })
  sucursalId?: string

  @Column({ name: 'tipo', length: 20 })
  tipo: string

  @Column({ name: 'categoria', length: 20 })
  categoria: string

  @Column({ name: 'monto', type: 'decimal', precision: 14, scale: 2 })
  monto: number

  @Column({ name: 'fecha', type: 'date' })
  fecha: string

  @Column({ name: 'descripcion', type: 'text' })
  descripcion: string

  @Column({ name: 'referencia', length: 100, nullable: true })
  referencia?: string

  constructor(data?: Partial<Gasto>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
