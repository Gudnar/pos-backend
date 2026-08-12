"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCantidadToGastoLogistica1721443200000 = void 0;
const typeorm_1 = require("typeorm");
class AddCantidadToGastoLogistica1721443200000 {
    async up(queryRunner) {
        const table = await queryRunner.getTable('logistica_gasto');
        const columnExists = table?.columns.some(col => col.name === 'cantidad');
        if (!columnExists) {
            await queryRunner.addColumn('logistica_gasto', new typeorm_1.TableColumn({
                name: 'cantidad',
                type: 'int',
                default: 1,
                isNullable: false,
            }));
            await queryRunner.query(`
        UPDATE logistica_gasto
        SET monto_moneda_base = monto * cantidad * tipo_cambio
        WHERE monto_moneda_base IS NOT NULL
      `);
        }
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('logistica_gasto', 'cantidad');
    }
}
exports.AddCantidadToGastoLogistica1721443200000 = AddCantidadToGastoLogistica1721443200000;
//# sourceMappingURL=1721443200000-AddCantidadToGastoLogistica.js.map