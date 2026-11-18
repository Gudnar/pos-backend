import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateVentaDocumento1792396800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS venta_documento (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        cliente_id bigint NOT NULL,
        venta_id uuid NOT NULL,
        tipo varchar(30) NOT NULL,
        nombre_original varchar(255) NOT NULL,
        mime_type varchar(100) NOT NULL,
        tamano int NOT NULL,
        ruta_archivo varchar(500) NOT NULL,
        _estado varchar(30) NOT NULL,
        _transaccion varchar(30) NOT NULL,
        _usuario_creacion bigint NOT NULL,
        _fecha_creacion timestamp without time zone NOT NULL DEFAULT now(),
        _usuario_modificacion bigint,
        _fecha_modificacion timestamp without time zone DEFAULT now(),
        CONSTRAINT pk_venta_documento PRIMARY KEY (id)
      )
    `)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_venta_documento_venta_tipo ON venta_documento (venta_id, tipo)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS venta_documento`)
  }
}
