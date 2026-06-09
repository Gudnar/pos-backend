import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

export const TipoIngreso = {
  ADELANTO: 'ADELANTO',
  CAMBIO: 'CAMBIO',
  PAGO_SERVICIO: 'PAGO_SERVICIO',
  SUELDO: 'SUELDO',
}

export const CategoriaIngreso = {
  PERSONAL: 'PERSONAL',
  TRABAJO: 'TRABAJO',
}

export const EstadoIngreso = {
  DISPONIBLE: 'DISPONIBLE',
  PARCIAL: 'PARCIAL',
  UTILIZADO: 'UTILIZADO',
  ANULADO: 'ANULADO',
}

@Entity({ name: 'ingreso', schema: process.env.DB_SCHEMA || 'public' })
export class Ingreso extends AuditoriaEntity {
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

  @Column({ name: 'monto_disponible', type: 'decimal', precision: 14, scale: 2, default: 0 })
  montoDisponible: number

  @Column({ name: 'estado_ingreso', length: 20, default: EstadoIngreso.DISPONIBLE })
  estadoIngreso: string

  @Column({ name: 'fecha', type: 'date' })
  fecha: string

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string

  @Column({ name: 'referencia', length: 100, nullable: true })
  referencia?: string

  @Column({ name: 'contacto_cliente_id', type: 'uuid', nullable: true })
  contactoClienteId?: string

  @Column({ name: 'nombre_contacto', length: 200, nullable: true })
  nombreContacto?: string

  constructor(data?: Partial<Ingreso>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
