import { BadRequestException } from '@nestjs/common'

/**
 * Conversión de un pago/gasto a moneda base (Bs), directa o en dos pasos.
 *
 *  Directa:   monto [moneda pago] --(tc1)--> Bs
 *  Dos pasos: monto [moneda pago] --(tc1)--> monto [moneda intermedia] --(tc2)--> Bs
 *
 * Cada tipo de cambio puede aplicarse multiplicando ("1 CLP = 0.00108 USD") o
 * dividiendo ("1 USD = 925 CLP"), así se ingresa tal como lo da el banco/casa de cambio.
 * Cada paso se redondea a centavos, que es lo que efectivamente se paga.
 */

export const OPERACIONES_TC = ['MULTIPLICAR', 'DIVIDIR'] as const
export type OperacionTc = typeof OPERACIONES_TC[number]

export const aCentavos = (n: number): number => Math.round((Number(n) + Number.EPSILON) * 100) / 100

export interface EntradaConversion {
  tipoCambio?: number | null
  tcOperacion?: string | null
  monedaIntermediaId?: string | null
  tcPaso2?: number | null
  tcPaso2Operacion?: string | null
}

export interface ResultadoConversion {
  /** TC efectivo moneda pago → Bs (montoBase / total), con 12 decimales */
  tipoCambio: number
  tcPaso1: number
  tcOperacion: OperacionTc
  monedaIntermediaId: string | null
  montoIntermedio: number | null
  tcPaso2: number | null
  tcPaso2Operacion: OperacionTc | null
  montoBase: number
}

const aplicar = (x: number, tc: number, op: OperacionTc) => (op === 'DIVIDIR' ? x / tc : x * tc)
const op = (v?: string | null): OperacionTc => (v === 'DIVIDIR' ? 'DIVIDIR' : 'MULTIPLICAR')

export function calcularConversion(total: number, e: EntradaConversion): ResultadoConversion {
  const monto = Number(total)
  const tc1 = Number(e.tipoCambio)
  if (!(tc1 > 0)) throw new BadRequestException('El tipo de cambio debe ser mayor a 0.')
  const op1 = op(e.tcOperacion)

  let montoIntermedio: number | null = null
  let tc2: number | null = null
  let op2: OperacionTc | null = null
  let montoBase: number

  if (e.monedaIntermediaId) {
    tc2 = Number(e.tcPaso2)
    if (!(tc2 > 0)) throw new BadRequestException('Indica el tipo de cambio de la moneda intermedia a Bs.')
    op2 = op(e.tcPaso2Operacion)
    montoIntermedio = aCentavos(aplicar(monto, tc1, op1))
    montoBase = aCentavos(aplicar(montoIntermedio, tc2, op2))
  } else {
    montoBase = aCentavos(aplicar(monto, tc1, op1))
  }

  const tipoCambio = monto > 0 ? Number((montoBase / monto).toFixed(12)) : (op1 === 'DIVIDIR' ? 1 / tc1 : tc1)

  return {
    tipoCambio,
    tcPaso1: tc1,
    tcOperacion: op1,
    monedaIntermediaId: e.monedaIntermediaId || null,
    montoIntermedio,
    tcPaso2: tc2,
    tcPaso2Operacion: op2,
    montoBase,
  }
}

/** Campos a persistir en la entidad (pago/gasto) a partir del resultado */
export function camposConversion(r: ResultadoConversion) {
  return {
    tipoCambio: r.tipoCambio,
    tcPaso1: r.tcPaso1,
    tcOperacion: r.tcOperacion,
    monedaIntermediaId: r.monedaIntermediaId,
    montoIntermedio: r.montoIntermedio,
    tcPaso2: r.tcPaso2,
    tcPaso2Operacion: r.tcPaso2Operacion,
  }
}
