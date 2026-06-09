import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Sucursal } from '../entity/sucursal.entity'
import { UsuarioSucursal } from '../entity/usuario-sucursal.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateSucursalDto, UpdateSucursalDto } from '../dto/sucursal.dto'

@Injectable()
export class SucursalesService {
  constructor(
    @InjectRepository(Sucursal)
    private readonly repo: Repository<Sucursal>,
    @InjectRepository(UsuarioSucursal)
    private readonly asignacionRepo: Repository<UsuarioSucursal>,
  ) {}

  async listar(clienteId: string): Promise<Sucursal[]> {
    return this.repo.find({
      where: { clienteId, estado: Status.ACTIVE },
      order: { esPrincipal: 'DESC', nombre: 'ASC' },
    })
  }

  async obtener(clienteId: string, id: string): Promise<Sucursal> {
    const s = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!s) throw new NotFoundException(Messages.NOT_FOUND)
    return s
  }

  async crear(clienteId: string, dto: CreateSucursalDto, usuarioCreacion: string): Promise<Sucursal> {
    return this.repo.save(
      this.repo.create({
        ...dto,
        clienteId,
        esPrincipal: dto.esPrincipal ?? false,
        activo: dto.estado !== 'inactivo',
        estado: Status.ACTIVE,
        transaccion: Transacccion.CREAR,
        usuarioCreacion,
      }),
    )
  }

  async actualizar(clienteId: string, id: string, dto: UpdateSucursalDto, usuarioModificacion: string): Promise<Sucursal> {
    const s = await this.obtener(clienteId, id)
    const { estado: estadoDto, ...rest } = dto
    const activo = estadoDto !== undefined ? estadoDto !== 'inactivo' : s.activo
    Object.assign(s, { ...rest, activo, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(s)
  }

  async eliminar(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const s = await this.obtener(clienteId, id)
    Object.assign(s, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.repo.save(s)
  }

  async obtenerSucursalesDeUsuario(clienteId: string, usuarioId: string): Promise<string[]> {
    const asignaciones = await this.asignacionRepo.find({
      where: { clienteId, usuarioId, estado: Status.ACTIVE },
    })
    return asignaciones.map(a => a.sucursalId)
  }

  async sincronizarSucursalesUsuario(clienteId: string, usuarioId: string, sucursalIds: string[], actor: string): Promise<void> {
    const actuales = await this.asignacionRepo.find({ where: { clienteId, usuarioId, estado: Status.ACTIVE } })
    const actualesIds = actuales.map(a => a.sucursalId)

    for (const a of actuales) {
      if (!sucursalIds.includes(a.sucursalId)) {
        Object.assign(a, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion: actor })
        await this.asignacionRepo.save(a)
      }
    }

    for (const sucursalId of sucursalIds) {
      if (!actualesIds.includes(sucursalId)) {
        await this.asignacionRepo.save(
          this.asignacionRepo.create({
            clienteId, usuarioId, sucursalId,
            estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: actor,
          }),
        )
      }
    }
  }
}
