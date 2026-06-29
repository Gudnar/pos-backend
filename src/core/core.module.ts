import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthenticationModule } from './authentication/authentication.module'
import { UsuarioModule } from './usuario/usuario.module'
import { AgenteModule } from './agente/agente.module'
import { HerramientaModule } from './herramienta/herramienta.module'
import { ConversacionModule } from './conversacion/conversacion.module'
import { ConfiguracionModule } from './configuracion/configuracion.module'
import { WhatsappModule } from './whatsapp/whatsapp.module'
import { ClienteModule } from './cliente/cliente.module'
import { MiCuentaModule } from './mi-cuenta/mi-cuenta.module'
import { CitasMedicasModule } from './citas-medicas/citas-medicas.module'
import { PacientesModule } from './pacientes/pacientes.module'
import { EspecialistaModule } from './especialista/especialista.module'
import { CampanaModule } from './campana/campana.module'
import { FacebookModule } from './facebook/facebook.module'
import { ProveedoresModule } from './proveedores/proveedores.module'
import { ContactosClientesModule } from './contactos-clientes/contactos-clientes.module'
import { RepresentantesModule } from './representantes/representantes.module'
import { CategoriasProductoModule } from './categorias-producto/categorias-producto.module'
import { SubcategoriasProductoModule } from './subcategorias-producto/subcategorias-producto.module'
import { ProductosModule } from './productos/productos.module'
import { UnidadesMedidaModule } from './unidades-medida/unidades-medida.module'
import { SucursalesModule } from './sucursales/sucursales.module'
import { UsuariosSistemaModule } from './usuarios-sistema/usuarios-sistema.module'
import { LotesModule } from './lotes/lotes.module'
import { MovimientosStockModule } from './movimientos-stock/movimientos-stock.module'
import { CajaModule } from './caja/caja.module'
import { VentasModule } from './ventas/ventas.module'
import { ComprasModule } from './compras/compras.module'
import { LogisticaMonedasModule } from './logistica-monedas/logistica-monedas.module'
import { LogisticaTiposGastoModule } from './logistica-tipos-gasto/logistica-tipos-gasto.module'
import { LogisticaOrdenesModule } from './logistica-ordenes/logistica-ordenes.module'
import { LogisticaPaisesModule } from './logistica-paises/logistica-paises.module'
import { FuentesModule } from './fuentes/fuentes.module'
import { IngresosModule } from './ingresos/ingresos.module'
import { GastosModule } from './gastos/gastos.module'
import { WhatsappFlowsModule } from './whatsapp-flows/whatsapp-flows.module'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
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
    AuthenticationModule,
    UsuarioModule,
    AgenteModule,
    HerramientaModule,
    ConversacionModule,
    ConfiguracionModule,
    WhatsappModule,
    ClienteModule,
    MiCuentaModule,
    CitasMedicasModule,
    PacientesModule,
    EspecialistaModule,
    CampanaModule,
    FacebookModule,
    ProveedoresModule,
    ContactosClientesModule,
    RepresentantesModule,
    CategoriasProductoModule,
    SubcategoriasProductoModule,
    ProductosModule,
    UnidadesMedidaModule,
    SucursalesModule,
    UsuariosSistemaModule,
    LotesModule,
    MovimientosStockModule,
    CajaModule,
    VentasModule,
    ComprasModule,
    LogisticaMonedasModule,
    LogisticaTiposGastoModule,
    LogisticaOrdenesModule,
    LogisticaPaisesModule,
    FuentesModule,
    IngresosModule,
    GastosModule,
    WhatsappFlowsModule,
  ],
})
export class CoreModule {}
