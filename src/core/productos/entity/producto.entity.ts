import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'producto', schema: process.env.DB_SCHEMA || 'public' })
export class Producto extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'subcategoria_id', type: 'uuid' })
  subcategoriaId: string

  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string

  @Column({ name: 'codigo_proveedor', length: 100, nullable: true })
  codigoProveedor?: string

  @Column({ name: 'codigo_barras', length: 100, nullable: true })
  codigoBarras?: string

  @Column({ name: 'codigo_tienda', length: 100, nullable: true })
  codigoTienda?: string

  @Column({ name: 'unidad_medida', length: 50, nullable: true, default: 'UNIDAD' })
  unidadMedida?: string

  @Column({ name: 'unidad_base_id', type: 'uuid', nullable: true })
  unidadBaseId?: string

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  @Column({ name: 'requiere_lote', type: 'boolean', default: false })
  requiereLote: boolean

  @Column({ name: 'metodo_picking', length: 10, default: 'FEFO' })
  metodoPicking: string

  @Column({ name: 'alerta_vencimiento_dias', type: 'int', default: 30 })
  alertaVencimientoDias: number

  @Column({ name: 'porcentaje_factura', type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentajeFactura?: number

  constructor(data?: Partial<Producto>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
