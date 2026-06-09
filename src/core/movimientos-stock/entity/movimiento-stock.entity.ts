import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

export const TipoMovimiento = {
  INGRESO:               'INGRESO',
  SALIDA:                'SALIDA',
  TRANSFERENCIA_SALIDA:  'TRANSFERENCIA_SALIDA',
  TRANSFERENCIA_ENTRADA: 'TRANSFERENCIA_ENTRADA',
  AJUSTE_POSITIVO:       'AJUSTE_POSITIVO',
  AJUSTE_NEGATIVO:       'AJUSTE_NEGATIVO',
  RETIRO:                'RETIRO',
  DEVOLUCION_PROVEEDOR:  'DEVOLUCION_PROVEEDOR',
  DEVOLUCION_CLIENTE:    'DEVOLUCION_CLIENTE',
}

@Entity({ name: 'movimiento_stock', schema: process.env.DB_SCHEMA || 'public' })
export class MovimientoStock extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'sucursal_id', type: 'uuid' })
  sucursalId: string

  @Column({ name: 'producto_id', type: 'uuid' })
  productoId: string

  @Column({ name: 'lote_id', type: 'uuid', nullable: true })
  loteId?: string

  @Column({ name: 'unidad_id', type: 'uuid', nullable: true })
  unidadId?: string

  @Column({ name: 'tipo', length: 30 })
  tipo: string

  @Column({ name: 'cantidad', type: 'decimal', precision: 14, scale: 4 })
  cantidad: number

  @Column({ name: 'cantidad_anterior', type: 'decimal', precision: 14, scale: 4 })
  cantidadAnterior: number

  @Column({ name: 'cantidad_posterior', type: 'decimal', precision: 14, scale: 4 })
  cantidadPosterior: number

  @Column({ name: 'sucursal_destino_id', type: 'uuid', nullable: true })
  sucursalDestinoId?: string

  @Column({ name: 'lote_destino_id', type: 'uuid', nullable: true })
  loteDestinoId?: string

  @Column({ name: 'referencia_documento', length: 100, nullable: true })
  referenciaDocumento?: string

  @Column({ name: 'tipo_documento', length: 50, nullable: true })
  tipoDocumento?: string

  @Column({ name: 'motivo', type: 'text', nullable: true })
  motivo?: string

  @Column({ name: 'usuario_id', type: 'bigint', nullable: true })
  usuarioId?: string

  constructor(data?: Partial<MovimientoStock>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
