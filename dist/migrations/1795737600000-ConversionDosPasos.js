"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversionDosPasos1795737600000 = void 0;
const TABLAS = ['logistica_pago_proveedor', 'logistica_gasto', 'pago_proveedor'];
class ConversionDosPasos1795737600000 {
    async up(queryRunner) {
        for (const t of TABLAS) {
            await queryRunner.query(`ALTER TABLE ${t} ALTER COLUMN tipo_cambio TYPE numeric(20,12)`);
            await queryRunner.query(`
        ALTER TABLE ${t}
          ADD COLUMN IF NOT EXISTS tc_paso1 numeric(20,10),
          ADD COLUMN IF NOT EXISTS tc_operacion varchar(12),
          ADD COLUMN IF NOT EXISTS moneda_intermedia_id uuid,
          ADD COLUMN IF NOT EXISTS monto_intermedio numeric(18,2),
          ADD COLUMN IF NOT EXISTS tc_paso2 numeric(20,10),
          ADD COLUMN IF NOT EXISTS tc_paso2_operacion varchar(12)
      `);
        }
        await queryRunner.query(`UPDATE logistica_pago_proveedor SET monto_moneda_base = ROUND(monto * tipo_cambio, 2) WHERE monto_moneda_base IS NULL`);
        await queryRunner.query(`UPDATE logistica_gasto SET monto_moneda_base = ROUND(monto * COALESCE(NULLIF(cantidad, 0), 1) * tipo_cambio, 2) WHERE monto_moneda_base IS NULL`);
    }
    async down(queryRunner) {
        for (const t of TABLAS) {
            await queryRunner.query(`
        ALTER TABLE ${t}
          DROP COLUMN IF EXISTS tc_paso1, DROP COLUMN IF EXISTS tc_operacion,
          DROP COLUMN IF EXISTS moneda_intermedia_id, DROP COLUMN IF EXISTS monto_intermedio,
          DROP COLUMN IF EXISTS tc_paso2, DROP COLUMN IF EXISTS tc_paso2_operacion
      `);
        }
    }
}
exports.ConversionDosPasos1795737600000 = ConversionDosPasos1795737600000;
//# sourceMappingURL=1795737600000-ConversionDosPasos.js.map