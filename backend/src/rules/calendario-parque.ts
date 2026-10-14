import type { Momento } from "../entities/momento";
import {
  FechaFueraDeVentanaError,
  FechaInvalidaError,
  FechaPasadaError,
  HorarioDeCompraVencidoError,
  ParqueCerradoError,
} from "../errors/errores-negocio";

const LUNES = 1;
const FERIADOS_FIJOS = ["12-25", "01-01"]; // MM-DD
const HORA_LIMITE_MISMO_DIA = "17:30";
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function aFechaUTC(fecha: string): Date {
  return new Date(`${fecha}T00:00:00Z`);
}

function aTexto(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

function esFechaValida(fecha: string): boolean {
  if (!FORMATO_FECHA.test(fecha)) {
    return false;
  }

  const fechaUTC = aFechaUTC(fecha);
  // Descarta fechas inexistentes como 2026-02-30, que Date corre al mes siguiente
  return !Number.isNaN(fechaUTC.getTime()) && aTexto(fechaUTC) === fecha;
}

// Mismo día del mes siguiente; si no existe, el último día de ese mes.
function mismoDiaDelMesSiguiente(fecha: string): string {
  const [anio = 0, mes = 0, dia = 0] = fecha.split("-").map(Number);
  const ultimoDiaMesSiguiente = new Date(
    Date.UTC(anio, mes + 1, 0),
  ).getUTCDate();

  return aTexto(
    new Date(Date.UTC(anio, mes, Math.min(dia, ultimoDiaMesSiguiente))),
  );
}

export function estaAbierto(fecha: string): boolean {
  const mesYDia = fecha.slice(5);

  return (
    aFechaUTC(fecha).getUTCDay() !== LUNES && !FERIADOS_FIJOS.includes(mesYDia)
  );
}

// Las fechas "YYYY-MM-DD" y horas "HH:mm" se comparan como texto.
export function validarFechaVisita(fecha: string, ahora: Momento): void {
  if (!esFechaValida(fecha)) {
    throw new FechaInvalidaError(`La fecha '${fecha}' no es válida`);
  }

  if (fecha < ahora.fecha) {
    throw new FechaPasadaError("La fecha de visita no puede ser pasada");
  }

  if (fecha > mismoDiaDelMesSiguiente(ahora.fecha)) {
    throw new FechaFueraDeVentanaError(
      "Sólo se pueden comprar entradas con hasta 1 mes de anticipación",
    );
  }

  if (!estaAbierto(fecha)) {
    throw new ParqueCerradoError("El parque está cerrado en la fecha elegida");
  }

  if (fecha === ahora.fecha && ahora.hora > HORA_LIMITE_MISMO_DIA) {
    throw new HorarioDeCompraVencidoError(
      `Para el día de hoy sólo se puede comprar hasta las ${HORA_LIMITE_MISMO_DIA}`,
    );
  }
}
