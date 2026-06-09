import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ContactoCliente } from '../entity/contacto-cliente.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateContactoClienteDto, UpdateContactoClienteDto } from '../dto/contacto-cliente.dto'
import { RepresentantesService } from '../../representantes/service/representantes.service'

@Injectable()
export class ContactosClientesService {
  constructor(
    @InjectRepository(ContactoCliente)
    private readonly repo: Repository<ContactoCliente>,
    private readonly repSvc: RepresentantesService,
  ) {}

  async listar(clienteId: string, q?: string): Promise<any[]> {
    const qb = this.repo
      .createQueryBuilder('c')
      .where('c.cliente_id = :clienteId AND c._estado = :estado', { clienteId, estado: Status.ACTIVE })
      .orderBy('c.nombre', 'ASC')

    if (q && q.trim().length >= 1) {
      qb.andWhere(
        '(LOWER(c.nombre) LIKE LOWER(:q) OR LOWER(c.empresa) LIKE LOWER(:q))',
        { q: `%${q.trim()}%` },
      )
    }

    const contactos = await qb.getMany()
    if (!contactos.length) return []

    const repMap = await this.repSvc.listarActivosBatch(
      clienteId, 'CLIENTE', contactos.map(c => c.id),
    )

    return contactos.map(c => ({
      ...c,
      representanteActual: repMap.get(c.id) ?? null,
    }))
  }

  async obtener(clienteId: string, id: string): Promise<ContactoCliente> {
    const c = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!c) throw new NotFoundException(Messages.NOT_FOUND)
    return c
  }

  async crear(clienteId: string, dto: CreateContactoClienteDto, usuarioCreacion: string): Promise<ContactoCliente> {
    return this.repo.save(
      this.repo.create({
        ...dto,
        clienteId,
        activo: dto.estado !== 'inactivo',
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion,
      }),
    )
  }

  async actualizar(clienteId: string, id: string, dto: UpdateContactoClienteDto, usuarioModificacion: string): Promise<ContactoCliente> {
    const contacto = await this.obtener(clienteId, id)
    const { estado: estadoDto, ...rest } = dto
    const activo = estadoDto !== undefined ? estadoDto !== 'inactivo' : contacto.activo
    Object.assign(contacto, { ...rest, activo, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(contacto)
  }

  async eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const contacto = await this.obtener(clienteId, id)
    Object.assign(contacto, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(contacto)
  }
}
