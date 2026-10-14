import type { Compra } from "../entities/compra";
import { FormaPago } from "../entities/forma-pago";
import { TipoPase } from "../entities/tipo-pase";
import type { Usuario } from "../entities/usuario";
import type { Mail } from "../integrations/notificador";
import { formatearFecha } from "../utils/fechas";
import formatearMonto from "../utils/montos";

const NOMBRES_PASE: Record<TipoPase, string> = {
  [TipoPase.COMUN]: "Común",
  [TipoPase.VIP]: "VIP",
};

const NOMBRES_FORMA_PAGO: Record<FormaPago, string> = {
  [FormaPago.EFECTIVO]: "Efectivo (se abona en boletería)",
  [FormaPago.TARJETA]: "Tarjeta (Mercado Pago)",
};

export function construirMensajeConfirmacion(compra: Compra): string {
  return `Compraste ${compra.entradas.length} entradas para el ${formatearFecha(compra.fechaVisita)}`;
}

export function construirMailConfirmacion(
  compra: Compra,
  usuario: Usuario,
): Mail {
  const detalle = compra.entradas.map(
    (entrada, indice) =>
      `Visitante ${indice + 1}: ${entrada.edad} años - Pase ${NOMBRES_PASE[entrada.tipoPase]} - ${formatearMonto(entrada.precio)}`,
  );

  return {
    destinatario: usuario.email,
    asunto: `Confirmación de compra #${compra.id} - EcoHarmony Park`,
    cuerpo: [
      `¡Hola ${usuario.nombre}! ${construirMensajeConfirmacion(compra)}.`,
      "",
      `Cantidad de entradas: ${compra.entradas.length}`,
      `Fecha de visita: ${formatearFecha(compra.fechaVisita)}`,
      "",
      ...detalle,
      "",
      `Forma de pago: ${NOMBRES_FORMA_PAGO[compra.formaPago]}`,
      `Total: ${formatearMonto(compra.total)}`,
    ].join("\n"),
  };
}
