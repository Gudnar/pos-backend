import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Cliente } from '../entity/cliente.entity'
import { CreateClienteDto, UpdateClienteDto } from '../dto/cliente.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'

@Injectable()
export class ClienteService extends BaseService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {
    super(ClienteService.name)
  }

  async listar(): Promise<Cliente[]> {
    return this.clienteRepository.find({
      where: { estado: Status.ACTIVE },
      order: { fechaCreacion: 'DESC' },
    })
  }

  async obtener(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { id, estado: Status.ACTIVE } })
    if (!cliente) throw new NotFoundException(Messages.CLIENTE_NOT_FOUND)
    return cliente
  }

  async obtenerPorSlug(slug: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { slug, estado: Status.ACTIVE } })
    if (!cliente) throw new NotFoundException(Messages.CLIENTE_NOT_FOUND)
    return cliente
  }

  async crear(dto: CreateClienteDto, usuarioCreacion: string): Promise<Cliente> {
    const existe = await this.clienteRepository.findOne({ where: { slug: dto.slug, estado: Status.ACTIVE } })
    if (existe) throw new ConflictException(`Ya existe un cliente con el slug '${dto.slug}'.`)

    const cliente = this.clienteRepository.create({
      ...dto,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
      activo: true,
      diasAtencion: dto.diasAtencion ?? [],
      servicios: dto.servicios ?? [],
    })
    return this.clienteRepository.save(cliente)
  }

  async actualizar(id: string, dto: UpdateClienteDto, usuarioModificacion: string): Promise<Cliente> {
    const cliente = await this.obtener(id)

    if (dto.slug && dto.slug !== cliente.slug) {
      const existe = await this.clienteRepository.findOne({ where: { slug: dto.slug, estado: Status.ACTIVE } })
      if (existe) throw new ConflictException(`Ya existe un cliente con el slug '${dto.slug}'.`)
    }

    Object.assign(cliente, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.clienteRepository.save(cliente)
  }

  async eliminar(id: string, usuarioModificacion: string): Promise<void> {
    const cliente = await this.obtener(id)
    cliente.estado = Status.ELIMINATE
    cliente.transaccion = Transacccion.ELIMINAR
    cliente.usuarioModificacion = usuarioModificacion
    await this.clienteRepository.save(cliente)
  }
}
