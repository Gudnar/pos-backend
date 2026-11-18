import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'venta_comision', schema: process.env.DB_SCHEMA || 'public' })
@Index(['ventaId'])
export class VentaComision extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'venta_id', type: 'uuid' })
  ventaId: string

  @Column({ name: 'contacto_cliente_id', type: 'uuid' })
  contactoClienteId: string

  @Column({ name: 'representante_id', type: 'uuid' })
  representanteId: string

  // Copia del beneficiario al momento del pago (el representante puede cambiar después)
  @Column({ name: 'beneficiario_nombre', length: 200 })
  beneficiarioNombre: string

  @Column({ name: 'beneficiario_cargo', length: 150, nullable: true })
  beneficiarioCargo?: string

  @Column({ name: 'monto', type: 'decimal', precision: 14, scale: 2 })
  monto: number

  @Column({ name: 'fuente_id', type: 'uuid' })
  fuenteId: string

  @Column({ name: 'fecha', type: 'date' })
  fecha: string

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string

  constructor(data?: Partial<VentaComision>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
