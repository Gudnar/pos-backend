import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'
import { Fuente } from './fuente.entity'

export enum TipoMovimiento {
  INGRESO = 'INGRESO',
  EGRESO = 'EGRESO',
  TRANSFERENCIA_SALIDA = 'TRANSFERENCIA_SALIDA',
  TRANSFERENCIA_ENTRADA = 'TRANSFERENCIA_ENTRADA',
}

export enum CategoriaMovimiento {
  PAGO_PROVEEDOR = 'PAGO_PROVEEDOR',
  GASTO_LOGISTICA = 'GASTO_LOGISTICA',
  INGRESO_VENTA = 'INGRESO_VENTA',
  RETIRO = 'RETIRO',
  DEPOSITO = 'DEPOSITO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  OTRO = 'OTRO',
}

@Entity({ name: 'movimiento_fuente', schema: process.env.DB_SCHEMA || 'public' })
export class MovimientoFuente extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'fuente_id', type: 'uuid' })
  fuenteId: string

  @ManyToOne(() => Fuente, f => f.movimientos)
  @JoinColumn({ name: 'fuente_id' })
  fuente?: Fuente

  @Column({ name: 'tipo', type: 'varchar', length: 30 })
  tipo: string

  @Column({ name: 'concepto', length: 500 })
  concepto: string

  @Column({ name: 'referencia', length: 200, nullable: true })
  referencia?: string

  @Column({ name: 'moneda_id', type: 'uuid', nullable: true })
  monedaId?: string

  @Column({ name: 'monto', type: 'decimal', precision: 14, scale: 4 })
  monto: number

  @Column({ name: 'tipo_cambio', type: 'decimal', precision: 14, scale: 6, default: 1 })
  tipoCambio: number

  @Column({ name: 'monto_nativo', type: 'decimal', precision: 14, scale: 4 })
  montoNativo: number

  @Column({ name: 'fecha', type: 'date' })
  fecha: string

  @Column({ name: 'categoria', type: 'varchar', length: 50, nullable: true })
  categoria?: string

  @Column({ name: 'origen_tipo', type: 'varchar', length: 100, nullable: true })
  origenTipo?: string

  @Column({ name: 'origen_id', type: 'uuid', nullable: true })
  origenId?: string

  @Column({ name: 'fuente_destino_id', type: 'uuid', nullable: true })
  fuenteDestinoId?: string

  constructor(data?: Partial<MovimientoFuente>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
