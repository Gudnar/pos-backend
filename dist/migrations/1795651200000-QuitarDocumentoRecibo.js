"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuitarDocumentoRecibo1795651200000 = void 0;
class QuitarDocumentoRecibo1795651200000 {
    async up(queryRunner) {
        await queryRunner.query(`
      UPDATE venta_documento d SET tipo = 'OTROS', _transaccion = 'ACTUALIZAR'
      WHERE d.tipo = 'RECIBO' AND d._estado = 'ACTIVO'
        AND NOT EXISTS (
          SELECT 1 FROM venta_documento o
          WHERE o.venta_id = d.venta_id AND o.tipo = 'OTROS' AND o._estado = 'ACTIVO'
        )
    `);
    }
    async down() {
    }
}
exports.QuitarDocumentoRecibo1795651200000 = QuitarDocumentoRecibo1795651200000;
//# sourceMappingURL=1795651200000-QuitarDocumentoRecibo.js.map