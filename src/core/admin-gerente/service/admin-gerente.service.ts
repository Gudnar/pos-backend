import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import axios from 'axios'
import { Usuario } from '../../usuario/entity/usuario.entity'
import { AdminGerenteToolsService } from './admin-gerente-tools.service'
import { AdminGerenteFuentesService } from './admin-gerente-fuentes.service'
import { AdminGerenteLogisticaService } from './admin-gerente-logistica.service'
import { AdminGerenteComprasService } from './admin-gerente-compras.service'
import { AdminGerenteCajaService } from './admin-gerente-caja.service'
import { Status } from '../../../common/constants'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const MAX_TOOL_ITERATIONS = 8

export interface AdminContext {
  id: string
  rol: string
  nombres: string
}

@Injectable()
export class AdminGerenteService {
  private readonly logger = new Logger(AdminGerenteService.name)

  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    private readonly adminTools: AdminGerenteToolsService,
    private readonly fuentesTools: AdminGerenteFuentesService,
    private readonly logisticaTools: AdminGerenteLogisticaService,
    private readonly comprasTools: AdminGerenteComprasService,
    private readonly cajaTools: AdminGerenteCajaService,
  ) {}

  // ── Resolución por número de teléfono ─────────────────────────────────────

  async resolverAdmin(telefono: string, clienteId: string): Promise<AdminContext | null> {
    const usuario = await this.usuarioRepo
      .createQueryBuilder('u')
      .where('u.telefono = :telefono AND u.cliente_id = :clienteId AND u._estado = :activo', {
        telefono,
        clienteId,
        activo: Status.ACTIVE,
      })
      .getOne()

    if (!usuario) return null

    this.logger.log(`[AdminGerente] Autorizado: ${usuario.nombres} (${usuario.rol}) — tel: ${telefono}`)
    return { id: usuario.id, rol: usuario.rol, nombres: usuario.nombres }
  }

  // ── Loop agentic con las 19 herramientas ──────────────────────────────────

  async obtenerRespuesta(
    texto: string,
    admin: AdminContext,
    clienteId: string,
    apiKey: string,
    nombreEmpresa: string,
  ): Promise<string | null> {
    const toolDefs = this.getAllToolDefs()
    const messages: any[] = [{ role: 'user', content: texto }]

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      let res: any
      try {
        res = await axios.post(
          ANTHROPIC_API,
          {
            model: 'claude-haiku-4-5',
            max_tokens: 1536,
            system: this.buildSystemPrompt(admin, nombreEmpresa),
            messages,
            tools: toolDefs,
          },
          {
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
          },
        )
      } catch (err: any) {
        this.logger.error(`[AdminGerente] Error iter ${i}: ${err?.response?.data?.error?.message || err.message}`)
        return null
      }

      const data = res.data
      const stopReason: string = data.stop_reason

      if (stopReason === 'end_turn') {
        const textBlock = data.content?.find((b: any) => b.type === 'text')
        return textBlock?.text || null
      }

      if (stopReason === 'tool_use') {
        const toolUses: any[] = data.content.filter((b: any) => b.type === 'tool_use')
        if (!toolUses.length) break

        this.logger.log(`[AdminGerente] Iter ${i} — herramientas: ${toolUses.map((b: any) => b.name).join(', ')}`)

        const toolResults = await Promise.all(
          toolUses.map(async (tu: any) => {
            const result = await this.dispatch(tu.name, tu.input || {}, clienteId, admin.id)
            return {
              type: 'tool_result' as const,
              tool_use_id: tu.id,
              content: JSON.stringify(result ?? { error: `Herramienta desconocida: ${tu.name}` }),
            }
          }),
        )

        messages.push({ role: 'assistant', content: data.content })
        messages.push({ role: 'user', content: toolResults })
        continue
      }

      this.logger.warn(`[AdminGerente] stop_reason inesperado: ${stopReason}`)
      break
    }

    return null
  }

  // ── Dispatcher unificado ──────────────────────────────────────────────────

  private async dispatch(nombre: string, input: any, clienteId: string, adminId: string): Promise<any> {
    // Herramientas originales (inventario / ventas)
    let result = await this.adminTools.ejecutar(nombre, input, clienteId)
    if (result !== undefined) return result

    // Fuentes de fondos
    result = await this.fuentesTools.ejecutar(nombre, input, clienteId, adminId)
    if (result !== null) return result

    // Logística
    result = await this.logisticaTools.ejecutar(nombre, input, clienteId, adminId)
    if (result !== null) return result

    // Compras
    result = await this.comprasTools.ejecutar(nombre, input, clienteId, adminId)
    if (result !== null) return result

    // Caja
    result = await this.cajaTools.ejecutar(nombre, input, clienteId, adminId)
    if (result !== null) return result

    return { error: `Herramienta no reconocida: ${nombre}` }
  }

  // ── Tool defs combinados ──────────────────────────────────────────────────

  private getAllToolDefs(): any[] {
    return [
      ...this.adminTools.getToolDefs(),
      ...this.fuentesTools.getToolDefs(),
      ...this.logisticaTools.getToolDefs(),
      ...this.comprasTools.getToolDefs(),
      ...this.cajaTools.getToolDefs(),
    ]
  }

  // ── System prompt ──────────────────────────────────────────────────────────

  private buildSystemPrompt(admin: AdminContext, nombreEmpresa: string): string {
    return `Eres el asistente administrativo del Gerente de ${nombreEmpresa}.
Gerente: ${admin.nombres} (Rol: ${admin.rol})

Tienes 19 herramientas disponibles agrupadas por área:

INVENTARIO: consultar_stock_producto, registrar_ingreso_mercaderia, registrar_venta
CLIENTES: consultar_deudas_cliente
FUENTES DE FONDOS: consultar_fuentes, registrar_ingreso_fuente, registrar_egreso_fuente, registrar_transferencia_fuente
LOGÍSTICA: consultar_orden_importacion, registrar_pago_proveedor_importacion, registrar_gasto_logistica
COMPRAS: consultar_compras, crear_compra, recibir_compra_almacen, finalizar_compra_inventario
CAJA/POS: consultar_sesion_caja, abrir_caja, cerrar_caja

Reglas de comportamiento:
- Para operaciones de escritura (registrar, crear, finalizar), confirma los datos clave con el Gerente antes de ejecutar, a menos que ya lo haya confirmado explícitamente.
- Usa herramientas de consulta primero cuando necesites IDs o información específica (ej. usa consultar_fuentes antes de registrar un movimiento).
- Para crear una compra, si el Gerente da nombres de productos úsalos tal como están (la herramienta los busca).
- Para abrir caja, indica el nombre de la caja a abrir (usa consultar_sesion_caja si no sabes los nombres disponibles).
- Proporciona números exactos, fechas precisas y totales calculados.
- Responde siempre en español, de forma concisa y directa.`
  }
}
