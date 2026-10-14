import type { Reloj } from "../config/reloj";
import type { EntradaSolicitada } from "../entities/entrada-solicitada";
import { FormaPago } from "../entities/forma-pago";
import type { Usuario } from "../entities/usuario";
import {
  FormaPagoInvalidaError,
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

export class CompraService {
  constructor(private readonly dependencias: DependenciasCompraService) {}

  async comprar(solicitud: SolicitudCompra): Promise<ResultadoCompra> {
    const { compraRepository, usuarioRepository, reloj } = this.dependencias;
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

    const compra = await compraRepository.guardar({
      usuarioId,
      fechaVisita,
      formaPago,
      entradas: entradasConPrecio,
      total,
    });

    return {
      compraId: compra.id,
      cantidadEntradas: compra.entradas.length,
      fechaVisita: compra.fechaVisita,
      total: compra.total,
      urlRedireccion: null,
      mensaje: `Compraste ${compra.entradas.length} entradas para el ${formatearFecha(compra.fechaVisita)}`,
    };
  }
}
