import type { EntradaSolicitada } from "../entities/entrada-solicitada";
import { TipoPase } from "../entities/tipo-pase";

const PRECIOS_BASE: Record<TipoPase, number> = {
  [TipoPase.COMUN]: 10000,
  [TipoPase.VIP]: 20000,
};

const EDAD_MAXIMA_GRATIS = 3;
const EDAD_MAXIMA_MENOR = 15;
const EDAD_MINIMA_MAYOR = 60;
const FACTOR_MEDIO_PRECIO = 0.5;

export function calcularPrecioEntrada(entrada: EntradaSolicitada): number {
  const precioBase = PRECIOS_BASE[entrada.tipoPase];

  if (entrada.edad <= EDAD_MAXIMA_GRATIS) {
    return 0;
  }

  if (entrada.edad <= EDAD_MAXIMA_MENOR || entrada.edad >= EDAD_MINIMA_MAYOR) {
    return precioBase * FACTOR_MEDIO_PRECIO;
  }

  return precioBase;
}

export function calcularTotal(entradas: EntradaSolicitada[]): number {
  return entradas.reduce(
    (total, entrada) => total + calcularPrecioEntrada(entrada),
    0,
  );
}
