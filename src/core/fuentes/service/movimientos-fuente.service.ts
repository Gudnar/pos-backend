import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { MovimientoFuente, TipoMovimiento } from '../entity/movimiento-fuente.entity'
import { Fuente } from '../entity/fuente.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateMovimientoFuenteDto, CreateTransferenciaDto, UpdateMovimientoFuenteDto } from '../dto/movimiento-fuente.dto'

import { aCentavos, ResultadoConversion } from '../../../common/lib/conversion-moneda'

export { aCentavos }

/** Egreso/ingreso generado desde otro módulo (pago proveedor, gasto logístico…) */
export interface MovimientoExternoConversion {
  fuenteId: string
  tipo: string
  concepto: string
  fecha: string
  categoria: string
  /** Moneda en que se hizo el pago y su total (monto × cantidad) */
  monedaPagoId?: string | null
  total: number
  conversion: ResultadoConversion
}

@Injectable()
export class MovimientosFuenteService {
  constructor(
    @InjectRepository(MovimientoFuente)
    private readonly repo: Repository<MovimientoFuente>,
    @InjectRepository(Fuente)
    private readonly fuenteRepo: Repository<Fuente>,
  ) {}

  private async validarFuente(clienteId: string, fuenteId: string): Promise<Fuente> {
    const f = await this.fuenteRepo.findOne({ where: { id: fuenteId, clienteId, estado: Status.ACTIVE } })
    if (!f) throw new NotFoundException(Messages.NOT_FOUND)
    return f
  }

  private async calcularSaldoActual(clienteId: string, fuenteId: string, saldoInicial: number, manager?: EntityManager): Promise<number> {
    const result = await (manager ? manager.getRepository(MovimientoFuente) : this.repo)
      .createQueryBuilder('m')
      .select(`
        SUM(CASE WHEN m.tipo IN ('INGRESO','TRANSFERENCIA_ENTRADA') THEN m.monto_nativo ELSE 0 END) as entradas,
        SUM(CASE WHEN m.tipo IN ('EGRESO','TRANSFERENCIA_SALIDA') THEN m.monto_nativo ELSE 0 END) as salidas
      `)
      .where('m.fuente_id = :fuenteId AND m.cliente_id = :clienteId AND m._estado = :estado', {
        fuenteId, clienteId, estado: Status.ACTIVE,
      })
      .getRawOne()
    return Number((Number(saldoInicial) + Number(result?.entradas ?? 0) - Number(result?.salidas ?? 0)).toFixed(4))
  }

  private async validarFondos(fuente: Fuente, montoNativo: number, manager?: EntityManager): Promise<void> {
    const saldo = await this.calcularSaldoActual(fuente.clienteId, fuente.id, fuente.saldoInicial, manager)
    // Se compara a centavos: el saldo mostrado (2 decimales) es el que el usuario puede usar
    if (aCentavos(montoNativo) > aCentavos(saldo)) {
      throw new BadRequestException(
        `Saldo insuficiente en "${fuente.nombre}". Disponible: ${aCentavos(saldo).toFixed(2)} — Requerido: ${aCentavos(montoNativo).toFixed(2)}`
      )
    }
  }

  async listar(clienteId: string, fuenteId: string, filters?: { desde?: string; hasta?: string; tipo?: string; categoria?: string; concepto?: string }): Promise<MovimientoFuente[]> {
    await this.validarFuente(clienteId, fuenteId)
    const qb = this.repo
      .createQueryBuilder('m')
      .where('m.fuente_id = :fuenteId AND m.cliente_id = :clienteId AND m._estado = :estado', {
        fuenteId, clienteId, estado: Status.ACTIVE,
      })
      .orderBy('m.fecha', 'DESC')
      .addOrderBy('m.fechaCreacion', 'DESC')
    if (filters?.desde) qb.andWhere('m.fecha >= :desde', { desde: filters.desde })
    if (filters?.hasta) qb.andWhere('m.fecha <= :hasta', { hasta: filters.hasta })
    if (filters?.tipo) qb.andWhere('m.tipo = :tipo', { tipo: filters.tipo })
    if (filters?.categoria) qb.andWhere('m.categoria = :categoria', { categoria: filters.categoria })
    if (filters?.concepto) qb.andWhere('m.concepto ILIKE :concepto', { concepto: `%${filters.concepto}%` })
    return qb.getMany()
  }

