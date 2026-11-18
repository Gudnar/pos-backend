import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'venta_hoja_ruta', schema: process.env.DB_SCHEMA || 'public' })
@Index(['ventaId'])
export class VentaHojaRuta extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'venta_id', type: 'uuid' })
  ventaId: string

  @Column({ name: 'nro_hoja_ruta', type: 'int' })
  nroHojaRuta: number

  @Column({ name: 'empresa_transporte', length: 200, nullable: true })
  empresaTransporte?: string

  @Column({ name: 'conductor', length: 200, nullable: true })
  conductor?: string

  @Column({ name: 'conductor_ci', length: 30, nullable: true })
  conductorCi?: string

  @Column({ name: 'conductor_celular', length: 30, nullable: true })
  conductorCelular?: string

  @Column({ name: 'placa', length: 20, nullable: true })
  placa?: string

  @Column({ name: 'vehiculo', length: 150, nullable: true })
  vehiculo?: string

  @Column({ name: 'origen', length: 300, nullable: true })
  origen?: string

  @Column({ name: 'destino', length: 300, nullable: true })
  destino?: string

  @Column({ name: 'fecha_salida', type: 'date', nullable: true })
  fechaSalida?: string

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string

  constructor(data?: Partial<VentaHojaRuta>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
