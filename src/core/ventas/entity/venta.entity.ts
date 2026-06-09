import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

export const EstadoVenta = {
  PENDIENTE: 'PENDIENTE',
  PAGADA: 'PAGADA',
  ANULADA: 'ANULADA',
}

export const MetodoPago = {
  EFECTIVO: 'EFECTIVO',
  TARJETA: 'TARJETA',
  QR: 'QR',
  TRANSFERENCIA: 'TRANSFERENCIA',
  CREDITO: 'CREDITO',
  ADELANTO: 'ADELANTO',
  MIXTO: 'MIXTO',
}

@Entity({ name: 'venta', schema: process.env.DB_SCHEMA || 'public' })
export class Venta extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'sucursal_id', type: 'uuid' })
  sucursalId: string

  @Column({ name: 'caja_id', type: 'uuid', nullable: true })
  cajaId?: string

  @Column({ name: 'caja_sesion_id', type: 'uuid', nullable: true })
  cajaSesionId?: string

  @Column({ name: 'usuario_id', type: 'bigint' })
  usuarioId: string

  @Column({ name: 'nro_venta', length: 50 })
  nroVenta: string

  @Column({ name: 'fecha', type: 'date' })
  fecha: string

  @Column({ name: 'estado_venta', length: 20, default: EstadoVenta.PAGADA })
  estadoVenta: string

  @Column({ name: 'metodo_pago', length: 20, nullable: true })
  metodoPago?: string

  @Column({ name: 'subtotal', type: 'decimal', precision: 14, scale: 2, default: 0 })
  subtotal: number

  @Column({ name: 'descuento', type: 'decimal', precision: 14, scale: 2, default: 0 })
  descuento: number

  @Column({ name: 'impuesto', type: 'decimal', precision: 14, scale: 2, default: 0 })
  impuesto: number

  @Column({ name: 'total', type: 'decimal', precision: 14, scale: 2 })
  total: number

  @Column({ name: 'monto_pagado', type: 'decimal', precision: 14, scale: 2, nullable: true })
  montoPagado?: number

  @Column({ name: 'cambio', type: 'decimal', precision: 14, scale: 2, nullable: true })
  cambio?: number

  @Column({ name: 'contacto_cliente_id', type: 'uuid', nullable: true })
  contactoClienteId?: string

  @Column({ name: 'nombre_cliente', length: 200, nullable: true })
  nombreCliente?: string

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string

  @Column({ name: 'adelanto_id', type: 'uuid', nullable: true })
  adelantoId?: string

  @Column({ name: 'monto_adelanto', type: 'decimal', precision: 14, scale: 2, nullable: true })
  montoAdelanto?: number

  constructor(data?: Partial<Venta>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
