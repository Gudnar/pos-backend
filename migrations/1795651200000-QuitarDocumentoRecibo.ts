import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * El tipo de documento RECIBO se eliminó (los comprobantes van en cada pago).
 * Los recibos ya subidos pasan a OTROS cuando la venta aún no tiene un archivo en OTROS.
 */
export class QuitarDocumentoRecibo1795651200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE venta_documento d SET tipo = 'OTROS', _transaccion = 'ACTUALIZAR'
      WHERE d.tipo = 'RECIBO' AND d._estado = 'ACTIVO'
        AND NOT EXISTS (
          SELECT 1 FROM venta_documento o
          WHERE o.venta_id = d.venta_id AND o.tipo = 'OTROS' AND o._estado = 'ACTIVO'
        )
    `)
  }

  public async down(): Promise<void> {
    // No se puede distinguir qué archivos de OTROS eran recibos
  }
}
