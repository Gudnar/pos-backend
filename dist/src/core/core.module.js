"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const authentication_module_1 = require("./authentication/authentication.module");
const usuario_module_1 = require("./usuario/usuario.module");
const agente_module_1 = require("./agente/agente.module");
const herramienta_module_1 = require("./herramienta/herramienta.module");
const conversacion_module_1 = require("./conversacion/conversacion.module");
const configuracion_module_1 = require("./configuracion/configuracion.module");
const whatsapp_module_1 = require("./whatsapp/whatsapp.module");
const cliente_module_1 = require("./cliente/cliente.module");
const mi_cuenta_module_1 = require("./mi-cuenta/mi-cuenta.module");
const citas_medicas_module_1 = require("./citas-medicas/citas-medicas.module");
const pacientes_module_1 = require("./pacientes/pacientes.module");
const especialista_module_1 = require("./especialista/especialista.module");
const campana_module_1 = require("./campana/campana.module");
const facebook_module_1 = require("./facebook/facebook.module");
const proveedores_module_1 = require("./proveedores/proveedores.module");
const contactos_clientes_module_1 = require("./contactos-clientes/contactos-clientes.module");
const representantes_module_1 = require("./representantes/representantes.module");
const categorias_producto_module_1 = require("./categorias-producto/categorias-producto.module");
const subcategorias_producto_module_1 = require("./subcategorias-producto/subcategorias-producto.module");
const productos_module_1 = require("./productos/productos.module");
const unidades_medida_module_1 = require("./unidades-medida/unidades-medida.module");
const sucursales_module_1 = require("./sucursales/sucursales.module");
const usuarios_sistema_module_1 = require("./usuarios-sistema/usuarios-sistema.module");
const lotes_module_1 = require("./lotes/lotes.module");
const movimientos_stock_module_1 = require("./movimientos-stock/movimientos-stock.module");
const caja_module_1 = require("./caja/caja.module");
const ventas_module_1 = require("./ventas/ventas.module");
const compras_module_1 = require("./compras/compras.module");
const logistica_monedas_module_1 = require("./logistica-monedas/logistica-monedas.module");
const logistica_tipos_gasto_module_1 = require("./logistica-tipos-gasto/logistica-tipos-gasto.module");
const logistica_ordenes_module_1 = require("./logistica-ordenes/logistica-ordenes.module");
const logistica_paises_module_1 = require("./logistica-paises/logistica-paises.module");
const fuentes_module_1 = require("./fuentes/fuentes.module");
const ingresos_module_1 = require("./ingresos/ingresos.module");
const gastos_module_1 = require("./gastos/gastos.module");
const whatsapp_flows_module_1 = require("./whatsapp-flows/whatsapp-flows.module");
let CoreModule = class CoreModule {
};
CoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DB_HOST') || 'localhost',
                    port: Number(config.get('DB_PORT')) || 5432,
                    username: config.get('DB_USERNAME') || 'postgres',
                    password: config.get('DB_PASSWORD') || 'postgres',
                    database: config.get('DB_DATABASE') || 'ide_ia_db',
                    schema: config.get('DB_SCHEMA') || 'public',
                    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                    synchronize: config.get('NODE_ENV') !== 'production',
                    logging: config.get('LOG_SQL') === 'true',
                }),
            }),
            authentication_module_1.AuthenticationModule,
            usuario_module_1.UsuarioModule,
            agente_module_1.AgenteModule,
            herramienta_module_1.HerramientaModule,
            conversacion_module_1.ConversacionModule,
            configuracion_module_1.ConfiguracionModule,
            whatsapp_module_1.WhatsappModule,
            cliente_module_1.ClienteModule,
            mi_cuenta_module_1.MiCuentaModule,
            citas_medicas_module_1.CitasMedicasModule,
            pacientes_module_1.PacientesModule,
            especialista_module_1.EspecialistaModule,
            campana_module_1.CampanaModule,
            facebook_module_1.FacebookModule,
            proveedores_module_1.ProveedoresModule,
            contactos_clientes_module_1.ContactosClientesModule,
            representantes_module_1.RepresentantesModule,
            categorias_producto_module_1.CategoriasProductoModule,
            subcategorias_producto_module_1.SubcategoriasProductoModule,
            productos_module_1.ProductosModule,
            unidades_medida_module_1.UnidadesMedidaModule,
            sucursales_module_1.SucursalesModule,
            usuarios_sistema_module_1.UsuariosSistemaModule,
            lotes_module_1.LotesModule,
            movimientos_stock_module_1.MovimientosStockModule,
            caja_module_1.CajaModule,
            ventas_module_1.VentasModule,
            compras_module_1.ComprasModule,
            logistica_monedas_module_1.LogisticaMonedasModule,
            logistica_tipos_gasto_module_1.LogisticaTiposGastoModule,
            logistica_ordenes_module_1.LogisticaOrdenesModule,
            logistica_paises_module_1.LogisticaPaisesModule,
            fuentes_module_1.FuentesModule,
            ingresos_module_1.IngresosModule,
            gastos_module_1.GastosModule,
            whatsapp_flows_module_1.WhatsappFlowsModule,
        ],
    })
], CoreModule);
exports.CoreModule = CoreModule;
//# sourceMappingURL=core.module.js.map