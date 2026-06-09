import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

export const EstadoLote = {
  ACTIVO:     'ACTIVO',
  AGOTADO:    'AGOTADO',
  VENCIDO:    'VENCIDO',
  CUARENTENA: 'CUARENTENA',
  RETIRADO:   'RETIRADO',
}

@Entity({ name: 'lote', schema: process.env.DB_SCHEMA || 'public' })
export class Lote extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'sucursal_id', type: 'uuid' })
  sucursalId: string

  @Column({ name: 'producto_id', type: 'uuid' })
  productoId: string

  // ── Identificación ────────────────────────────────
  @Column({ name: 'nro_lote', length: 100, nullable: true })
  nroLote?: string

  @Column({ name: 'nro_serie', length: 100, nullable: true })
  nroSerie?: string

  @Column({ name: 'lote_interno', length: 50, nullable: true })
  loteInterno?: string

  // ── Fechas ────────────────────────────────────────
  @Column({ name: 'fecha_fabricacion', type: 'date', nullable: true })
  fechaFabricacion?: string

  @Column({ name: 'fecha_vencimiento', type: 'date', nullable: true })
  fechaVencimiento?: string

  @Column({ name: 'fecha_ingreso', type: 'date' })
  fechaIngreso: string

  @Column({ name: 'fecha_vencimiento_garantia', type: 'date', nullable: true })
  fechaVencimientoGarantia?: string

  // ── Origen ────────────────────────────────────────
  @Column({ name: 'proveedor_id', type: 'uuid', nullable: true })
  proveedorId?: string

  @Column({ name: 'nro_factura_proveedor', length: 100, nullable: true })
  nroFacturaProveedor?: string

  @Column({ name: 'nro_pedido_compra', length: 100, nullable: true })
  nroPedidoCompra?: string

  @Column({ name: 'nro_remision', length: 100, nullable: true })
  nroRemision?: string

  @Column({ name: 'pais_origen', length: 100, nullable: true })
  paisOrigen?: string

  @Column({ name: 'certificado_calidad', length: 200, nullable: true })
  certificadoCalidad?: string

  // ── Cantidades ────────────────────────────────────
  @Column({ name: 'cantidad_inicial', type: 'decimal', precision: 14, scale: 4 })
  cantidadInicial: number

  @Column({ name: 'cantidad_actual', type: 'decimal', precision: 14, scale: 4 })
  cantidadActual: number

  @Column({ name: 'unidad_id', type: 'uuid', nullable: true })
  unidadId?: string

  // ── Control ───────────────────────────────────────
  @Column({ name: 'estado_lote', length: 20, default: EstadoLote.ACTIVO })
  estadoLote: string

  @Column({ name: 'motivo_cuarentena', type: 'text', nullable: true })
  motivoCuarentena?: string

  @Column({ name: 'notas', type: 'text', nullable: true })
  notas?: string

  constructor(data?: Partial<Lote>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
