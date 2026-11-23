import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

// VENCIDA no se guarda: se deduce de valido_hasta en una cotización VIGENTE
export const EstadoCotizacion = {
  VIGENTE: 'VIGENTE',
  CONVERTIDA: 'CONVERTIDA',
  ANULADA: 'ANULADA',
}

/** Cotización: no mueve stock ni caja. Al convertirse queda vinculada a la venta que generó. */
@Entity({ name: 'cotizacion', schema: process.env.DB_SCHEMA || 'public' })
@Index(['clienteId', 'nroCotizacion'])
export class Cotizacion extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'sucursal_id', type: 'uuid' })
  sucursalId: string

  @Column({ name: 'usuario_id', type: 'bigint' })
  usuarioId: string

  @Column({ name: 'nro_cotizacion', length: 50 })
  nroCotizacion: string

  @Column({ name: 'fecha', type: 'date' })
  fecha: string

  @Column({ name: 'valido_hasta', type: 'date', nullable: true })
  validoHasta?: string

  @Column({ name: 'estado_cotizacion', length: 20, default: EstadoCotizacion.VIGENTE })
  estadoCotizacion: string

  @Column({ name: 'tipo_precio', length: 10, nullable: true })
  tipoPrecio?: string

  @Column({ name: 'contacto_cliente_id', type: 'uuid', nullable: true })
  contactoClienteId?: string

  @Column({ name: 'nombre_cliente', length: 200, nullable: true })
  nombreCliente?: string

  @Column({ name: 'nit_ci', length: 30, nullable: true })
  nitCi?: string

  @Column({ name: 'telefono_cliente', length: 60, nullable: true })
  telefonoCliente?: string

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string

  @Column({ name: 'total', type: 'decimal', precision: 14, scale: 2 })
  total: number

  // ── Conversión a venta ─────────────────────────────────────────────────────
  @Column({ name: 'venta_id', type: 'uuid', nullable: true })
  ventaId?: string | null

  @Column({ name: 'fecha_conversion', type: 'timestamp without time zone', nullable: true })
  fechaConversion?: Date | null

  constructor(data?: Partial<Cotizacion>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
