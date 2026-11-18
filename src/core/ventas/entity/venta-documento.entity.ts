import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

export const TipoDocumentoVenta = {
  TABLILLA_PESAJE: 'TABLILLA_PESAJE',
  RECIBO: 'RECIBO',
  OTROS: 'OTROS',
}

export const TIPOS_DOCUMENTO_VENTA = Object.values(TipoDocumentoVenta)

@Entity({ name: 'venta_documento', schema: process.env.DB_SCHEMA || 'public' })
@Index(['ventaId', 'tipo'])
export class VentaDocumento extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'venta_id', type: 'uuid' })
  ventaId: string

  @Column({ name: 'tipo', length: 30 })
  tipo: string

  @Column({ name: 'nombre_original', length: 255 })
  nombreOriginal: string

  @Column({ name: 'mime_type', length: 100 })
  mimeType: string

  @Column({ name: 'tamano', type: 'int' })
  tamano: number

  @Column({ name: 'ruta_archivo', length: 500, select: false })
  rutaArchivo: string

  constructor(data?: Partial<VentaDocumento>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
