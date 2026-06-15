import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Caja } from '../../caja/entity/caja.entity'
import { CajaSesion } from '../../caja/entity/caja-sesion.entity'
import { Usuario } from '../../usuario/entity/usuario.entity'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class AdminGerenteCajaService {
  private readonly logger = new Logger(AdminGerenteCajaService.name)

  constructor(
    @InjectRepository(Caja) private readonly cajaRepo: Repository<Caja>,
    @InjectRepository(CajaSesion) private readonly sesionRepo: Repository<CajaSesion>,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  // ── Tool definitions ──────────────────────────────────────────────────────

  getToolDefs(): any[] {
    return [
      {
        name: 'consultar_sesion_caja',
        description: 'Consulta la sesión de caja activa del sistema. También lista las cajas disponibles y las últimas sesiones del día.',
        input_schema: { type: 'object', properties: {} },
      },
      {
        name: 'abrir_caja',
        description: 'Abre una nueva sesión de caja. El monto inicial es el efectivo disponible al inicio del turno.',
        input_schema: {
          type: 'object',
          properties: {
            nombre_caja: { type: 'string', description: 'Nombre parcial de la caja a abrir' },
            monto_inicial: { type: 'number', description: 'Efectivo disponible al inicio del turno' },
            observaciones: { type: 'string', description: 'Observaciones de apertura (opcional)' },
          },
          required: ['nombre_caja', 'monto_inicial'],
        },
      },
      {
        name: 'cerrar_caja',
        description: 'Cierra la sesión de caja activa del usuario. Calcula la diferencia entre el monto esperado y el monto real contado.',
        input_schema: {
          type: 'object',
          properties: {
            monto_final: { type: 'number', description: 'Efectivo contado al cierre del turno' },
            observaciones: { type: 'string', description: 'Observaciones del cierre (opcional)' },
          },
          required: ['monto_final'],
        },
      },
    ]
  }

  // ── Dispatcher ────────────────────────────────────────────────────────────

  async ejecutar(nombre: string, input: any, clienteId: string, adminId: string): Promise<any> {
    switch (nombre) {
      case 'consultar_sesion_caja': return this.consultarSesion(clienteId, adminId)
      case 'abrir_caja':            return this.abrirCaja(input, clienteId, adminId)
      case 'cerrar_caja':           return this.cerrarCaja(input, clienteId, adminId)
      default: return null
    }
  }

  // ── Implementaciones ──────────────────────────────────────────────────────

  private async consultarSesion(clienteId: string, adminId: string): Promise<any> {
    // Sesión activa del usuario actual
    const sesionActiva = await this.sesionRepo.findOne({
      where: { clienteId, usuarioId: adminId, estadoSesion: 'ABIERTA', estado: Status.ACTIVE } as any,
    })

    // Cajas disponibles
    const cajas = await this.cajaRepo.find({
      where: { clienteId, estado: Status.ACTIVE } as any,
      order: { nombre: 'ASC' } as any,
    })

    // Sesiones abiertas hoy en total
    const hoy = new Date().toISOString().split('T')[0]
    const sesionesHoy = await this.sesionRepo
      .createQueryBuilder('s')
      .where(
        "s.cliente_id = :clienteId AND s._estado = :activo AND DATE(s.fecha_apertura) = :hoy",
        { clienteId, activo: Status.ACTIVE, hoy },
      )
      .orderBy('s.fecha_apertura', 'DESC')
      .getMany()

    return {
      sesionActiva: sesionActiva
        ? {
            cajaId: (sesionActiva as any).cajaId,
            nombreUsuario: (sesionActiva as any).nombreUsuario,
            montoInicial: Number((sesionActiva as any).montoInicial || 0),
            totalVentas: Number((sesionActiva as any).totalVentas || 0),
            nroVentas: (sesionActiva as any).nroVentas || 0,
            fechaApertura: (sesionActiva as any).fechaApertura,
            montoEsperado: Number((sesionActiva as any).montoInicial || 0) + Number((sesionActiva as any).totalVentas || 0),
          }
        : null,
      cajasDisponibles: cajas.map(c => ({
        id: c.id,
        nombre: c.nombre,
        activo: (c as any).activo,
      })),
      sesionesHoy: sesionesHoy.map(s => ({
        nombreUsuario: (s as any).nombreUsuario,
        estado: (s as any).estadoSesion,
        montoInicial: Number((s as any).montoInicial || 0),
        totalVentas: Number((s as any).totalVentas || 0),
        nroVentas: (s as any).nroVentas || 0,
        fechaApertura: (s as any).fechaApertura,
        fechaCierre: (s as any).fechaCierre || null,
      })),
    }
  }

  private async abrirCaja(input: any, clienteId: string, adminId: string): Promise<any> {
    // Buscar caja por nombre
    const cajas = await this.cajaRepo.find({ where: { clienteId, estado: Status.ACTIVE } as any })
    const caja = cajas.find(c => c.nombre.toLowerCase().includes(input.nombre_caja.toLowerCase()))
    if (!caja) return { error: `Caja "${input.nombre_caja}" no encontrada. Cajas disponibles: ${cajas.map(c => c.nombre).join(', ')}` }
    if (!(caja as any).activo) return { error: `La caja "${caja.nombre}" está inactiva` }

    // Verificar si ya hay sesión abierta en esa caja
    const sesionExistente = await this.sesionRepo.findOne({
      where: { clienteId, cajaId: caja.id, estadoSesion: 'ABIERTA', estado: Status.ACTIVE } as any,
    })
    if (sesionExistente) {
      return { error: `La caja "${caja.nombre}" ya tiene una sesión abierta para ${(sesionExistente as any).nombreUsuario}` }
    }

    const usuario = await this.usuarioRepo.findOne({ where: { id: adminId, estado: Status.ACTIVE } as any })
    const nombreUsuario = usuario
      ? [usuario.nombres, usuario.apellidos].filter(Boolean).join(' ')
      : `Usuario #${adminId}`

    const sesion = await this.sesionRepo.save(
      this.sesionRepo.create({
        clienteId,
        cajaId: caja.id,
        sucursalId: (caja as any).sucursalId,
        usuarioId: adminId,
        estadoSesion: 'ABIERTA',
        nombreUsuario,
        montoInicial: input.monto_inicial,
        totalVentas: 0,
        nroVentas: 0,
        fechaApertura: new Date(),
        observaciones: input.observaciones || null,
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion: adminId,
      } as any),
    )

    return {
      exito: true,
      caja: caja.nombre,
      nombreUsuario,
      montoInicial: Number(input.monto_inicial),
      fechaApertura: (sesion as any).fechaApertura,
      mensaje: `Caja "${caja.nombre}" abierta con ${input.monto_inicial} de monto inicial.`,
    }
  }

  private async cerrarCaja(input: any, clienteId: string, adminId: string): Promise<any> {
    const sesion = await this.sesionRepo.findOne({
      where: { clienteId, usuarioId: adminId, estadoSesion: 'ABIERTA', estado: Status.ACTIVE } as any,
    })
    if (!sesion) return { error: 'No hay ninguna sesión de caja abierta para este usuario' }

    const montoEsperado = Number((sesion as any).montoInicial) + Number((sesion as any).totalVentas)
    const diferencia = Number(input.monto_final) - montoEsperado

    Object.assign(sesion, {
      estadoSesion: 'CERRADA',
      montoFinal: input.monto_final,
      diferencia,
      fechaCierre: new Date(),
      observaciones: input.observaciones || (sesion as any).observaciones,
      transaccion: Transacccion.ACTUALIZAR,
      usuarioModificacion: adminId,
    })
    await this.sesionRepo.save(sesion)

    return {
      exito: true,
      montoInicial: Number((sesion as any).montoInicial),
      totalVentas: Number((sesion as any).totalVentas),
      nroVentas: (sesion as any).nroVentas,
      montoEsperado: Number(montoEsperado.toFixed(2)),
      montoFinal: Number(input.monto_final),
      diferencia: Number(diferencia.toFixed(2)),
      estado: diferencia === 0 ? 'EXACTO' : diferencia > 0 ? 'SOBRANTE' : 'FALTANTE',
      mensaje: `Caja cerrada. ${diferencia === 0 ? 'Sin diferencias.' : diferencia > 0 ? `Sobrante de ${diferencia.toFixed(2)}.` : `Faltante de ${Math.abs(diferencia).toFixed(2)}.`}`,
    }
  }
}
