import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MovimientoFuente, TipoMovimiento } from '../entity/movimiento-fuente.entity'
import { Fuente } from '../entity/fuente.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateMovimientoFuenteDto, CreateTransferenciaDto, UpdateMovimientoFuenteDto } from '../dto/movimiento-fuente.dto'

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

  private async calcularSaldoActual(clienteId: string, fuenteId: string, saldoInicial: number): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('m')
      .select(`
        SUM(CASE WHEN m.tipo IN ('INGRESO','TRANSFERENCIA_ENTRADA') THEN m.monto_nativo ELSE 0 END) as entradas,
        SUM(CASE WHEN m.tipo IN ('EGRESO','TRANSFERENCIA_SALIDA') THEN m.monto_nativo ELSE 0 END) as salidas
      `)
      .where('m.fuente_id = :fuenteId AND m.cliente_id = :clienteId AND m._estado = :estado', {
        fuenteId, clienteId, estado: Status.ACTIVE,
      })
      .getRawOne()
    return Number(saldoInicial) + Number(result?.entradas ?? 0) - Number(result?.salidas ?? 0)
  }

  private async validarFondos(fuente: Fuente, montoNativo: number): Promise<void> {
    const saldo = await this.calcularSaldoActual(fuente.clienteId, fuente.id, fuente.saldoInicial)
    if (montoNativo > saldo + 0.001) {
      throw new BadRequestException(
        `Saldo insuficiente en "${fuente.nombre}". Disponible: ${saldo.toFixed(2)} — Requerido: ${montoNativo.toFixed(2)}`
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
    const montoNativo = Number(dto.monto) * tc
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
    const montoNativo = monto * tipoCambio
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
    await this.validarFondos(fuenteOrigen, Number(dto.monto) * tcOrigen)
    const base = { clienteId, concepto: dto.concepto, referencia: dto.referencia, monedaId: dto.monedaId, monto: dto.monto, fecha: dto.fecha, categoria: 'TRANSFERENCIA', estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion }
    const salida = await this.repo.save(
      this.repo.create({ ...base, tipo: TipoMovimiento.TRANSFERENCIA_SALIDA, fuenteId: fuenteOrigenId, tipoCambio: tcOrigen, montoNativo: Number(dto.monto) * tcOrigen, fuenteDestinoId: dto.fuenteDestinoId }),
    )
    const entrada = await this.repo.save(
      this.repo.create({ ...base, tipo: TipoMovimiento.TRANSFERENCIA_ENTRADA, fuenteId: dto.fuenteDestinoId, tipoCambio: tcDestino, montoNativo: Number(dto.monto) * tcDestino, fuenteDestinoId: fuenteOrigenId }),
    )
    return { salida, entrada }
  }

  async actualizar(clienteId: string, fuenteId: string, id: string, dto: UpdateMovimientoFuenteDto, usuarioModificacion: string): Promise<MovimientoFuente> {
    const m = await this.repo.findOne({ where: { id, fuenteId, clienteId, estado: Status.ACTIVE } })
    if (!m) throw new NotFoundException(Messages.NOT_FOUND)
    const tc = dto.tipoCambio ?? Number(m.tipoCambio)
    const monto = dto.monto ?? Number(m.monto)
    Object.assign(m, { ...dto, tipoCambio: tc, montoNativo: monto * tc, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(m)
  }

  async eliminar(clienteId: string, fuenteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const m = await this.repo.findOne({ where: { id, fuenteId, clienteId, estado: Status.ACTIVE } })
    if (!m) throw new NotFoundException(Messages.NOT_FOUND)
    Object.assign(m, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(m)
  }

  async cancelarPorOrigen(clienteId: string, origenTipo: string, origenId: string, usuarioModificacion: string): Promise<void> {
    const movimientos = await this.repo.find({ where: { clienteId, origenTipo, origenId, estado: Status.ACTIVE } })
    for (const m of movimientos) {
      Object.assign(m, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
      await this.repo.save(m)
    }
  }
}
