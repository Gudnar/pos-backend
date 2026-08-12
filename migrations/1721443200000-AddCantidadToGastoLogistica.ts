import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddCantidadToGastoLogistica1721443200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('logistica_gasto')

    // Verificar si la columna ya existe
    const columnExists = table?.columns.some(col => col.name === 'cantidad')

    if (!columnExists) {
      await queryRunner.addColumn(
        'logistica_gasto',
        new TableColumn({
          name: 'cantidad',
          type: 'int',
          default: 1,
          isNullable: false,
        }),
      )

      // Actualizar el campo monto_moneda_base para todos los registros existentes
      // Multiplicar por la cantidad (que ahora es 1 por defecto)
      await queryRunner.query(`
        UPDATE logistica_gasto
        SET monto_moneda_base = monto * cantidad * tipo_cambio
        WHERE monto_moneda_base IS NOT NULL
      `)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('logistica_gasto', 'cantidad')
  }
}
