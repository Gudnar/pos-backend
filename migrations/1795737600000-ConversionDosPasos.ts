import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Pagos a proveedor (logística y compras), gastos logísticos e ítems de la orden:
 *  - tipo_cambio con 12 decimales (el TC efectivo CLP→Bs es muy pequeño y con 6 se perdían Bs)
 *  - datos de la conversión directa o en dos pasos (CLP → USD → Bs)
 *  - monto en Bs guardado para registros antiguos que no lo tenían
 */
const TABLAS = ['logistica_pago_proveedor', 'logistica_gasto', 'pago_proveedor', 'logistica_item_orden']

export class ConversionDosPasos1795737600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const t of TABLAS) {
      await queryRunner.query(`ALTER TABLE ${t} ALTER COLUMN tipo_cambio TYPE numeric(20,12)`)
      await queryRunner.query(`
        ALTER TABLE ${t}
          ADD COLUMN IF NOT EXISTS tc_paso1 numeric(20,10),
          ADD COLUMN IF NOT EXISTS tc_operacion varchar(12),
          ADD COLUMN IF NOT EXISTS moneda_intermedia_id uuid,
          ADD COLUMN IF NOT EXISTS monto_intermedio numeric(18,2),
          ADD COLUMN IF NOT EXISTS tc_paso2 numeric(20,10),
          ADD COLUMN IF NOT EXISTS tc_paso2_operacion varchar(12)
      `)
    }
    // Ítems: el total de la línea manda; precio unitario con 10 decimales
    await queryRunner.query(`ALTER TABLE logistica_item_orden ALTER COLUMN precio_unitario_moneda_compra TYPE numeric(20,10)`)
    await queryRunner.query(`ALTER TABLE logistica_item_orden ALTER COLUMN precio_unitario_moneda_base TYPE numeric(20,10)`)
    await queryRunner.query(`UPDATE logistica_pago_proveedor SET monto_moneda_base = ROUND(monto * tipo_cambio, 2) WHERE monto_moneda_base IS NULL`)
    await queryRunner.query(`UPDATE logistica_gasto SET monto_moneda_base = ROUND(monto * COALESCE(NULLIF(cantidad, 0), 1) * tipo_cambio, 2) WHERE monto_moneda_base IS NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const t of TABLAS) {
      await queryRunner.query(`
        ALTER TABLE ${t}
          DROP COLUMN IF EXISTS tc_paso1, DROP COLUMN IF EXISTS tc_operacion,
          DROP COLUMN IF EXISTS moneda_intermedia_id, DROP COLUMN IF EXISTS monto_intermedio,
          DROP COLUMN IF EXISTS tc_paso2, DROP COLUMN IF EXISTS tc_paso2_operacion
      `)
    }
  }
}
