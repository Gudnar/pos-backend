import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm'
import { Conversacion } from '../entity/conversacion.entity'
import { CreateConversacionDto, AgregarMensajeDto } from '../dto/create-conversacion.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'

@Injectable()
export class ConversacionService extends BaseService {
  constructor(
    @InjectRepository(Conversacion)
    private readonly conversacionRepository: Repository<Conversacion>
  ) {
    super(ConversacionService.name)
  }

  async listar(clienteId: string, agenteId?: string): Promise<Conversacion[]> {
    const where: any = { estado: Status.ACTIVE, clienteId }
    if (agenteId) where.agenteId = agenteId
    return this.conversacionRepository.find({
      where,
      order: { fechaModificacion: 'DESC' },
      take: 100,
    })
  }

  async obtener(id: string): Promise<Conversacion> {
    const conv = await this.conversacionRepository.findOne({ where: { id, estado: Status.ACTIVE } })
    if (!conv) throw new NotFoundException(Messages.CONVERSACION_NOT_FOUND)
    return conv
  }

  async crear(dto: CreateConversacionDto, usuarioCreacion: string, clienteId: string): Promise<Conversacion> {
    const conv = this.conversacionRepository.create({
      ...dto,
      clienteId,
      canal: dto.canal || 'chat',
      estadoConversacion: 'abierto',
      mensajes: [],
      etiquetas: dto.etiquetas ?? [],
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.conversacionRepository.save(conv)
  }

  async agregarMensaje(id: string, dto: AgregarMensajeDto): Promise<Conversacion> {
    const conv = await this.obtener(id)
    const nuevoMensaje = {
      role: dto.role,
      content: dto.content,
      timestamp: new Date().toISOString(),
    }
    conv.mensajes = [...(conv.mensajes || []), nuevoMensaje]
    conv.totalMensajes = conv.mensajes.length
    conv.transaccion = Transacccion.ACTUALIZAR
    return this.conversacionRepository.save(conv)
  }

  async actualizarScore(id: string, score: number): Promise<void> {
    await this.conversacionRepository.update(id, { score })
  }

  async actualizarCalificacion(id: string, data: {
    score?: number
    intencion?: string
    urgencia?: string
    sentimiento?: string
    servicioDetectado?: string
    etapaFunnel?: string
    datosCapturados?: Record<string, string>
    scoreMotivo?: string
  }): Promise<void> {
    await this.conversacionRepository.update(id, data)
  }

  async actualizarEstado(id: string, estadoConversacion: string): Promise<void> {
    await this.conversacionRepository.update(id, { estadoConversacion })
  }

  async actualizarEscalado(id: string, escalado: boolean, motivo?: string): Promise<void> {
    const update: any = { escalado }
    if (motivo) update.notas = motivo
    await this.conversacionRepository.update(id, update)
  }

  async agregarNota(id: string, nota: string): Promise<void> {
    const conv = await this.conversacionRepository.findOne({ where: { id } })
    if (!conv) return
    const notasActuales = conv.notas ? `${conv.notas}\n---\n${nota}` : nota
    await this.conversacionRepository.update(id, { notas: notasActuales })
  }

  async buscarAbiertaPorContacto(clienteId: string, contacto: string, canal = 'whatsapp'): Promise<Conversacion | null> {
    return this.conversacionRepository.findOne({
      where: { clienteId, contacto, canal, estado: Status.ACTIVE },
      order: { fechaModificacion: 'DESC' },
    }).then(conv =>
      conv && conv.estadoConversacion !== 'resuelto' && conv.estadoConversacion !== 'cerrado'
        ? conv
        : null,
    )
  }

  async estadisticas(clienteId: string, agenteId?: string): Promise<any> {
    const where: any = { estado: Status.ACTIVE, clienteId }
    if (agenteId) where.agenteId = agenteId

    const total = await this.conversacionRepository.count({ where })
    const escaladas = await this.conversacionRepository.count({ where: { ...where, escalado: true } })
    const resueltas = await this.conversacionRepository.count({ where: { ...where, estadoConversacion: 'resuelto' } })

    return {
      total,
      escaladas,
      resueltas,
      porcentajeResolucion: total > 0 ? Math.round((resueltas / total) * 100) : 0,
    }
  }

  async metricas(clienteId: string, agenteId?: string, desde?: string, hasta?: string): Promise<any> {
    const where: any = { estado: Status.ACTIVE, clienteId }
    if (agenteId) where.agenteId = agenteId
    if (desde && hasta) where.fechaCreacion = Between(new Date(desde), new Date(hasta + 'T23:59:59'))
    else if (desde)  where.fechaCreacion = MoreThanOrEqual(new Date(desde))
    else if (hasta)  where.fechaCreacion = LessThanOrEqual(new Date(hasta + 'T23:59:59'))

    const lista = await this.conversacionRepository.find({ where })
    const total = lista.length

    const scorePromedio = lista.filter(c => c.score > 0).length > 0
      ? Math.round(lista.filter(c => c.score > 0).reduce((s, c) => s + c.score, 0) / lista.filter(c => c.score > 0).length)
      : 0

    const contarIntenciones: Record<string, number> = {}
    const contarSentimientos: Record<string, number> = {}

    let tiempoTotal = 0, tiempoCount = 0

    for (const conv of lista) {
      if (conv.intencion) contarIntenciones[conv.intencion] = (contarIntenciones[conv.intencion] || 0) + 1
      if (conv.sentimiento) contarSentimientos[conv.sentimiento] = (contarSentimientos[conv.sentimiento] || 0) + 1

      const msgs = conv.mensajes || []
      for (let i = 0; i < msgs.length - 1; i++) {
        if (msgs[i].role === 'user' && msgs[i + 1]?.role === 'assistant') {
          const delta = new Date(msgs[i + 1].timestamp).getTime() - new Date(msgs[i].timestamp).getTime()
          if (delta > 0 && delta < 300_000) { tiempoTotal += delta; tiempoCount++ }
        }
      }
    }

    const diasLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const actividadPorDia = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const fechaStr = d.toISOString().slice(0, 10)
      return {
        fecha: fechaStr,
        label: diasLabels[d.getDay()],
        total: lista.filter(c => c.fechaCreacion?.toISOString().slice(0, 10) === fechaStr).length,
      }
    })

    return {
      total,
      escaladas:    lista.filter(c => c.escalado).length,
      resueltas:    lista.filter(c => c.estadoConversacion === 'resuelto').length,
      abiertas:     lista.filter(c => c.estadoConversacion === 'abierto').length,
      porcentajeResolucion: total > 0 ? Math.round(lista.filter(c => c.estadoConversacion === 'resuelto').length / total * 100) : 0,
      scorePromedio,
      hotLeads:  lista.filter(c => c.score >= 70).length,
      warmLeads: lista.filter(c => c.score >= 40 && c.score < 70).length,
      coldLeads: lista.filter(c => c.score > 0 && c.score < 40).length,
      sinScore:  lista.filter(c => c.score === 0).length,
      distribucion: {
        hot:      lista.filter(c => c.score >= 70).length,
        warm:     lista.filter(c => c.score >= 40 && c.score < 70).length,
        cold:     lista.filter(c => c.score > 0 && c.score < 40).length,
        sinScore: lista.filter(c => c.score === 0).length,
      },
      intenciones:  contarIntenciones,
      sentimientos: contarSentimientos,
      tiempoRespuestaSegundos: tiempoCount > 0 ? Math.round(tiempoTotal / tiempoCount / 1000) : 0,
      actividadPorDia,
    }
  }
}
