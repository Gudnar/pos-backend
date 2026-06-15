import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Fuente } from '../../fuentes/entity/fuente.entity'
import { MovimientoFuente } from '../../fuentes/entity/movimiento-fuente.entity'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class AdminGerenteFuentesService {
  private readonly logger = new Logger(AdminGerenteFuentesService.name)

  constructor(
    @InjectRepository(Fuente) private readonly fuenteRepo: Repository<Fuente>,
    @InjectRepository(MovimientoFuente) private readonly movRepo: Repository<MovimientoFuente>,
  ) {}

  // ── Tool definitions ──────────────────────────────────────────────────────

  getToolDefs(): any[] {
    return [
      {
        name: 'consultar_fuentes',
        description: 'Lista todas las fuentes de fondos (cuentas bancarias, cajas, billeteras digitales) con su saldo actual calculado.',
        input_schema: { type: 'object', properties: {} },
      },
      {
        name: 'registrar_ingreso_fuente',
        description: 'Registra un ingreso de dinero en una fuente de fondos (ej. cobro de cliente, depósito).',
        input_schema: {
          type: 'object',
          properties: {
            nombre_fuente: { type: 'string', description: 'Nombre parcial de la fuente de fondos' },
            monto: { type: 'number', description: 'Monto a ingresar' },
            concepto: { type: 'string', description: 'Descripción del ingreso' },
            categoria: {
              type: 'string',
              enum: ['INGRESO_VENTA', 'DEPOSITO', 'OTRO'],
              description: 'Categoría del ingreso (default: OTRO)',
            },
            referencia: { type: 'string', description: 'Nro. comprobante o referencia (opcional)' },
            fecha: { type: 'string', description: 'Fecha en formato YYYY-MM-DD (default: hoy)' },
          },
          required: ['nombre_fuente', 'monto', 'concepto'],
        },
      },
      {
        name: 'registrar_egreso_fuente',
        description: 'Registra una salida de dinero de una fuente de fondos (ej. pago a proveedor, retiro, gasto).',
        input_schema: {
          type: 'object',
          properties: {
            nombre_fuente: { type: 'string', description: 'Nombre parcial de la fuente de fondos' },
            monto: { type: 'number', description: 'Monto a egresar' },
            concepto: { type: 'string', description: 'Descripción del egreso' },
            categoria: {
              type: 'string',
              enum: ['PAGO_PROVEEDOR', 'GASTO_LOGISTICA', 'RETIRO', 'OTRO'],
              description: 'Categoría del egreso (default: OTRO)',
            },
            referencia: { type: 'string', description: 'Nro. comprobante o referencia (opcional)' },
            fecha: { type: 'string', description: 'Fecha en formato YYYY-MM-DD (default: hoy)' },
          },
          required: ['nombre_fuente', 'monto', 'concepto'],
        },
      },
      {
        name: 'registrar_transferencia_fuente',
        description: 'Transfiere dinero entre dos fuentes de fondos del negocio.',
        input_schema: {
          type: 'object',
          properties: {
            nombre_fuente_origen: { type: 'string', description: 'Nombre parcial de la fuente origen' },
            nombre_fuente_destino: { type: 'string', description: 'Nombre parcial de la fuente destino' },
            monto: { type: 'number', description: 'Monto a transferir' },
            concepto: { type: 'string', description: 'Descripción de la transferencia' },
            referencia: { type: 'string', description: 'Nro. comprobante o referencia (opcional)' },
            fecha: { type: 'string', description: 'Fecha en formato YYYY-MM-DD (default: hoy)' },
          },
          required: ['nombre_fuente_origen', 'nombre_fuente_destino', 'monto', 'concepto'],
        },
      },
    ]
  }

  // ── Dispatcher ────────────────────────────────────────────────────────────

  async ejecutar(nombre: string, input: any, clienteId: string, adminId: string): Promise<any> {
    switch (nombre) {
      case 'consultar_fuentes':           return this.consultarFuentes(clienteId)
      case 'registrar_ingreso_fuente':    return this.registrarMovimiento('INGRESO', input, clienteId, adminId)
      case 'registrar_egreso_fuente':     return this.registrarMovimiento('EGRESO', input, clienteId, adminId)
      case 'registrar_transferencia_fuente': return this.registrarTransferencia(input, clienteId, adminId)
      default: return null
    }
  }

  // ── Implementaciones ──────────────────────────────────────────────────────

  private async consultarFuentes(clienteId: string): Promise<any> {
    const fuentes = await this.fuenteRepo.find({
      where: { clienteId, estado: Status.ACTIVE } as any,
      order: { nombre: 'ASC' } as any,
    })

    const conSaldo = await Promise.all(
      fuentes.map(async (f) => {
        const saldo = await this.calcularSaldo(clienteId, f.id, Number(f.saldoInicial))
        return {
          nombre: f.nombre,
          tipo: f.tipo,
          banco: f.banco || null,
          saldoActual: Number(saldo.toFixed(2)),
        }
      }),
    )

    return {
      fuentes: conSaldo,
      totalFuentes: conSaldo.length,
      saldoTotal: Number(conSaldo.reduce((s, f) => s + f.saldoActual, 0).toFixed(2)),
    }
  }

  private async registrarMovimiento(tipo: 'INGRESO' | 'EGRESO', input: any, clienteId: string, adminId: string): Promise<any> {
    const fuente = await this.buscarFuentePorNombre(input.nombre_fuente, clienteId)
    if (!fuente) return { error: `Fuente de fondos no encontrada: "${input.nombre_fuente}"` }

    if (tipo === 'EGRESO') {
      const saldoActual = await this.calcularSaldo(clienteId, fuente.id, Number(fuente.saldoInicial))
      if (saldoActual < Number(input.monto)) {
        return { error: `Saldo insuficiente. Saldo actual: ${saldoActual.toFixed(2)}, monto solicitado: ${input.monto}` }
      }
    }

    const hoy = new Date().toISOString().split('T')[0]
    const mov = this.movRepo.create({
      clienteId,
      fuenteId: fuente.id,
      tipo,
      concepto: input.concepto,
      referencia: input.referencia || null,
      monto: input.monto,
      tipoCambio: 1,
      montoNativo: input.monto,
      fecha: input.fecha || hoy,
      categoria: input.categoria || 'OTRO',
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion: adminId,
    } as any)
    await this.movRepo.save(mov)

    const saldoNuevo = await this.calcularSaldo(clienteId, fuente.id, Number(fuente.saldoInicial))
    return {
      exito: true,
      fuente: fuente.nombre,
      tipo,
      monto: Number(input.monto),
      saldoNuevo: Number(saldoNuevo.toFixed(2)),
      mensaje: `${tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'} de ${input.monto} registrado en "${fuente.nombre}". Saldo actual: ${saldoNuevo.toFixed(2)}`,
    }
  }

  private async registrarTransferencia(input: any, clienteId: string, adminId: string): Promise<any> {
    const origen = await this.buscarFuentePorNombre(input.nombre_fuente_origen, clienteId)
    if (!origen) return { error: `Fuente origen no encontrada: "${input.nombre_fuente_origen}"` }

    const destino = await this.buscarFuentePorNombre(input.nombre_fuente_destino, clienteId)
    if (!destino) return { error: `Fuente destino no encontrada: "${input.nombre_fuente_destino}"` }

    if (origen.id === destino.id) return { error: 'La fuente origen y destino no pueden ser la misma' }

    const saldoOrigen = await this.calcularSaldo(clienteId, origen.id, Number(origen.saldoInicial))
    if (saldoOrigen < Number(input.monto)) {
      return { error: `Saldo insuficiente en "${origen.nombre}". Disponible: ${saldoOrigen.toFixed(2)}, solicitado: ${input.monto}` }
    }

    const hoy = new Date().toISOString().split('T')[0]
    const fecha = input.fecha || hoy

    const salida = this.movRepo.create({
      clienteId, fuenteId: origen.id,
      tipo: 'TRANSFERENCIA_SALIDA',
      concepto: input.concepto,
      referencia: input.referencia || null,
      monto: input.monto, tipoCambio: 1, montoNativo: input.monto,
      fecha, categoria: 'TRANSFERENCIA',
      fuenteDestinoId: destino.id,
      estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: adminId,
    } as any)
    const salidaGuardada = await this.movRepo.save(salida) as any

    const entrada = this.movRepo.create({
      clienteId, fuenteId: destino.id,
      tipo: 'TRANSFERENCIA_ENTRADA',
      concepto: input.concepto,
      referencia: input.referencia || null,
      monto: input.monto, tipoCambio: 1, montoNativo: input.monto,
      fecha, categoria: 'TRANSFERENCIA',
      origenTipo: 'transferencia_fuente',
      origenId: salidaGuardada.id,
      estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: adminId,
    } as any)
    await this.movRepo.save(entrada)

    return {
      exito: true,
      origen: origen.nombre,
      destino: destino.nombre,
      monto: Number(input.monto),
      mensaje: `Transferencia de ${input.monto} de "${origen.nombre}" → "${destino.nombre}" registrada.`,
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async buscarFuentePorNombre(nombre: string, clienteId: string): Promise<Fuente | null> {
    const fuentes = await this.fuenteRepo.find({
      where: { clienteId, estado: Status.ACTIVE } as any,
    })
    return fuentes.find(f => f.nombre.toLowerCase().includes(nombre.toLowerCase())) || null
  }

  private async calcularSaldo(clienteId: string, fuenteId: string, saldoInicial: number): Promise<number> {
    const res = await this.movRepo
      .createQueryBuilder('m')
      .select([
        "SUM(CASE WHEN m.tipo IN ('INGRESO','TRANSFERENCIA_ENTRADA') THEN m.monto_nativo ELSE 0 END) AS entradas",
        "SUM(CASE WHEN m.tipo IN ('EGRESO','TRANSFERENCIA_SALIDA') THEN m.monto_nativo ELSE 0 END) AS salidas",
      ])
      .where('m.cliente_id = :clienteId AND m.fuente_id = :fuenteId AND m._estado = :activo', {
        clienteId, fuenteId, activo: Status.ACTIVE,
      })
      .getRawOne()

    return saldoInicial + Number(res?.entradas || 0) - Number(res?.salidas || 0)
  }
}
