"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.camposConversion = exports.calcularConversion = exports.aCentavos = exports.OPERACIONES_TC = void 0;
const common_1 = require("@nestjs/common");
exports.OPERACIONES_TC = ['MULTIPLICAR', 'DIVIDIR'];
const aCentavos = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
exports.aCentavos = aCentavos;
const aplicar = (x, tc, op) => (op === 'DIVIDIR' ? x / tc : x * tc);
const op = (v) => (v === 'DIVIDIR' ? 'DIVIDIR' : 'MULTIPLICAR');
function calcularConversion(total, e) {
    const monto = Number(total);
    const tc1 = Number(e.tipoCambio);
    if (!(tc1 > 0))
        throw new common_1.BadRequestException('El tipo de cambio debe ser mayor a 0.');
    const op1 = op(e.tcOperacion);
    let montoIntermedio = null;
    let tc2 = null;
    let op2 = null;
    let montoBase;
    if (e.monedaIntermediaId) {
        tc2 = Number(e.tcPaso2);
        if (!(tc2 > 0))
            throw new common_1.BadRequestException('Indica el tipo de cambio de la moneda intermedia a Bs.');
        op2 = op(e.tcPaso2Operacion);
        montoIntermedio = (0, exports.aCentavos)(aplicar(monto, tc1, op1));
        montoBase = (0, exports.aCentavos)(aplicar(montoIntermedio, tc2, op2));
    }
    else {
        montoBase = (0, exports.aCentavos)(aplicar(monto, tc1, op1));
    }
    const tipoCambio = monto > 0 ? Number((montoBase / monto).toFixed(12)) : (op1 === 'DIVIDIR' ? 1 / tc1 : tc1);
    return {
        tipoCambio,
        tcPaso1: tc1,
        tcOperacion: op1,
        monedaIntermediaId: e.monedaIntermediaId || null,
        montoIntermedio,
        tcPaso2: tc2,
        tcPaso2Operacion: op2,
        montoBase,
    };
}
exports.calcularConversion = calcularConversion;
function camposConversion(r) {
    return {
        tipoCambio: r.tipoCambio,
        tcPaso1: r.tcPaso1,
        tcOperacion: r.tcOperacion,
        monedaIntermediaId: r.monedaIntermediaId,
        montoIntermedio: r.montoIntermedio,
        tcPaso2: r.tcPaso2,
        tcPaso2Operacion: r.tcPaso2Operacion,
    };
}
exports.camposConversion = camposConversion;
//# sourceMappingURL=conversion-moneda.js.map