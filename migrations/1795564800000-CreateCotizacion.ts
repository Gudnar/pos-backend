import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCotizacion1795564800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const auditoria = `
        _estado varchar(30) NOT NULL,
        _transaccion varchar(30) NOT NULL,
        _usuario_creacion bigint NOT NULL,
        _fecha_creacion timestamp without time zone NOT NULL DEFAULT now(),
        _usuario_modificacion bigint,
        _fecha_modificacion timestamp without time zone DEFAULT now()`

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cotizacion (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        cliente_id bigint NOT NULL,
        sucursal_id uuid NOT NULL,
        usuario_id bigint NOT NULL,
        nro_cotizacion varchar(50) NOT NULL,
        fecha date NOT NULL,
        valido_hasta date,
        estado_cotizacion varchar(20) NOT NULL DEFAULT 'VIGENTE',
        tipo_precio varchar(10),
        contacto_cliente_id uuid,
        nombre_cliente varchar(200),
        nit_ci varchar(30),
        telefono_cliente varchar(60),
        observaciones text,
        total decimal(14,2) NOT NULL,
        venta_id uuid,
        fecha_conversion timestamp without time zone,
        ${auditoria},
        CONSTRAINT pk_cotizacion PRIMARY KEY (id)
      )
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_cotizacion_nro ON cotizacion (cliente_id, nro_cotizacion)`)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cotizacion_detalle (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        cliente_id bigint NOT NULL,
        cotizacion_id uuid NOT NULL,
        producto_id uuid NOT NULL,
        lote_id uuid,
        nombre_producto varchar(200) NOT NULL,
        cantidad decimal(14,4) NOT NULL,
        precio_unitario decimal(14,4) NOT NULL,
        subtotal decimal(14,2) NOT NULL,
        orden int NOT NULL DEFAULT 0,
        ${auditoria},
        CONSTRAINT pk_cotizacion_detalle PRIMARY KEY (id)
      )
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_cotizacion_detalle_cot ON cotizacion_detalle (cotizacion_id)`)

    await queryRunner.query(`ALTER TABLE venta ADD COLUMN IF NOT EXISTS cotizacion_id uuid`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE venta DROP COLUMN IF EXISTS cotizacion_id`)
    await queryRunner.query(`DROP TABLE IF EXISTS cotizacion_detalle`)
    await queryRunner.query(`DROP TABLE IF EXISTS cotizacion`)
  }
}
