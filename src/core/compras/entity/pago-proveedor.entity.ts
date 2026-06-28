import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

export const MetodoPagoProveedor = {
  EFECTIVO: 'EFECTIVO',
  TRANSFERENCIA: 'TRANSFERENCIA',
  CHEQUE: 'CHEQUE',
  QR: 'QR',
  TARJETA: 'TARJETA',
}

@Entity({ name: 'pago_proveedor', schema: process.env.DB_SCHEMA || 'public' })
export class PagoProveedor extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'compra_id', type: 'uuid' })
  compraId: string

  @Column({ name: 'proveedor_id', type: 'uuid', nullable: true })
  proveedorId?: string

  @Column({ name: 'fecha', type: 'date' })
  fecha: string

  @Column({ name: 'monto', type: 'decimal', precision: 14, scale: 2 })
  monto: number

  @Column({ name: 'metodo_pago', length: 20, default: MetodoPagoProveedor.EFECTIVO })
  metodoPago: string

  @Column({ name: 'referencia', length: 200, nullable: true })
  referencia?: string

  @Column({ name: 'notas', type: 'text', nullable: true })
  notas?: string

  @Column({ name: 'moneda_id', type: 'uuid', nullable: true })
  monedaId?: string

  @Column({ name: 'tipo_cambio', type: 'decimal', precision: 14, scale: 6, default: 1 })
  tipoCambio: number

  @Column({ name: 'monto_en_bs', type: 'decimal', precision: 14, scale: 2, nullable: true })
  montoEnBs?: number

  @Column({ name: 'fuente_id', type: 'uuid', nullable: true })
  fuenteId?: string

  @Column({ name: 'movimiento_fuente_id', type: 'uuid', nullable: true })
  movimientoFuenteId?: string

  constructor(data?: Partial<PagoProveedor>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
