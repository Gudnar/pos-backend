import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'logistica_orden_importacion', schema: process.env.DB_SCHEMA || 'public' })
export class OrdenImportacion extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'numero', length: 50 })
  numero: string

  @Column({ name: 'pais_origen', length: 100 })
  paisOrigen: string

  @Column({ name: 'proveedor_id', type: 'uuid', nullable: true })
  proveedorId?: string

  @Column({ name: 'moneda_compra_id', type: 'uuid', nullable: true })
  monedaCompraId?: string

  @Column({ name: 'fecha_orden', type: 'date' })
  fechaOrden: string

  @Column({ name: 'fecha_estimada_llegada', type: 'date', nullable: true })
  fechaEstimadaLlegada?: string

  @Column({ name: 'fecha_llegada_real', type: 'date', nullable: true })
  fechaLlegadaReal?: string

  @Column({ name: 'metodo_distribucion', length: 20, default: 'POR_VALOR' })
  metodoDistribucion: string

  @Column({ name: 'estado', length: 20, default: 'BORRADOR' })
  estadoOrden: string

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string

  @Column({ name: 'total_productos_moneda_compra', type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalProductosMonedaCompra?: number

  @Column({ name: 'total_productos_moneda_base', type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalProductosMonedaBase?: number

  @Column({ name: 'total_gastos_moneda_base', type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalGastosMonedaBase?: number

  @Column({ name: 'costo_total_moneda_base', type: 'decimal', precision: 15, scale: 2, nullable: true })
  costoTotalMonedaBase?: number

  @Column({ name: 'unidades_totales', type: 'int', nullable: true })
  unidadesTotales?: number

  @Column({ name: 'tasa_iva', type: 'decimal', precision: 5, scale: 4, nullable: true })
  tasaIva?: number

  constructor(data?: Partial<OrdenImportacion>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
