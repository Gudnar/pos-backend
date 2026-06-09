import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'
import { MovimientoFuente } from './movimiento-fuente.entity'

export enum TipoFuente {
  CUENTA_BANCARIA = 'CUENTA_BANCARIA',
  CAJA = 'CAJA',
  BILLETERA_DIGITAL = 'BILLETERA_DIGITAL',
  OTRO = 'OTRO',
}

@Entity({ name: 'fuente', schema: process.env.DB_SCHEMA || 'public' })
export class Fuente extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'tipo', type: 'varchar', length: 30, default: TipoFuente.CUENTA_BANCARIA })
  tipo: string

  @Column({ name: 'banco', length: 100, nullable: true })
  banco?: string

  @Column({ name: 'numero_cuenta', length: 100, nullable: true })
  numeroCuenta?: string

  @Column({ name: 'moneda_id', type: 'uuid', nullable: true })
  monedaId?: string

  @Column({ name: 'titular', length: 200, nullable: true })
  titular?: string

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string

  @Column({ name: 'saldo_inicial', type: 'decimal', precision: 14, scale: 4, default: 0 })
  saldoInicial: number

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  @OneToMany(() => MovimientoFuente, m => m.fuente)
  movimientos?: MovimientoFuente[]

  constructor(data?: Partial<Fuente>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
