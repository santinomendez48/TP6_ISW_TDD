import type { EntradaSolicitada } from "../entities/entrada-solicitada";
import { TipoPase } from "../entities/tipo-pase";

const PRECIOS_BASE: Record<TipoPase, number> = {
  [TipoPase.COMUN]: 10000,
  [TipoPase.VIP]: 20000,
};

export function calcularPrecioEntrada(entrada: EntradaSolicitada): number {
  return PRECIOS_BASE[entrada.tipoPase];
}
