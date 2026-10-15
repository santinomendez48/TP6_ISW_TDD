import type { TipoPase } from "../types";

export interface VisitanteForm {
  id: string;
  edad: string;
  tipoPase: TipoPase;
}

interface FormularioVisitanteProps {
  numero: number;
  visitante: VisitanteForm;
  onCambiar: (visitante: VisitanteForm) => void;
}

// Cada entrada tiene su propia edad y su propio tipo de pase
export default function FormularioVisitante({
  numero,
  visitante,
  onCambiar,
}: FormularioVisitanteProps) {
  const idEdad = `edad-${visitante.id}`;
  const idPase = `pase-${visitante.id}`;

  return (
    <div className="visitante">
      <span className="visitante-titulo">Visitante {numero}</span>
      <label htmlFor={idEdad}>
        Edad
        <input
          id={idEdad}
          type="number"
          inputMode="numeric"
          min={0}
          max={120}
          aria-label={`Edad del visitante ${numero}`}
          value={visitante.edad}
          onChange={(e) => onCambiar({ ...visitante, edad: e.target.value })}
        />
      </label>
      <label htmlFor={idPase}>
        Pase
        <select
          id={idPase}
          aria-label={`Pase del visitante ${numero}`}
          value={visitante.tipoPase}
          onChange={(e) =>
            onCambiar({ ...visitante, tipoPase: e.target.value as TipoPase })
          }
        >
          <option value="COMUN">Común</option>
          <option value="VIP">VIP</option>
        </select>
      </label>
    </div>
  );
}
