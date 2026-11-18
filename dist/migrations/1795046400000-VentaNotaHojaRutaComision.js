"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentaNotaHojaRutaComision1795046400000 = void 0;
class VentaNotaHojaRutaComision1795046400000 {
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE venta
        ADD COLUMN IF NOT EXISTS nit_ci varchar(30),
        ADD COLUMN IF NOT EXISTS telefono_cliente varchar(60),
        ADD COLUMN IF NOT EXISTS direccion_cliente varchar(300),
        ADD COLUMN IF NOT EXISTS nro_pesaje varchar(50),
        ADD COLUMN IF NOT EXISTS nro_factura varchar(50),
        ADD COLUMN IF NOT EXISTS monto_efectivo decimal(14,2)
    `);
        const auditoria = `
        _estado varchar(30) NOT NULL,
        _transaccion varchar(30) NOT NULL,
        _usuario_creacion bigint NOT NULL,
        _fecha_creacion timestamp without time zone NOT NULL DEFAULT now(),
        _usuario_modificacion bigint,
        _fecha_modificacion timestamp without time zone DEFAULT now()`;
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS venta_hoja_ruta (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        cliente_id bigint NOT NULL,
        venta_id uuid NOT NULL,
        nro_hoja_ruta int NOT NULL,
        empresa_transporte varchar(200),
        conductor varchar(200),
        conductor_ci varchar(30),
        conductor_celular varchar(30),
        placa varchar(20),
        vehiculo varchar(150),
        origen varchar(300),
        destino varchar(300),
        fecha_salida date,
        observaciones text,
        ${auditoria},
        CONSTRAINT pk_venta_hoja_ruta PRIMARY KEY (id)
      )
    `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_venta_hoja_ruta_venta ON venta_hoja_ruta (venta_id)`);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS venta_comision (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        cliente_id bigint NOT NULL,
        venta_id uuid NOT NULL,
        contacto_cliente_id uuid NOT NULL,
        representante_id uuid NOT NULL,
        beneficiario_nombre varchar(200) NOT NULL,
        beneficiario_cargo varchar(150),
        monto decimal(14,2) NOT NULL,
        fuente_id uuid NOT NULL,
        fecha date NOT NULL,
        observaciones text,
        ${auditoria},
        CONSTRAINT pk_venta_comision PRIMARY KEY (id)
      )
    `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_venta_comision_venta ON venta_comision (venta_id)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS venta_comision`);
        await queryRunner.query(`DROP TABLE IF EXISTS venta_hoja_ruta`);
        await queryRunner.query(`
      ALTER TABLE venta
        DROP COLUMN IF EXISTS nit_ci,
        DROP COLUMN IF EXISTS telefono_cliente,
        DROP COLUMN IF EXISTS direccion_cliente,
        DROP COLUMN IF EXISTS nro_pesaje,
        DROP COLUMN IF EXISTS nro_factura,
        DROP COLUMN IF EXISTS monto_efectivo
    `);
    }
}
exports.VentaNotaHojaRutaComision1795046400000 = VentaNotaHojaRutaComision1795046400000;
//# sourceMappingURL=1795046400000-VentaNotaHojaRutaComision.js.map