  async registrar(clienteId: string, fuenteId: string, dto: CreateMovimientoFuenteDto, usuarioCreacion: string): Promise<MovimientoFuente> {
    const fuente = await this.validarFuente(clienteId, fuenteId)
    const tc = dto.tipoCambio ?? 1
    const montoNativo = aCentavos(Number(dto.monto) * tc)
    if (dto.tipo === TipoMovimiento.EGRESO || dto.tipo === TipoMovimiento.TRANSFERENCIA_SALIDA) {
      await this.validarFondos(fuente, montoNativo)
    }
    return this.repo.save(
      this.repo.create({
        ...dto,
        fuenteId,
        clienteId,
        tipoCambio: tc,
        montoNativo,
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion,
      }),
    )
  }

  async registrarExterno(
    clienteId: string,
    fuenteId: string,
    tipo: string,
    concepto: string,
    monto: number,
    monedaId: string | undefined,
    tipoCambio: number,
    fecha: string,
    categoria: string,
    origenTipo: string,
    origenId: string,
    usuarioCreacion: string,
  ): Promise<MovimientoFuente> {
    const montoNativo = aCentavos(monto * tipoCambio)
    if (tipo === TipoMovimiento.EGRESO || tipo === TipoMovimiento.TRANSFERENCIA_SALIDA) {
      const fuente = await this.validarFuente(clienteId, fuenteId)
      await this.validarFondos(fuente, montoNativo)
    }
    return this.repo.save(
      this.repo.create({
        fuenteId, clienteId, tipo, concepto, monto, monedaId,
        tipoCambio, montoNativo, fecha, categoria, origenTipo, origenId,
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion,
      }),
    )
  }

  async registrarTransferencia(clienteId: string, fuenteOrigenId: string, dto: CreateTransferenciaDto, usuarioCreacion: string): Promise<{ salida: MovimientoFuente; entrada: MovimientoFuente }> {
    const fuenteOrigen = await this.validarFuente(clienteId, fuenteOrigenId)
    await this.validarFuente(clienteId, dto.fuenteDestinoId)
    const tcOrigen = dto.tipoCambio ?? 1
    const tcDestino = dto.tipoCambioDestino ?? 1
    await this.validarFondos(fuenteOrigen, aCentavos(Number(dto.monto) * tcOrigen))
    const base = { clienteId, concepto: dto.concepto, referencia: dto.referencia, monedaId: dto.monedaId, monto: dto.monto, fecha: dto.fecha, categoria: 'TRANSFERENCIA', estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion }
    const salida = await this.repo.save(
      this.repo.create({ ...base, tipo: TipoMovimiento.TRANSFERENCIA_SALIDA, fuenteId: fuenteOrigenId, tipoCambio: tcOrigen, montoNativo: aCentavos(Number(dto.monto) * tcOrigen), fuenteDestinoId: dto.fuenteDestinoId }),
    )
    const entrada = await this.repo.save(
      this.repo.create({ ...base, tipo: TipoMovimiento.TRANSFERENCIA_ENTRADA, fuenteId: dto.fuenteDestinoId, tipoCambio: tcDestino, montoNativo: aCentavos(Number(dto.monto) * tcDestino), fuenteDestinoId: fuenteOrigenId }),
    )
    return { salida, entrada }
  }

