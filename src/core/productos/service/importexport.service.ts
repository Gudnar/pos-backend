import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as ExcelJS from 'exceljs'
import { Producto } from '../entity/producto.entity'
import { CategoriaProducto } from '../../categorias-producto/entity/categoria-producto.entity'
import { SubcategoriaProducto } from '../../subcategorias-producto/entity/subcategoria-producto.entity'
import { UnidadMedida } from '../../unidades-medida/entity/unidad-medida.entity'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class ImportExportService {
  constructor(
    @InjectRepository(Producto)
    private readonly prodRepo: Repository<Producto>,
    @InjectRepository(CategoriaProducto)
    private readonly catRepo: Repository<CategoriaProducto>,
    @InjectRepository(SubcategoriaProducto)
    private readonly subRepo: Repository<SubcategoriaProducto>,
    @InjectRepository(UnidadMedida)
    private readonly unidadRepo: Repository<UnidadMedida>,
  ) {}

  // ── EXPORTAR ─────────────────────────────────────────────────────────────────

  async exportar(clienteId: string): Promise<Buffer> {
    const productos = await this.prodRepo
      .createQueryBuilder('p')
      .where('p.cliente_id = :clienteId AND p._estado = :estado', { clienteId, estado: Status.ACTIVE })
      .orderBy('p.nombre', 'ASC')
      .getMany()

    const subcatIds = [...new Set(productos.map(p => p.subcategoriaId))]
    const subcats = subcatIds.length
      ? await this.subRepo.createQueryBuilder('s')
          .where('s.id IN (:...ids) AND s._estado = :estado', { ids: subcatIds, estado: Status.ACTIVE })
          .getMany()
      : []
    const catIds = [...new Set(subcats.map(s => s.categoriaId))]
    const cats = catIds.length
      ? await this.catRepo.createQueryBuilder('c')
          .where('c.id IN (:...ids)', { ids: catIds })
          .getMany()
      : []
    const unidades = await this.unidadRepo.find({ where: { clienteId, estado: Status.ACTIVE } })

    const subcatMap = new Map(subcats.map(s => [s.id, s]))
    const catMap = new Map(cats.map(c => [c.id, c]))
    const unidadMap = new Map(unidades.map(u => [u.id, u]))

    const wb = new ExcelJS.Workbook()
    wb.creator = 'IDE-IA'
    const ws = wb.addWorksheet('Productos')

    ws.columns = [
      { header: 'categoria',        key: 'categoria',        width: 20 },
      { header: 'subcategoria',     key: 'subcategoria',     width: 20 },
      { header: 'nombre',           key: 'nombre',           width: 30 },
      { header: 'descripcion',      key: 'descripcion',      width: 35 },
      { header: 'codigo_tienda',    key: 'codigo_tienda',    width: 15 },
      { header: 'codigo_barras',    key: 'codigo_barras',    width: 15 },
      { header: 'codigo_proveedor', key: 'codigo_proveedor', width: 15 },
      { header: 'unidad',           key: 'unidad',           width: 15 },
      { header: 'estado',           key: 'estado',           width: 10 },
    ]

    // Estilo de cabecera
    ws.getRow(1).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } }
      cell.font = { bold: true, color: { argb: 'FFF1F5F9' } }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })
    ws.getRow(1).height = 20

    for (const p of productos) {
      const sub = subcatMap.get(p.subcategoriaId)
      const cat = sub ? catMap.get(sub.categoriaId) : null
      const unidad = p.unidadBaseId ? unidadMap.get(p.unidadBaseId) : null
      ws.addRow({
        categoria:        cat?.nombre || '',
        subcategoria:     sub?.nombre || '',
        nombre:           p.nombre,
        descripcion:      p.descripcion || '',
        codigo_tienda:    p.codigoTienda || '',
        codigo_barras:    p.codigoBarras || '',
        codigo_proveedor: p.codigoProveedor || '',
        unidad:           unidad?.nombre || p.unidadMedida || '',
        estado:           p.activo === false ? 'inactivo' : 'activo',
      })
    }

    const buffer = await wb.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  // ── IMPORTAR ─────────────────────────────────────────────────────────────────

  async importar(
    clienteId: string,
    usuarioCreacion: string,
    fileBuffer: Buffer,
  ): Promise<{ importados: number; errores: { fila: number; error: string }[] }> {
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(fileBuffer)
    const ws = wb.worksheets[0]
    if (!ws) throw new BadRequestException('El archivo no contiene hojas')

    // Leer cabeceras de la primera fila
    const headers: string[] = []
    ws.getRow(1).eachCell(cell => headers.push(String(cell.value || '').toLowerCase().trim()))

    const col = (name: string) => headers.indexOf(name)
    const cCategoria   = col('categoria')
    const cSubcat      = col('subcategoria')
    const cNombre      = col('nombre')
    const cDescripcion = col('descripcion')
    const cCodTienda   = col('codigo_tienda')
    const cCodBarras   = col('codigo_barras')
    const cCodProv     = col('codigo_proveedor')
    const cUnidad      = col('unidad')
    const cEstado      = col('estado')

    if (cNombre === -1 || cCategoria === -1 || cSubcat === -1) {
      throw new BadRequestException('El archivo debe tener las columnas: categoria, subcategoria, nombre')
    }

    // Cache para evitar consultas duplicadas
    const catCache = new Map<string, CategoriaProducto>()
    const subCache = new Map<string, SubcategoriaProducto>()
    const unidadCache = new Map<string, UnidadMedida>()

    const getCat = async (nombre: string): Promise<CategoriaProducto> => {
      const key = nombre.toLowerCase()
      if (catCache.has(key)) return catCache.get(key)!
      let cat = await this.catRepo.findOne({ where: { clienteId, nombre, estado: Status.ACTIVE } })
      if (!cat) {
        cat = await this.catRepo.save(
          this.catRepo.create({ clienteId, nombre, activo: true, estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion }),
        )
      }
      catCache.set(key, cat)
      return cat
    }

    const getSub = async (nombre: string, categoriaId: string): Promise<SubcategoriaProducto> => {
      const key = `${categoriaId}__${nombre.toLowerCase()}`
      if (subCache.has(key)) return subCache.get(key)!
      let sub = await this.subRepo.findOne({ where: { clienteId, categoriaId, nombre, estado: Status.ACTIVE } })
      if (!sub) {
        sub = await this.subRepo.save(
          this.subRepo.create({ clienteId, categoriaId, nombre, activo: true, estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion }),
        )
      }
      subCache.set(key, sub)
      return sub
    }

    const getUnidad = async (nombre: string): Promise<UnidadMedida | null> => {
      if (!nombre) return null
      const key = nombre.toLowerCase()
      if (unidadCache.has(key)) return unidadCache.get(key)!
      const u = await this.unidadRepo.findOne({ where: { clienteId, nombre, estado: Status.ACTIVE } })
      if (u) unidadCache.set(key, u)
      return u || null
    }

    let importados = 0
    const errores: { fila: number; error: string }[] = []

    for (let i = 2; i <= ws.rowCount; i++) {
      const row = ws.getRow(i)
      const getCellVal = (idx: number) => idx >= 0 ? String(row.getCell(idx + 1).value ?? '').trim() : ''

      try {
        const nombreProd = getCellVal(cNombre)
        if (!nombreProd) continue // fila vacía

        const catNombre = getCellVal(cCategoria)
        const subNombre = getCellVal(cSubcat)
        if (!catNombre || !subNombre) throw new Error('categoria y subcategoria son requeridos')

        const cat = await getCat(catNombre)
        const sub = await getSub(subNombre, cat.id)
        const unidad = await getUnidad(getCellVal(cUnidad))
        const estadoVal = getCellVal(cEstado)

        await this.prodRepo.save(
          this.prodRepo.create({
            clienteId,
            subcategoriaId: sub.id,
            nombre: nombreProd,
            descripcion: getCellVal(cDescripcion) || undefined,
            codigoTienda: getCellVal(cCodTienda) || undefined,
            codigoBarras: getCellVal(cCodBarras) || undefined,
            codigoProveedor: getCellVal(cCodProv) || undefined,
            unidadBaseId: unidad?.id,
            activo: estadoVal !== 'inactivo',
            estado: Status.ACTIVE,
            transaccion: Transacccion.CREAR,
            usuarioCreacion,
          }),
        )
        importados++
      } catch (e: any) {
        errores.push({ fila: i, error: e?.message || 'Error desconocido' })
      }
    }

    return { importados, errores }
  }
}
