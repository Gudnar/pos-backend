"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const producto_entity_1 = require("../entity/producto.entity");
const precio_producto_entity_1 = require("../entity/precio-producto.entity");
const categoria_producto_entity_1 = require("../../categorias-producto/entity/categoria-producto.entity");
const subcategoria_producto_entity_1 = require("../../subcategorias-producto/entity/subcategoria-producto.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let ProductosService = class ProductosService {
    constructor(repo, precioRepo, categoriaRepo, subcategoriaRepo) {
        this.repo = repo;
        this.precioRepo = precioRepo;
        this.categoriaRepo = categoriaRepo;
        this.subcategoriaRepo = subcategoriaRepo;
    }
    async listar(clienteId, subcategoriaId, q, soloActivos = false) {
        const qb = this.repo
            .createQueryBuilder('p')
            .where('p.cliente_id = :clienteId AND p._estado = :estado', { clienteId, estado: constants_1.Status.ACTIVE })
            .orderBy('p.nombre', 'ASC');
        if (soloActivos)
            qb.andWhere('p.activo = true');
        if (subcategoriaId) {
            qb.andWhere('p.subcategoria_id = :subcategoriaId', { subcategoriaId });
        }
        if (q && q.trim()) {
            qb.andWhere('(LOWER(p.nombre) LIKE LOWER(:q) OR LOWER(p.codigo_tienda) LIKE LOWER(:q) OR LOWER(p.codigo_barras) LIKE LOWER(:q))', { q: `%${q.trim()}%` });
        }
        return qb.getMany();
    }
    async obtener(clienteId, id) {
        const p = await this.repo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!p)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        return p;
    }
    async crear(clienteId, dto, usuarioCreacion) {
        return this.repo.save(this.repo.create({
            ...dto,
            clienteId,
            activo: dto.estado !== 'inactivo',
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
    }
    async actualizar(clienteId, id, dto, usuarioModificacion) {
        const p = await this.obtener(clienteId, id);
        const { estado: estadoDto, ...rest } = dto;
        const activo = estadoDto !== undefined ? estadoDto !== 'inactivo' : p.activo;
        Object.assign(p, { ...rest, activo, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(p);
    }
    async listarParaPOS(clienteId, q) {
        const productos = await this.listar(clienteId, undefined, q, true);
        if (!productos.length)
            return [];
        const ids = productos.map(p => p.id);
        const precios = await this.precioRepo
            .createQueryBuilder('pp')
            .where('pp.cliente_id = :clienteId AND pp.producto_id IN (:...ids) AND pp.activo = true AND pp._estado = :est', {
            clienteId, ids, est: constants_1.Status.ACTIVE,
        })
            .andWhere("pp.tipo = 'VENTA'")
            .orderBy('pp.cantidad_min', 'ASC')
            .getMany();
        const tiersMap = new Map();
        for (const pr of precios) {
            if (!tiersMap.has(pr.productoId))
                tiersMap.set(pr.productoId, []);
            tiersMap.get(pr.productoId).push({
                cantidadMin: pr.cantidadMin,
                cantidadMax: pr.cantidadMax ?? null,
                precio: Number(pr.precio),
            });
        }
        const subcatIds = [...new Set(productos.map(p => p.subcategoriaId).filter(Boolean))];
        const subcategorias = subcatIds.length
            ? await this.subcategoriaRepo.find({ where: { id: (0, typeorm_2.In)(subcatIds) } })
            : [];
        const subcatMap = new Map(subcategorias.map(s => [s.id, s]));
        const catIds = [...new Set(subcategorias.map(s => s.categoriaId).filter(Boolean))];
        const categorias = catIds.length
            ? await this.categoriaRepo.find({ where: { id: (0, typeorm_2.In)(catIds) } })
            : [];
        const catMap = new Map(categorias.map(c => [c.id, c]));
        return productos.map(p => {
            const subcat = subcatMap.get(p.subcategoriaId);
            const cat = subcat ? catMap.get(subcat.categoriaId) : undefined;
            const tiersSF = tiersMap.get(p.id) ?? [];
            const pctFactura = Number(p.porcentajeFactura || 0);
            const tiersCF = pctFactura > 0
                ? tiersSF.map(t => ({ ...t, precio: Number((t.precio * (1 + pctFactura / 100)).toFixed(2)) }))
                : [];
            return {
                id: p.id,
                nombre: p.nombre,
                codigoTienda: p.codigoTienda,
                codigoBarras: p.codigoBarras,
                unidadMedida: p.unidadMedida,
                requiereLote: p.requiereLote,
                metodoPicking: p.metodoPicking,
                porcentajeFactura: pctFactura,
                tiersSF,
                tiersCF,
                precio: tiersSF[0]?.precio ?? null,
                nombreCategoria: cat?.nombre ?? null,
                nombreSubcategoria: subcat?.nombre ?? null,
            };
        });
    }
    async eliminar(clienteId, id, usuarioModificacion) {
        const p = await this.obtener(clienteId, id);
        Object.assign(p, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.repo.save(p);
    }
};
ProductosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __param(1, (0, typeorm_1.InjectRepository)(precio_producto_entity_1.PrecioProducto)),
    __param(2, (0, typeorm_1.InjectRepository)(categoria_producto_entity_1.CategoriaProducto)),
    __param(3, (0, typeorm_1.InjectRepository)(subcategoria_producto_entity_1.SubcategoriaProducto)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductosService);
exports.ProductosService = ProductosService;
//# sourceMappingURL=productos.service.js.map