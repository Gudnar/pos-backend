import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'logistica_gasto', schema: process.env.DB_SCHEMA || 'public' })
export class GastoLogistica extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'orden_importacion_id', type: 'uuid' })
  ordenImportacionId: string

  @Column({ name: 'tipo_gasto_id', type: 'uuid', nullable: true })
  tipoGastoId?: string

  @Column({ name: 'descripcion', length: 300 })
  descripcion: string

  @Column({ name: 'moneda_id', type: 'uuid' })
  monedaId: string

  @Column({ name: 'monto', type: 'decimal', precision: 15, scale: 2 })
  monto: number

  @Column({ name: 'tipo_cambio', type: 'decimal', precision: 15, scale: 6 })
  tipoCambio: number

  @Column({ name: 'monto_moneda_base', type: 'decimal', precision: 15, scale: 2, nullable: true })
  montoMonedaBase?: number

  @Column({ name: 'fecha_gasto', type: 'date' })
  fechaGasto: string

  @Column({ name: 'pais', length: 100, nullable: true })
  pais?: string

  @Column({ name: 'comprobante', length: 200, nullable: true })
  comprobante?: string

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string

  @Column({ name: 'fuente_id', type: 'uuid', nullable: true })
  fuenteId?: string

  constructor(data?: Partial<GastoLogistica>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
