import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'logistica_pago_proveedor', schema: process.env.DB_SCHEMA || 'public' })
export class PagoProveedorImportacion extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'orden_importacion_id', type: 'uuid' })
  ordenImportacionId: string

  @Column({ name: 'moneda_id', type: 'uuid' })
  monedaId: string

  @Column({ name: 'monto', type: 'decimal', precision: 15, scale: 2 })
  monto: number

  @Column({ name: 'tipo_cambio', type: 'decimal', precision: 20, scale: 12 })
  tipoCambio: number

  // ── Conversión (directa o en dos pasos) ──
  @Column({ name: 'tc_paso1', type: 'decimal', precision: 20, scale: 10, nullable: true })
  tcPaso1?: number

  @Column({ name: 'tc_operacion', type: 'varchar', length: 12, nullable: true })
  tcOperacion?: string

  @Column({ name: 'moneda_intermedia_id', type: 'uuid', nullable: true })
  monedaIntermediaId?: string | null

  @Column({ name: 'monto_intermedio', type: 'decimal', precision: 18, scale: 2, nullable: true })
  montoIntermedio?: number | null

  @Column({ name: 'tc_paso2', type: 'decimal', precision: 20, scale: 10, nullable: true })
  tcPaso2?: number | null

  @Column({ name: 'tc_paso2_operacion', type: 'varchar', length: 12, nullable: true })
  tcPaso2Operacion?: string | null

  @Column({ name: 'monto_moneda_base', type: 'decimal', precision: 15, scale: 2, nullable: true })
  montoMonedaBase?: number

  @Column({ name: 'fecha_pago', type: 'date' })
  fechaPago: string

  @Column({ name: 'metodo_pago', length: 50, default: 'TRANSFERENCIA' })
  metodoPago: string

  @Column({ name: 'referencia', length: 200, nullable: true })
  referencia?: string

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string

  @Column({ name: 'fuente_id', type: 'uuid', nullable: true })
  fuenteId?: string | null

  constructor(data?: Partial<PagoProveedorImportacion>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
