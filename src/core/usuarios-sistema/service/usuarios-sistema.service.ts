import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { Usuario } from '../../usuario/entity/usuario.entity'
import { UsuarioSucursal } from '../../sucursales/entity/usuario-sucursal.entity'
import { Sucursal } from '../../sucursales/entity/sucursal.entity'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { CreateUsuarioSistemaDto, UpdateUsuarioSistemaDto } from '../dto/usuarios-sistema.dto'

@Injectable()
export class UsuariosSistemaService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(UsuarioSucursal)
    private readonly asignacionRepo: Repository<UsuarioSucursal>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepo: Repository<Sucursal>,
  ) {}

  async listar(clienteId: string): Promise<any[]> {
    const usuarios = await this.usuarioRepo.find({
      where: { clienteId, estado: Not(Status.ELIMINATE) },
      order: { nombres: 'ASC' },
    })
    return Promise.all(usuarios.map(u => this._enriquecer(u, clienteId)))
  }

  async obtener(clienteId: string, id: string): Promise<any> {
    const u = await this.usuarioRepo.findOne({ where: { id, clienteId, estado: Not(Status.ELIMINATE) } })
    if (!u) throw new NotFoundException(Messages.NOT_FOUND)
    return this._enriquecer(u, clienteId)
  }

  async crear(clienteId: string, dto: CreateUsuarioSistemaDto, usuarioCreacion: string): Promise<any> {
    const existe = await this.usuarioRepo.findOne({ where: { usuario: dto.usuario } })
    if (existe) throw new ConflictException(Messages.CONFLICT)

    const { sucursales, estado: estadoDto, ...usuarioData } = dto
    const estado = estadoDto === 'inactivo' ? Status.INACTIVE : Status.ACTIVE

    const nuevo = this.usuarioRepo.create({
      usuario: usuarioData.usuario,
      contrasena: usuarioData.contrasena,
      nombres: usuarioData.nombres,
      apellidos: usuarioData.apellidos,
      correoElectronico: usuarioData.correoElectronico,
      rol: usuarioData.rol,
      clienteId,
      estado,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    const saved = await this.usuarioRepo.save(nuevo)

    if (sucursales?.length) {
      await this._sincronizar(clienteId, (saved as any).id, sucursales, usuarioCreacion)
    }

    return this.obtener(clienteId, (saved as any).id)
  }

  async actualizar(clienteId: string, id: string, dto: UpdateUsuarioSistemaDto, actor: string): Promise<any> {
    const u = await this.usuarioRepo.findOne({ where: { id, clienteId, estado: Not(Status.ELIMINATE) } })
    if (!u) throw new NotFoundException(Messages.NOT_FOUND)

    const { sucursales, nuevaContrasena, estado: estadoDto, ...rest } = dto
    const estado = estadoDto !== undefined
      ? (estadoDto === 'inactivo' ? Status.INACTIVE : Status.ACTIVE)
      : u.estado

    Object.assign(u, { ...rest, estado, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion: actor })

    if (nuevaContrasena) {
      u.contrasena = await bcrypt.hash(nuevaContrasena, 10)
    }

    await this.usuarioRepo.save(u)

    if (sucursales !== undefined) {
      await this._sincronizar(clienteId, id, sucursales, actor)
    }

    return this.obtener(clienteId, id)
  }

  async eliminar(clienteId: string, id: string, actor: string): Promise<void> {
    const u = await this.usuarioRepo.findOne({ where: { id, clienteId, estado: Not(Status.ELIMINATE) } })
    if (!u) throw new NotFoundException(Messages.NOT_FOUND)
    Object.assign(u, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion: actor })
    await this.usuarioRepo.save(u)
    const asignaciones = await this.asignacionRepo.find({ where: { clienteId, usuarioId: id, estado: Status.ACTIVE } })
    for (const a of asignaciones) {
      Object.assign(a, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion: actor })
      await this.asignacionRepo.save(a)
    }
  }

  private async _enriquecer(u: Usuario, clienteId: string): Promise<any> {
    const asignaciones = await this.asignacionRepo.find({
      where: { clienteId, usuarioId: u.id, estado: Status.ACTIVE },
    })
    const sucursalIds = asignaciones.map(a => a.sucursalId)
    const sucursales = sucursalIds.length
      ? await this.sucursalRepo.findByIds(sucursalIds)
      : []
    const { contrasena, ...safe } = u as any
    return { ...safe, sucursales: sucursales.map(s => ({ id: s.id, nombre: s.nombre })) }
  }

  private async _sincronizar(clienteId: string, usuarioId: string, sucursalIds: string[], actor: string): Promise<void> {
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
