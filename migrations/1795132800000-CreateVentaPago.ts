import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateVentaPago1795132800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS venta_pago (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        cliente_id bigint NOT NULL,
        venta_id uuid NOT NULL,
        origen varchar(10) NOT NULL,
        fecha date NOT NULL,
        metodo_pago varchar(20) NOT NULL,
        monto decimal(14,2) NOT NULL,
        referencia varchar(200),
        fuente_id uuid,
        observaciones text,
        comprobante_nombre varchar(255),
        comprobante_mime varchar(100),
        comprobante_tamano int,
        comprobante_ruta varchar(500),
        _estado varchar(30) NOT NULL,
        _transaccion varchar(30) NOT NULL,
        _usuario_creacion bigint NOT NULL,
        _fecha_creacion timestamp without time zone NOT NULL DEFAULT now(),
        _usuario_modificacion bigint,
        _fecha_modificacion timestamp without time zone DEFAULT now(),
        CONSTRAINT pk_venta_pago PRIMARY KEY (id)
      )
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_venta_pago_venta ON venta_pago (venta_id)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS venta_pago`)
  }
}
