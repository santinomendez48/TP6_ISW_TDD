import type { Reloj } from "../config/reloj";
import type { EntradaSolicitada } from "../entities/entrada-solicitada";
import { FormaPago } from "../entities/forma-pago";
import { TipoPase } from "../entities/tipo-pase";
import type { Usuario } from "../entities/usuario";
import {
  FormaPagoInvalidaError,
  PagoRechazadoError,
  UsuarioNoRegistradoError,
} from "../errors/errores-negocio";
import type { Notificador } from "../integrations/notificador";
import type { PasarelaPago } from "../integrations/pasarela-pago";
import type { CompraRepository } from "../repositories/compra.repository";
import type { UsuarioRepository } from "../repositories/usuario.repository";
import { validarFechaVisita } from "../rules/calendario-parque";
import {
  validarEntradas,
  validarLimiteAcumulado,
} from "../rules/limites-compra";
import { calcularPrecioEntrada } from "../rules/precios";
import { formatearFecha } from "../utils/fechas";

export interface SolicitudCompra {
  usuarioId: number;
  fechaVisita: string;
  formaPago?: FormaPago;
  entradas: EntradaSolicitada[];
}

export interface ResultadoCompra {
  compraId: number;
  cantidadEntradas: number;
  fechaVisita: string;
  total: number;
  urlRedireccion: string | null;
  emailConfirmacion: string;
  mensaje: string;
}

export interface DependenciasCompraService {
  compraRepository: CompraRepository;
  usuarioRepository: UsuarioRepository;
  pasarelaPago: PasarelaPago;
  notificador: Notificador;
  reloj: Reloj;
}

const FORMAS_DE_PAGO: string[] = Object.values(FormaPago);

const NOMBRES_PASE: Record<TipoPase, string> = {
  [TipoPase.COMUN]: "Común",
  [TipoPase.VIP]: "VIP",
};

const NOMBRES_FORMA_PAGO: Record<FormaPago, string> = {
  [FormaPago.EFECTIVO]: "Efectivo (se abona en boletería)",
  [FormaPago.TARJETA]: "Tarjeta (Mercado Pago)",
};

function formatearMonto(monto: number): string {
  return `$${monto.toLocaleString("es-AR")}`;
}

export class CompraService {
  constructor(private readonly dependencias: DependenciasCompraService) {}

  async comprar(solicitud: SolicitudCompra): Promise<ResultadoCompra> {
    const {
      compraRepository,
      usuarioRepository,
      pasarelaPago,
      notificador,
      reloj,
    } = this.dependencias;
    const { usuarioId, fechaVisita, formaPago, entradas } = solicitud;

    const usuario: Usuario | null =
      await usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new UsuarioNoRegistradoError(
        "Sólo los usuarios registrados pueden comprar entradas",
      );
    }

    if (formaPago === undefined || !FORMAS_DE_PAGO.includes(formaPago)) {
      throw new FormaPagoInvalidaError(
        "Debe seleccionar una forma de pago: efectivo o tarjeta",
      );
    }

    validarEntradas(entradas);
    validarFechaVisita(fechaVisita, reloj.ahora());
    validarLimiteAcumulado(
      await compraRepository.contarEntradasPorUsuarioYFecha(
        usuarioId,
        fechaVisita,
      ),
      entradas.length,
    );

    const entradasConPrecio = entradas.map((entrada) => ({
      ...entrada,
      precio: calcularPrecioEntrada(entrada),
    }));
    const total = entradasConPrecio.reduce((suma, e) => suma + e.precio, 0);

    // Se cobra antes de registrar: si el pago es rechazado no queda compra
    let urlRedireccion: string | null = null;
    if (formaPago === FormaPago.TARJETA) {
      const pago = await pasarelaPago.pagar({
        monto: total,
        email: usuario.email,
        descripcion: `${entradas.length} entradas EcoHarmony Park - ${formatearFecha(fechaVisita)}`,
      });
      if (!pago.aprobado) {
        throw new PagoRechazadoError("El pago con tarjeta fue rechazado");
      }
      urlRedireccion = pago.urlRedireccion;
    }

    const compra = await compraRepository.guardar({
      usuarioId,
      fechaVisita,
      formaPago,
      entradas: entradasConPrecio,
      total,
    });

    const detalle = compra.entradas
      .map(
        (e, i) =>
          `Visitante ${i + 1}: ${e.edad} años - Pase ${NOMBRES_PASE[e.tipoPase]} - ${formatearMonto(e.precio)}`,
      )
      .join("\n");

    await notificador.enviar({
      destinatario: usuario.email,
      asunto: `Confirmación de compra #${compra.id} - EcoHarmony Park`,
      cuerpo: [
        `¡Hola ${usuario.nombre}! Tu compra fue registrada.`,
        "",
        `Cantidad de entradas: ${compra.entradas.length}`,
        `Fecha de visita: ${formatearFecha(compra.fechaVisita)}`,
        "",
        detalle,
        "",
        `Forma de pago: ${NOMBRES_FORMA_PAGO[compra.formaPago]}`,
        `Total: ${formatearMonto(compra.total)}`,
      ].join("\n"),
    });

    return {
      compraId: compra.id,
      cantidadEntradas: compra.entradas.length,
      fechaVisita: compra.fechaVisita,
      total: compra.total,
      urlRedireccion,
      emailConfirmacion: usuario.email,
      mensaje: `Compraste ${compra.entradas.length} entradas para el ${formatearFecha(compra.fechaVisita)}`,
    };
  }
}
