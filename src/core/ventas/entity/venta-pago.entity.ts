import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

export const OrigenPagoVenta = {
  POS: 'POS',     // cobrado al registrar la venta
  ABONO: 'ABONO', // pago posterior desde el historial (entra a una fuente de fondos)
}

@Entity({ name: 'venta_pago', schema: process.env.DB_SCHEMA || 'public' })
@Index(['ventaId'])
export class VentaPago extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'venta_id', type: 'uuid' })
  ventaId: string

  @Column({ name: 'origen', length: 10 })
  origen: string

  @Column({ name: 'fecha', type: 'date' })
  fecha: string

  @Column({ name: 'metodo_pago', length: 20 })
  metodoPago: string

  @Column({ name: 'monto', type: 'decimal', precision: 14, scale: 2 })
  monto: number

  @Column({ name: 'referencia', length: 200, nullable: true })
  referencia?: string

  @Column({ name: 'fuente_id', type: 'uuid', nullable: true })
  fuenteId?: string

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string

  // ── Comprobante del pago (un archivo) ──────────────────────────────────────
  @Column({ name: 'comprobante_nombre', length: 255, nullable: true })
  comprobanteNombre?: string

  @Column({ name: 'comprobante_mime', length: 100, nullable: true })
  comprobanteMime?: string

  @Column({ name: 'comprobante_tamano', type: 'int', nullable: true })
  comprobanteTamano?: number

  @Column({ name: 'comprobante_ruta', length: 500, nullable: true, select: false })
  comprobanteRuta?: string

  constructor(data?: Partial<VentaPago>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
