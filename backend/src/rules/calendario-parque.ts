const LUNES = 1;
const FERIADOS_FIJOS = ["12-25", "01-01"]; // MM-DD

function diaDeLaSemana(fecha: string): number {
  return new Date(`${fecha}T00:00:00Z`).getUTCDay();
}

export function estaAbierto(fecha: string): boolean {
  const mesYDia = fecha.slice(5);

  return diaDeLaSemana(fecha) !== LUNES && !FERIADOS_FIJOS.includes(mesYDia);
}