  async actualizar(clienteId: string, fuenteId: string, id: string, dto: UpdateMovimientoFuenteDto, usuarioModificacion: string): Promise<MovimientoFuente> {
    const m = await this.repo.findOne({ where: { id, fuenteId, clienteId, estado: Status.ACTIVE } })
    if (!m) throw new NotFoundException(Messages.NOT_FOUND)
    const tc = dto.tipoCambio ?? Number(m.tipoCambio)
    const monto = dto.monto ?? Number(m.monto)
    Object.assign(m, { ...dto, tipoCambio: tc, montoNativo: aCentavos(monto * tc), transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(m)
  }

  async eliminar(clienteId: string, fuenteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const m = await this.repo.findOne({ where: { id, fuenteId, clienteId, estado: Status.ACTIVE } })
    if (!m) throw new NotFoundException(Messages.NOT_FOUND)
    Object.assign(m, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(m)
  }

  /**
   * Monto que realmente sale/entra de la fuente según su moneda:
   *  - fuente en Bs (o sin moneda) → monto en Bs
   *  - fuente en la moneda intermedia (ej. USD) → monto intermedio
   *  - fuente en la moneda del pago (ej. CLP) → total del pago
   */
  private async montoEnMonedaFuente(fuente: Fuente, mov: MovimientoExternoConversion, manager: EntityManager) {
    const c = mov.conversion
    const [base] = await manager.query(
      `SELECT id FROM logistica_moneda WHERE cliente_id = $1 AND es_moneda_base = true AND _estado = 'ACTIVO' LIMIT 1`,
      [fuente.clienteId],
    )
    const monedaFuente = fuente.monedaId || base?.id || null
    if (!fuente.monedaId || monedaFuente === base?.id) {
      return { monto: mov.total, monedaId: mov.monedaPagoId || undefined, tipoCambio: c.tipoCambio, montoNativo: c.montoBase }
    }
    if (c.monedaIntermediaId && monedaFuente === c.monedaIntermediaId) {
      const m = Number(c.montoIntermedio)
      return { monto: mov.total, monedaId: mov.monedaPagoId || undefined, tipoCambio: mov.total > 0 ? m / mov.total : 1, montoNativo: m }
    }
    if (mov.monedaPagoId && monedaFuente === mov.monedaPagoId) {
      return { monto: mov.total, monedaId: mov.monedaPagoId, tipoCambio: 1, montoNativo: aCentavos(mov.total) }
    }
    throw new BadRequestException(
      `La fuente "${fuente.nombre}" está en otra moneda. Registra el pago en esa moneda o usa la conversión en dos pasos con esa moneda como intermedia.`,
    )
  }

  /**
   * Anula los movimientos previos de un origen y registra el nuevo (si se indica),
   * todo en una transacción: si no hay saldo, no se pierde el movimiento anterior.
   */
  async reemplazarExterno(
    clienteId: string,
    origenTipo: string,
    origenId: string,
    nuevo: MovimientoExternoConversion | null,
    usuario: string,
    manager?: EntityManager,
  ): Promise<MovimientoFuente | null> {
    const ejecutar = async (m: EntityManager) => {
      const repo = m.getRepository(MovimientoFuente)
      const previos = await repo.find({ where: { clienteId, origenTipo, origenId, estado: Status.ACTIVE } })
      for (const p of previos) {
        Object.assign(p, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion: usuario })
        await repo.save(p)
      }
      if (!nuevo) return null
      const fuente = await m.getRepository(Fuente).findOne({ where: { id: nuevo.fuenteId, clienteId, estado: Status.ACTIVE } })
      if (!fuente) throw new BadRequestException('Fuente de fondos no válida o inactiva')
      const datos = await this.montoEnMonedaFuente(fuente, nuevo, m)
      if (nuevo.tipo === TipoMovimiento.EGRESO || nuevo.tipo === TipoMovimiento.TRANSFERENCIA_SALIDA) {
        await this.validarFondos(fuente, datos.montoNativo, m)
      }
      return repo.save(repo.create({
        fuenteId: fuente.id, clienteId, tipo: nuevo.tipo, concepto: nuevo.concepto,
        monto: datos.monto, monedaId: datos.monedaId, tipoCambio: datos.tipoCambio, montoNativo: datos.montoNativo,
        fecha: nuevo.fecha, categoria: nuevo.categoria, origenTipo, origenId,
        estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: usuario,
      }))
    }
    return manager ? ejecutar(manager) : this.repo.manager.transaction(ejecutar)
  }

  async cancelarPorOrigen(clienteId: string, origenTipo: string, origenId: string, usuarioModificacion: string): Promise<void> {
    const movimientos = await this.repo.find({ where: { clienteId, origenTipo, origenId, estado: Status.ACTIVE } })
    for (const m of movimientos) {
      Object.assign(m, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
      await this.repo.save(m)
    }
  }
}
