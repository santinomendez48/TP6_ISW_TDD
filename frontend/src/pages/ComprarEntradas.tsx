import { useEffect, useMemo, useState } from "react";
import Calendario from "../components/Calendario";
import FormularioVisitante, {
  type VisitanteForm,
} from "../components/FormularioVisitante";
import SelectorCantidad from "../components/SelectorCantidad";
import SelectorFormaPago from "../components/SelectorFormaPago";
import * as api from "../services/api";
import type { DiaCalendario, EntradaSolicitada, FormaPago } from "../types";
import { formatearMonto } from "../utils/formato";

const EDAD_MAXIMA = 120;

const nuevoVisitante = (): VisitanteForm => ({
  id: crypto.randomUUID(),
  edad: "",
  tipoPase: "COMUN",
});

function edadValida(edad: string): boolean {
  return /^\d+$/.test(edad) && Number(edad) <= EDAD_MAXIMA;
}

// Devuelve las entradas listas para enviar, o null si falta alguna edad
function aEntradas(visitantes: VisitanteForm[]): EntradaSolicitada[] | null {
  if (!visitantes.every((v) => edadValida(v.edad))) {
    return null;
  }
  return visitantes.map((v) => ({
    edad: Number(v.edad),
    tipoPase: v.tipoPase,
  }));
}

export default function ComprarEntradas() {
  const [dias, setDias] = useState<DiaCalendario[]>([]);
  const [fechaVisita, setFechaVisita] = useState<string | null>(null);
  const [visitantes, setVisitantes] = useState<VisitanteForm[]>(() => [
    nuevoVisitante(),
  ]);
  const [formaPago, setFormaPago] = useState<FormaPago | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);

  const entradas = useMemo(() => aEntradas(visitantes), [visitantes]);

  useEffect(() => {
    api.obtenerCalendario().then((calendario) => setDias(calendario.dias));
  }, []);

  // El total lo calcula el servidor, que es quien conoce las reglas de precios
  useEffect(() => {
    if (!entradas) {
      return undefined;
    }
    let vigente = true;
    api
      .cotizar(entradas)
      .then((cotizacion) => vigente && setTotal(cotizacion.total))
      .catch(() => vigente && setTotal(null));
    return () => {
      vigente = false;
    };
  }, [entradas]);

  const cambiarCantidad = (cantidad: number) => {
    setVisitantes((actuales) =>
      cantidad > actuales.length
        ? [...actuales, nuevoVisitante()]
        : actuales.slice(0, cantidad),
    );
  };

  const cambiarVisitante = (cambiado: VisitanteForm) => {
    setVisitantes((actuales) =>
      actuales.map((v) => (v.id === cambiado.id ? cambiado : v)),
    );
  };

  const puedeConfirmar = Boolean(fechaVisita && formaPago && entradas);

  const confirmar = async () => {
    if (!fechaVisita || !formaPago || !entradas) {
      return;
    }
    setEnviando(true);
    try {
      await api.comprar({ fechaVisita, formaPago, entradas });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section>
      <h2>Comprar entradas</h2>

      <Calendario
        dias={dias}
        seleccionada={fechaVisita}
        onSeleccionar={setFechaVisita}
      />

      <SelectorCantidad
        cantidad={visitantes.length}
        onCambiar={cambiarCantidad}
      />

      <fieldset className="seccion">
        <legend>Visitantes</legend>
        {visitantes.map((visitante, indice) => (
          <FormularioVisitante
            key={visitante.id}
            numero={indice + 1}
            visitante={visitante}
            onCambiar={cambiarVisitante}
          />
        ))}
      </fieldset>

      <SelectorFormaPago formaPago={formaPago} onSeleccionar={setFormaPago} />

      <div className="resumen">
        {entradas && total !== null && (
          <p className="total">Total: {formatearMonto(total)}</p>
        )}
        <button
          type="button"
          className="boton-principal"
          disabled={!puedeConfirmar || enviando}
          onClick={confirmar}
        >
          Confirmar compra
        </button>
      </div>
    </section>
  );
}
