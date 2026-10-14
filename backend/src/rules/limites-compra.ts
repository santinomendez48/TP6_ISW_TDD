import type { EntradaSolicitada } from "../entities/entrada-solicitada";
import { CantidadInvalidaError } from "../errors/errores-negocio";

const MIN_ENTRADAS_POR_COMPRA = 1;
const MAX_ENTRADAS_POR_COMPRA = 10;

export function validarEntradas(entradas: EntradaSolicitada[]): void {
  if (
    entradas.length < MIN_ENTRADAS_POR_COMPRA ||
    entradas.length > MAX_ENTRADAS_POR_COMPRA
  ) {
    throw new CantidadInvalidaError(
      `La cantidad de entradas debe estar entre ${MIN_ENTRADAS_POR_COMPRA} y ${MAX_ENTRADAS_POR_COMPRA}`,
    );
  }
}
