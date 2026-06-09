import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Cliente } from '../../cliente/entity/cliente.entity'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'conversacion', schema: process.env.DB_SCHEMA || 'public' })
export class Conversacion extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'agente_id', type: 'bigint' })
  agenteId: string

  @Column({ name: 'contacto', length: 200 })
  contacto: string

  @Column({ name: 'canal', length: 30, default: 'chat' })
  canal: string

  @Column({ name: 'estado_conversacion', length: 30, default: 'abierto' })
  estadoConversacion: string

  @Column({ name: 'score', type: 'int', default: 0 })
  score: number

  @Column({ name: 'mensajes', type: 'jsonb', default: '[]' })
  mensajes: Array<{ role: string; content: string; timestamp: string }>

  @Column({ name: 'total_mensajes', type: 'int', default: 0 })
  totalMensajes: number

  @Column({ name: 'escalado', type: 'boolean', default: false })
  escalado: boolean

  @Column({ name: 'etiquetas', type: 'jsonb', default: '[]' })
  etiquetas: string[]

  @Column({ name: 'notas', type: 'text', nullable: true })
  notas?: string

  @Column({ name: 'resolucion', length: 500, nullable: true })
  resolucion?: string

  // ── Calificación IA ──────────────────────────────────────────
  @Column({ name: 'intencion', length: 30, nullable: true })
  intencion?: string  // RESERVAR | INFORMAR | CANCELAR | QUEJAR | OTRO

  @Column({ name: 'urgencia', length: 20, nullable: true })
  urgencia?: string  // INMEDIATA | ESTA_SEMANA | SIN_URGENCIA

  @Column({ name: 'sentimiento', length: 20, nullable: true })
  sentimiento?: string  // POSITIVO | NEUTRAL | NEGATIVO | FRUSTRADO

  @Column({ name: 'servicio_detectado', length: 200, nullable: true })
  servicioDetectado?: string

  @Column({ name: 'etapa_funnel', length: 30, nullable: true })
  etapaFunnel?: string  // DESCUBRIMIENTO | CONSIDERACION | DECISION | RECURRENTE

  @Column({ name: 'datos_capturados', type: 'jsonb', nullable: true })
  datosCapturados?: Record<string, string>  // { nombre?, telefono?, email? }

  @Column({ name: 'score_motivo', length: 500, nullable: true })
  scoreMotivo?: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente

  constructor(data?: Partial<Conversacion>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
