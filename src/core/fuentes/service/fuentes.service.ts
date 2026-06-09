import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Fuente } from '../entity/fuente.entity'
import { MovimientoFuente } from '../entity/movimiento-fuente.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateFuenteDto, UpdateFuenteDto } from '../dto/fuente.dto'

@Injectable()
export class FuentesService {
  constructor(
    @InjectRepository(Fuente)
    private readonly repo: Repository<Fuente>,
    @InjectRepository(MovimientoFuente)
    private readonly movRepo: Repository<MovimientoFuente>,
  ) {}

  private async calcularSaldo(clienteId: string, fuenteId: string, saldoInicial: number): Promise<number> {
    const result = await this.movRepo
      .createQueryBuilder('m')
      .select(`
        SUM(CASE WHEN m.tipo IN ('INGRESO','TRANSFERENCIA_ENTRADA') THEN m.monto_nativo ELSE 0 END) as entradas,
        SUM(CASE WHEN m.tipo IN ('EGRESO','TRANSFERENCIA_SALIDA') THEN m.monto_nativo ELSE 0 END) as salidas
      `)
      .where('m.fuente_id = :fuenteId AND m.cliente_id = :clienteId AND m._estado = :estado', {
        fuenteId, clienteId, estado: Status.ACTIVE,
      })
      .getRawOne()
    const entradas = Number(result?.entradas ?? 0)
    const salidas = Number(result?.salidas ?? 0)
    return Number(saldoInicial) + entradas - salidas
  }

  async listar(clienteId: string): Promise<any[]> {
    const fuentes = await this.repo.find({
      where: { clienteId, estado: Status.ACTIVE },
      order: { nombre: 'ASC' },
    })
    return Promise.all(
      fuentes.map(async f => ({
        ...f,
        saldoActual: await this.calcularSaldo(clienteId, f.id, f.saldoInicial),
      })),
    )
  }

  async obtener(clienteId: string, id: string): Promise<any> {
    const f = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!f) throw new NotFoundException(Messages.NOT_FOUND)
    return { ...f, saldoActual: await this.calcularSaldo(clienteId, id, f.saldoInicial) }
  }

  async crear(clienteId: string, dto: CreateFuenteDto, usuarioCreacion: string): Promise<Fuente> {
    return this.repo.save(
      this.repo.create({
        ...dto,
        clienteId,
        saldoInicial: dto.saldoInicial ?? 0,
        activo: dto.activo ?? true,
        tipo: dto.tipo ?? 'CUENTA_BANCARIA',
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion,
      }),
    )
  }

  async actualizar(clienteId: string, id: string, dto: UpdateFuenteDto, usuarioModificacion: string): Promise<any> {
    const f = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!f) throw new NotFoundException(Messages.NOT_FOUND)
    Object.assign(f, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    const saved = await this.repo.save(f)
    return { ...saved, saldoActual: await this.calcularSaldo(clienteId, id, saved.saldoInicial) }
  }

  async eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const f = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!f) throw new NotFoundException(Messages.NOT_FOUND)
    Object.assign(f, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(f)
  }

  async resumen(clienteId: string): Promise<any[]> {
    return this.listar(clienteId)
  }
}
