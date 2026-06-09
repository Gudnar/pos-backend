import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

export const EstadoSesion = {
  ABIERTA: 'ABIERTA',
  CERRADA: 'CERRADA',
}

@Entity({ name: 'caja_sesion', schema: process.env.DB_SCHEMA || 'public' })
export class CajaSesion extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'caja_id', type: 'uuid' })
  cajaId: string

  @Column({ name: 'sucursal_id', type: 'uuid' })
  sucursalId: string

  @Column({ name: 'usuario_id', type: 'bigint' })
  usuarioId: string

  @Column({ name: 'estado_sesion', length: 20, default: EstadoSesion.ABIERTA })
  estadoSesion: string

  @Column({ name: 'monto_inicial', type: 'decimal', precision: 14, scale: 2, default: 0 })
  montoInicial: number

  @Column({ name: 'monto_final', type: 'decimal', precision: 14, scale: 2, nullable: true })
  montoFinal?: number

  @Column({ name: 'total_ventas', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalVentas: number

  @Column({ name: 'nro_ventas', type: 'int', default: 0 })
  nroVentas: number

  @Column({ name: 'fecha_apertura', type: 'timestamp without time zone' })
  fechaApertura: Date

  @Column({ name: 'fecha_cierre', type: 'timestamp without time zone', nullable: true })
  fechaCierre?: Date

  @Column({ name: 'nombre_usuario', length: 200, nullable: true })
  nombreUsuario?: string

  @Column({ name: 'diferencia', type: 'decimal', precision: 14, scale: 2, nullable: true })
  diferencia?: number

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string

  constructor(data?: Partial<CajaSesion>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
