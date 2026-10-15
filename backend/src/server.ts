import crearApp from "./app";
import { RelojSistema } from "./config/reloj";
import MercadoPagoSimulado from "./integrations/mercado-pago-simulado";
import NotificadorMailSimulado from "./integrations/notificador-mail-simulado";
import CompraRepositoryEnMemoria from "./repositories/memoria/compra.repository.memoria";
import UsuarioRepositoryEnMemoria from "./repositories/memoria/usuario.repository.memoria";
import CalendarioService from "./services/calendario.service";
import { CompraService } from "./services/compra.service";

// Composición de dependencias de la aplicación real (con adaptadores
// simulados, según FAQ 4, 5 y 19).
const PUERTO = Number(process.env.PORT ?? 3000);
const URL_FRONTEND = process.env.URL_FRONTEND ?? "http://localhost:5173";

// Usuario de la sesión simulada (FAQ 19)
const USUARIO_DE_PRUEBA = {
  id: 1,
  nombre: "Visitante de prueba",
  email: "visitante@ecoharmony.test",
};

const reloj = new RelojSistema();

const app = crearApp({
  compraService: new CompraService({
    compraRepository: new CompraRepositoryEnMemoria(),
    usuarioRepository: new UsuarioRepositoryEnMemoria([USUARIO_DE_PRUEBA]),
    pasarelaPago: new MercadoPagoSimulado({
      urlCheckout: `${URL_FRONTEND}/mercado-pago`,
    }),
    notificador: new NotificadorMailSimulado(true),
    reloj,
  }),
  calendarioService: new CalendarioService(reloj),
});

app.listen(PUERTO, () => {
  // eslint-disable-next-line no-console
  console.info(
    `API de EcoHarmony Park escuchando en http://localhost:${PUERTO}`,
  );
});
