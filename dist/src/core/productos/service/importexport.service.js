"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportExportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ExcelJS = __importStar(require("exceljs"));
const producto_entity_1 = require("../entity/producto.entity");
const categoria_producto_entity_1 = require("../../categorias-producto/entity/categoria-producto.entity");
const subcategoria_producto_entity_1 = require("../../subcategorias-producto/entity/subcategoria-producto.entity");
const unidad_medida_entity_1 = require("../../unidades-medida/entity/unidad-medida.entity");
const constants_1 = require("../../../common/constants");
let ImportExportService = class ImportExportService {
    constructor(prodRepo, catRepo, subRepo, unidadRepo) {
        this.prodRepo = prodRepo;
        this.catRepo = catRepo;
        this.subRepo = subRepo;
        this.unidadRepo = unidadRepo;
    }
    async exportar(clienteId) {
        const productos = await this.prodRepo
            .createQueryBuilder('p')
            .where('p.cliente_id = :clienteId AND p._estado = :estado', { clienteId, estado: constants_1.Status.ACTIVE })
            .orderBy('p.nombre', 'ASC')
            .getMany();
        const subcatIds = [...new Set(productos.map(p => p.subcategoriaId))];
        const subcats = subcatIds.length
            ? await this.subRepo.createQueryBuilder('s')
                .where('s.id IN (:...ids) AND s._estado = :estado', { ids: subcatIds, estado: constants_1.Status.ACTIVE })
                .getMany()
            : [];
        const catIds = [...new Set(subcats.map(s => s.categoriaId))];
        const cats = catIds.length
            ? await this.catRepo.createQueryBuilder('c')
                .where('c.id IN (:...ids)', { ids: catIds })
                .getMany()
            : [];
        const unidades = await this.unidadRepo.find({ where: { clienteId, estado: constants_1.Status.ACTIVE } });
        const subcatMap = new Map(subcats.map(s => [s.id, s]));
        const catMap = new Map(cats.map(c => [c.id, c]));
        const unidadMap = new Map(unidades.map(u => [u.id, u]));
        const wb = new ExcelJS.Workbook();
        wb.creator = 'IDE-IA';
        const ws = wb.addWorksheet('Productos');
        ws.columns = [
            { header: 'categoria', key: 'categoria', width: 20 },
            { header: 'subcategoria', key: 'subcategoria', width: 20 },
            { header: 'nombre', key: 'nombre', width: 30 },
            { header: 'descripcion', key: 'descripcion', width: 35 },
            { header: 'codigo_tienda', key: 'codigo_tienda', width: 15 },
            { header: 'codigo_barras', key: 'codigo_barras', width: 15 },
            { header: 'codigo_proveedor', key: 'codigo_proveedor', width: 15 },
            { header: 'unidad', key: 'unidad', width: 15 },
            { header: 'estado', key: 'estado', width: 10 },
        ];
        ws.getRow(1).eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
            cell.font = { bold: true, color: { argb: 'FFF1F5F9' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
        ws.getRow(1).height = 20;
        for (const p of productos) {
            const sub = subcatMap.get(p.subcategoriaId);
            const cat = sub ? catMap.get(sub.categoriaId) : null;
            const unidad = p.unidadBaseId ? unidadMap.get(p.unidadBaseId) : null;
            ws.addRow({
                categoria: cat?.nombre || '',
                subcategoria: sub?.nombre || '',
                nombre: p.nombre,
                descripcion: p.descripcion || '',
                codigo_tienda: p.codigoTienda || '',
                codigo_barras: p.codigoBarras || '',
                codigo_proveedor: p.codigoProveedor || '',
                unidad: unidad?.nombre || p.unidadMedida || '',
                estado: p.activo === false ? 'inactivo' : 'activo',
            });
        }
        const buffer = await wb.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    async importar(clienteId, usuarioCreacion, fileBuffer) {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(fileBuffer);
        const ws = wb.worksheets[0];
        if (!ws)
            throw new common_1.BadRequestException('El archivo no contiene hojas');
        const headers = [];
        ws.getRow(1).eachCell(cell => headers.push(String(cell.value || '').toLowerCase().trim()));
        const col = (name) => headers.indexOf(name);
        const cCategoria = col('categoria');
        const cSubcat = col('subcategoria');
        const cNombre = col('nombre');
        const cDescripcion = col('descripcion');
        const cCodTienda = col('codigo_tienda');
        const cCodBarras = col('codigo_barras');
        const cCodProv = col('codigo_proveedor');
        const cUnidad = col('unidad');
        const cEstado = col('estado');
        if (cNombre === -1 || cCategoria === -1 || cSubcat === -1) {
            throw new common_1.BadRequestException('El archivo debe tener las columnas: categoria, subcategoria, nombre');
        }
        const catCache = new Map();
        const subCache = new Map();
        const unidadCache = new Map();
        const getCat = async (nombre) => {
            const key = nombre.toLowerCase();
            if (catCache.has(key))
                return catCache.get(key);
            let cat = await this.catRepo.findOne({ where: { clienteId, nombre, estado: constants_1.Status.ACTIVE } });
            if (!cat) {
                cat = await this.catRepo.save(this.catRepo.create({ clienteId, nombre, activo: true, estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion }));
            }
            catCache.set(key, cat);
            return cat;
        };
        const getSub = async (nombre, categoriaId) => {
            const key = `${categoriaId}__${nombre.toLowerCase()}`;
            if (subCache.has(key))
                return subCache.get(key);
            let sub = await this.subRepo.findOne({ where: { clienteId, categoriaId, nombre, estado: constants_1.Status.ACTIVE } });
            if (!sub) {
                sub = await this.subRepo.save(this.subRepo.create({ clienteId, categoriaId, nombre, activo: true, estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion }));
            }
            subCache.set(key, sub);
            return sub;
        };
        const getUnidad = async (nombre) => {
            if (!nombre)
                return null;
            const key = nombre.toLowerCase();
            if (unidadCache.has(key))
                return unidadCache.get(key);
            const u = await this.unidadRepo.findOne({ where: { clienteId, nombre, estado: constants_1.Status.ACTIVE } });
            if (u)
                unidadCache.set(key, u);
            return u || null;
        };
        let importados = 0;
        const errores = [];
        for (let i = 2; i <= ws.rowCount; i++) {
            const row = ws.getRow(i);
            const getCellVal = (idx) => idx >= 0 ? String(row.getCell(idx + 1).value ?? '').trim() : '';
            try {
                const nombreProd = getCellVal(cNombre);
                if (!nombreProd)
                    continue;
                const catNombre = getCellVal(cCategoria);
                const subNombre = getCellVal(cSubcat);
                if (!catNombre || !subNombre)
                    throw new Error('categoria y subcategoria son requeridos');
                const cat = await getCat(catNombre);
                const sub = await getSub(subNombre, cat.id);
                const unidad = await getUnidad(getCellVal(cUnidad));
                const estadoVal = getCellVal(cEstado);
                await this.prodRepo.save(this.prodRepo.create({
                    clienteId,
                    subcategoriaId: sub.id,
                    nombre: nombreProd,
                    descripcion: getCellVal(cDescripcion) || undefined,
                    codigoTienda: getCellVal(cCodTienda) || undefined,
                    codigoBarras: getCellVal(cCodBarras) || undefined,
                    codigoProveedor: getCellVal(cCodProv) || undefined,
                    unidadBaseId: unidad?.id,
                    activo: estadoVal !== 'inactivo',
                    estado: constants_1.Status.ACTIVE,
                    transaccion: constants_1.Transacccion.CREAR,
                    usuarioCreacion,
                }));
                importados++;
            }
            catch (e) {
                errores.push({ fila: i, error: e?.message || 'Error desconocido' });
            }
        }
        return { importados, errores };
    }
};
ImportExportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __param(1, (0, typeorm_1.InjectRepository)(categoria_producto_entity_1.CategoriaProducto)),
    __param(2, (0, typeorm_1.InjectRepository)(subcategoria_producto_entity_1.SubcategoriaProducto)),
    __param(3, (0, typeorm_1.InjectRepository)(unidad_medida_entity_1.UnidadMedida)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ImportExportService);
exports.ImportExportService = ImportExportService;
//# sourceMappingURL=importexport.service.js.map