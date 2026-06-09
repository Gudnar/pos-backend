import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

export const TipoCompra = {
  INICIAL: 'INICIAL',
  COMPRA: 'COMPRA',
}

export const EstadoCompra = {
  EN_TRANSITO: 'EN_TRANSITO',   // order created, goods on the way
  PENDIENTE: 'PENDIENTE',        // goods arrived at warehouse, pending finalization
  FINALIZADO: 'FINALIZADO',      // lots created, stock updated
  ANULADA: 'ANULADA',
}

export const EstadoPagoCompra = {
  PENDIENTE: 'PENDIENTE',
  PARCIAL: 'PARCIAL',
  PAGADO: 'PAGADO',
}

export const CondicionMercancia = {
  BUENA: 'BUENA',
  DAÑADA: 'DAÑADA',
  PARCIAL: 'PARCIAL',
}

@Entity({ name: 'compra', schema: process.env.DB_SCHEMA || 'public' })
export class Compra extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'sucursal_id', type: 'uuid' })
  sucursalId: string

  @Column({ name: 'proveedor_id', type: 'uuid', nullable: true })
  proveedorId?: string

  @Column({ name: 'nro_compra', length: 30 })
  nroCompra: string

  @Column({ name: 'tipo_compra', length: 20, default: TipoCompra.COMPRA })
  tipoCompra: string

  @Column({ name: 'estado_compra', length: 20, default: EstadoCompra.EN_TRANSITO })
  estadoCompra: string

  @Column({ name: 'fecha', type: 'date' })
  fecha: string

  @Column({ name: 'nro_factura', length: 100, nullable: true })
  nroFactura?: string

  // ── Transit traceability ────────────────────────────────────────────────────

  @Column({ name: 'fecha_envio', type: 'date', nullable: true })
  fechaEnvio?: string

  @Column({ name: 'fecha_estimada_llegada', type: 'date', nullable: true })
  fechaEstimadaLlegada?: string

  @Column({ name: 'nro_guia_remision', length: 100, nullable: true })
  nroGuiaRemision?: string

  @Column({ name: 'transportista', length: 150, nullable: true })
  transportista?: string

  // ── Reception traceability (EN_TRANSITO → PENDIENTE) ───────────────────────

  @Column({ name: 'fecha_recepcion', type: 'date', nullable: true })
  fechaRecepcion?: string

  @Column({ name: 'usuario_recepcion', nullable: true })
  usuarioRecepcion?: string

  @Column({ name: 'condicion_mercancia', length: 20, nullable: true })
  condicionMercancia?: string

  @Column({ name: 'observaciones_recepcion', type: 'text', nullable: true })
  observacionesRecepcion?: string

  // ── Finalization traceability (PENDIENTE → FINALIZADO) ─────────────────────

  @Column({ name: 'fecha_finalizacion', type: 'date', nullable: true })
  fechaFinalizacion?: string

  @Column({ name: 'usuario_finalizacion', nullable: true })
  usuarioFinalizacion?: string

  @Column({ name: 'observaciones_finalizacion', type: 'text', nullable: true })
  observacionesFinalizacion?: string

  // ── Financials ──────────────────────────────────────────────────────────────

  @Column({ name: 'subtotal', type: 'decimal', precision: 14, scale: 2, default: 0 })
  subtotal: number

  @Column({ name: 'descuento', type: 'decimal', precision: 14, scale: 2, default: 0 })
  descuento: number

  @Column({ name: 'total', type: 'decimal', precision: 14, scale: 2, default: 0 })
  total: number

  @Column({ name: 'monto_pagado', type: 'decimal', precision: 14, scale: 2, default: 0 })
  montoPagado: number

  @Column({ name: 'estado_pago', length: 20, default: EstadoPagoCompra.PENDIENTE })
  estadoPago: string

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string

  constructor(data?: Partial<Compra>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
