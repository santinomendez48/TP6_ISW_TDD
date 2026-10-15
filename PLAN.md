# Plan de implementación – TP6 TDD: User Story "Comprar entradas"

> Grupo 3 (impar) → US **Comprar entradas** de EcoHarmony Park.
> Consigna completa: [`consigna.md`](./consigna.md).

---

## 1. Objetivo

Implementar la US "Comprar entradas" aplicando estrictamente el ciclo **Red → Green → Refactor**, dejando en el historial de Git la evidencia de cada fase, y entregar:

1. Implementación funcional de la US (backend + frontend).
2. Conjunto de pruebas automatizadas que cubren los casos definidos (criterios de aceptación, pruebas de usuario y reglas de las FAQ).
3. Documento que justifique las decisiones de diseño.

---

## 2. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Lenguaje | TypeScript (Node 22) |
| Tests | Vitest (+ Supertest para la API, Testing Library para el frontend) |
| Backend | Express |
| Validación de entrada | Zod (en los DTOs) |
| Frontend | React + Vite |
| Estilo de código | ESLint (Airbnb) + Prettier |
| Gestor de paquetes | npm |

---

## 3. Estructura del repositorio

```
TP6_ISW_TDD/
├── consigna.md
├── PLAN.md
├── README.md                          ← cómo instalar, correr y testear
├── docs/
│   └── TP-Grupal_6_Test_Driven_Development_TDD_G3.md   ← documento de decisiones de diseño (+ export .pdf)
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── compra.controller.ts       ← recibe request, valida DTO, llama al service, mapea errores a HTTP
│   │   │   └── calendario.controller.ts
│   │   ├── services/
│   │   │   ├── compra.service.ts          ← orquesta: validar → cotizar → pagar → guardar → notificar
│   │   │   └── calendario.service.ts
│   │   ├── repositories/
│   │   │   ├── compra.repository.ts       ← interfaz
│   │   │   ├── usuario.repository.ts      ← interfaz
│   │   │   └── memoria/                   ← implementaciones en memoria
│   │   ├── dtos/
│   │   │   ├── compra.request.dto.ts      ← forma del body + schema zod
│   │   │   └── compra.response.dto.ts
│   │   ├── entities/                      ← Compra, Entrada, TipoPase, FormaPago, Usuario
│   │   ├── rules/                         ← reglas de negocio puras
│   │   │   ├── precios.ts
│   │   │   ├── calendario-parque.ts
│   │   │   └── limites-compra.ts
│   │   ├── integrations/
│   │   │   ├── pasarela-pago.ts           ← interfaz + MercadoPagoSimulado
│   │   │   └── notificador.ts             ← interfaz + NotificadorMailSimulado
│   │   ├── config/
│   │   │   └── reloj.ts                   ← interfaz Reloj + RelojSistema (zona America/Argentina/Buenos_Aires)
│   │   ├── errors/                        ← errores de negocio tipados
│   │   ├── routes.ts
│   │   └── app.ts                         ← composición de dependencias
│   └── tests/                             ← mismo árbol que src/
└── frontend/
    ├── src/
    │   ├── components/                    ← Calendario, SelectorCantidad, FormularioVisitante, SelectorFormaPago
    │   ├── pages/                         ← ComprarEntradas, Confirmacion, MercadoPagoSimulado
    │   ├── services/                      ← cliente HTTP de la API
    │   └── styles/                        ← paleta FAQ 3 + fuente Lato
    └── tests/
```

### Decisiones de diseño clave

1. **Reglas de negocio puras en `rules/`.** No dependen de Express, de la persistencia ni de la hora del sistema → se testean de forma aislada y rápida. Se evita `utils/` para no esconder la lógica central del TP en una carpeta genérica.
2. **Inyección de dependencias por constructor en los services.** `CompraService` recibe `CompraRepository`, `UsuarioRepository`, `PasarelaPago`, `Notificador` y `Reloj`. En los tests se pasan *fakes*; en `app.ts` se pasan las implementaciones reales/simuladas.
3. **`Reloj` inyectable.** Ningún test depende de la fecha real en que se ejecuta (se fija "ahora" en cada caso). Las fechas de visita se manejan como `YYYY-MM-DD` y la hora en zona Argentina, evitando errores de UTC.
4. **Mercado Pago y mail como integraciones simuladas** detrás de una interfaz (permitido por FAQ 4 y 5). Reemplazarlas por las reales no afecta al service.
5. **Persistencia en memoria.** La consigna no exige base de datos; la interfaz del repositorio permite cambiarla sin tocar el service.
6. **Usuario mockeado** (FAQ 19): `UsuarioRepository` en memoria con un usuario precargado; el id del usuario llega en un header simulando la sesión.
7. **El precio se calcula sólo en el backend.** El frontend lo consulta a `POST /compras/cotizar` para no duplicar reglas.
8. **Orden de operaciones en la compra:** validar todo → cotizar → pagar → guardar → notificar. Si algo falla no se cobra, no se guarda y no se envía mail.

---

## 4. Reglas de negocio a implementar

| # | Regla | Fuente |
|---|---|---|
| R1 | Entrada Común $10.000, VIP $20.000 | FAQ 6, FAQ 21 |
| R2 | Edad ≤ 3 → gratis | FAQ 7 |
| R3 | Edad ≤ 15 → 50% off | FAQ 7 |
| R4 | Edad ≥ 60 → 50% off | FAQ 7 |
| R5 | El parque cierra los lunes, 25/12 y 1/1 | FAQ 1, CA |
| R6 | La fecha de visita es hoy o futura | CA |
| R7 | Máximo 1 mes de anticipación: desde hoy hasta el mismo día del mes siguiente, inclusive | FAQ 25 |
| R8 | Para el mismo día, compra hasta las 17:30 | FAQ 26 |
| R9 | Cantidad por compra entre 1 y 10 | CA |
| R10 | Máximo 10 entradas por usuario para una misma fecha (acumulando compras) | FAQ 27 |
| R11 | Cada entrada indica la edad del visitante (entero entre 0 y 120) y su propio tipo de pase (VIP / Común); una misma compra puede mezclar pases | CA |
| R12 | La forma de pago es obligatoria: efectivo (boletería) o tarjeta | CA |
| R13 | Si paga con tarjeta, se redirige a Mercado Pago (simulado) | CA, FAQ 4 |
| R14 | Se envía mail de confirmación con el resumen (simulado: modal "Mail enviado a …") | CA, FAQ 5 |
| R15 | Al finalizar se informa la cantidad de entradas y la fecha | CA |
| R16 | Sólo usuarios registrados pueden comprar | CA, FAQ 19 |
| R17 | Sin límite de visitantes por día | FAQ 20 |
| R18 | UI: paleta `#386641 #6A994E #A7C957 #F2E8CF #BC4749`, fuente Lato, responsive, calendario con días cerrados deshabilitados | FAQ 2, 3, 24 |

---

## 5. Convención de commits

| Prefijo | Uso |
|---|---|
| `test: …` | Fase Red: se agrega un test que falla. **Antes de commitear se ejecuta la suite y se verifica que falle.** |
| `feat: …` | Fase Green: código mínimo para que pase. Se verifica que toda la suite pase. |
| `refactor: …` | Mejora de diseño sin cambiar comportamiento; la suite sigue en verde. |
| `chore: …` | Configuración, dependencias, scaffolding. |
| `docs: …` | Documentación. |

Los commits se hacen en el orden real en que se trabaja (sin modificar fechas). Cada integrante que participe commitea con su propio usuario.

---

## 6. Secuencia de ciclos TDD

Para no generar demasiados commits, **en todas las fases los ciclos se agrupan por módulo**: un commit `test:` con todos los tests del módulo (Red), uno o más commits `feat:` que los van haciendo pasar por partes (Green). **A partir de la Fase 5 no se hacen commits `refactor:` separados**: el código se escribe ya prolijo dentro del `feat:` (Green + Refactor en el mismo commit), y sólo se agrega un `refactor:` si aparece una mejora de diseño importante después de que el módulo quedó en verde. Los commits `feat:` intermedios pueden dejar tests del mismo módulo todavía en rojo; el último `feat:` del módulo deja toda la suite en verde.

Ejemplo de un ciclo en el historial:

```
test: reglas de precios por tipo de pase y edad
feat: calcular precio de entrada por tipo de pase
feat: aplicar descuentos por edad
feat: calcular total de la compra
refactor: extraer descuentos como lista de reglas
```

### Fase 0 – Setup

| # | Commit |
|---|---|
| 0.1 | `chore: inicializar backend con TypeScript, Vitest, ESLint y Prettier` (incluye smoke test) |

### Fase 1 – Reglas de precios (`rules/precios.ts`, `entities/`)

| Commit | Contenido |
|---|---|
| `test: reglas de precios por tipo de pase y edad` | Común adulto 10000; VIP adulto 20000; 0 y 3 años gratis; 4 y 15 años 50%; 16 y 59 años completo; 60 años 50% (ambos pases); total de un grupo mixto; total de una lista vacía = 0 |
| `feat: calcular precio de entrada por tipo de pase` | `TipoPase` y `EntradaSolicitada` en `entities/`, `calcularPrecioEntrada` con tabla `PRECIOS_BASE` |
| `feat: aplicar descuentos por edad` | Gratis ≤ 3, 50% ≤ 15, 50% ≥ 60 |
| `feat: calcular total de la compra` | `calcularTotal` |
| `refactor: extraer descuentos como lista de reglas` | Descuentos como lista ordenada de reglas `{ aplica, factor }` |

### Fase 2 – Reglas de calendario y fecha (`rules/calendario-parque.ts`, `errors/`)

| Commit | Contenido |
|---|---|
| `test: reglas de calendario y fecha de visita` | Lunes cerrado; 25/12 y 1/1 cerrados en cualquier año; día normal abierto; fecha con formato inválido rechazada; fecha pasada rechazada; hoy aceptada; mismo día del mes siguiente aceptado y el día después rechazado (14/10 → 14/11 ✓, 15/11 ✗); fin de mes (31/01 → hasta 28/02); mismo día 17:30 ✓ / 17:31 ✗; día siguiente sin límite horario |
| `feat: determinar días en que el parque está abierto` | `estaAbierto(fecha)` con lunes y `FERIADOS_FIJOS` |
| `feat: validar ventana de compra y hora de corte` | `validarFechaVisita(fecha, ahora)` con errores tipados en `errors/` |
| `refactor: extraer utilidades de fechas del calendario del parque` | Helpers de fechas a `utils/fechas.ts` |

`ahora` es un `Momento` (`{ fecha: 'YYYY-MM-DD', hora: 'HH:mm' }`) que en la Fase 4 provee el `Reloj` inyectado; las reglas no consultan la hora del sistema.

### Fase 3 – Reglas de cantidad y visitantes (`rules/limites-compra.ts`)

| Commit | Contenido |
|---|---|
| `test: reglas de cantidad, edad y tipo de pase` | 0 y 11 entradas rechazadas / 1 y 10 aceptadas; edades 0 y 120 aceptadas, -1, 121 y 10.5 rechazadas; tipo de pase inexistente rechazado; pases mixtos aceptados; límite acumulado 6 + 4 ✓ / 6 + 5 ✗ / 10 + 1 ✗ |
| `feat: validar cantidad de entradas por compra` | `validarEntradas` con 1 a 10 entradas |
| `feat: validar edad y tipo de pase por entrada` | Edad entera 0–120 y pase válido en cada entrada |
| `feat: validar límite acumulado por usuario y fecha` | `validarLimiteAcumulado(yaCompradas, nuevas)` |

### Fase 4 – Service `CompraService` (con fakes inyectados)

Incluye las 4 **pruebas de usuario** de la US (marcadas con ★).

| Commit | Contenido |
|---|---|
| `test: servicio de compra de entradas` | Compra válida en efectivo (se guarda y devuelve cantidad, fecha y total, sin redirección); ★ sin forma de pago → falla; ★ fecha con parque cerrado → falla; ★ más de 10 entradas → falla; supera el límite acumulado por usuario/fecha → falla; usuario no registrado → falla; ★ compra con tarjeta (autoriza en Mercado Pago, devuelve URL de redirección y envía mail); el mail incluye cantidad, fecha, detalle por visitante, subtotales y total; pago rechazado → falla sin guardar ni enviar mail; si una validación falla no se llama a la pasarela, al repositorio ni al notificador |
| `feat: registrar compra validando reglas de negocio` | `CompraService.comprar`, `CompraRepository`, `UsuarioRepository`, `Reloj`, `FormaPago`, uso de `rules/` |
| `feat: procesar pago con tarjeta y enviar confirmación por mail` | `PasarelaPago`, `Notificador`, plantilla del mail, orden validar → pagar → guardar → notificar |
| `refactor: extraer construcción del resumen de compra` | `construirResumen` reutilizado por el resultado y el mail |

### Fase 5 – Infraestructura y API

| Commit | Contenido |
|---|---|
| `test: adaptadores en memoria y simulados` | Repositorios en memoria (guardar, contar por usuario/fecha, buscar usuario); `MercadoPagoSimulado`; `NotificadorMailSimulado`; `RelojSistema` en zona Argentina |
| `feat: implementar repositorios en memoria e integraciones simuladas` | `repositories/memoria/`, `integrations/`, `config/reloj.ts` |
| `test: endpoints de compra, cotización y calendario` | `POST /compras` válido → 201; body inválido → 400; errores de negocio → 422; usuario no registrado → 401; pago rechazado → 402; `POST /compras/cotizar` → subtotales y total; `GET /calendario` → días del próximo mes con su estado |
| `feat: exponer API de compra, cotización y calendario` | `dtos/` (zod), `controllers/`, `middlewares/` (errores → status), `routes.ts`, `app.ts`, `server.ts`, `cotizacion.service`, `calendario.service` |

### Fase 6 – Frontend (Testing Library, API mockeada)

| Commit | Contenido |
|---|---|
| `chore: inicializar frontend con Vite, React y Testing Library` | Scaffold, paleta FAQ 3, fuente Lato |
| `test: formulario de compra de entradas` | Calendario deshabilita lunes, feriados y fechas fuera de rango; cantidad entre 1 y 10 con un formulario (edad + pase) por entrada; Confirmar deshabilitado sin forma de pago; muestra el total cotizado |
| `feat: formulario de compra de entradas` | `Calendario`, `SelectorCantidad`, `FormularioVisitante`, `SelectorFormaPago`, cliente de la API |
| `test: confirmación de compra y pago simulado` | Con tarjeta muestra "Mercado Pago – Compra exitosa"; la confirmación muestra cantidad y fecha y el modal "Mail enviado a …"; muestra los errores devueltos por la API |
| `feat: confirmación de compra y pago simulado` | `Confirmacion`, `MercadoPagoSimulado`, manejo de errores |

### Fase 7 – Cierre

| Commit | Contenido |
|---|---|
| `docs: README con instrucciones de instalación, ejecución y tests` | |
| `docs: documento de decisiones de diseño` | `docs/TP-Grupal_6_Test_Driven_Development_TDD_G3.md` |

**Total estimado:** ~35 commits.

---

## 7. Contenido del documento de decisiones de diseño

`docs/TP-Grupal_6_Test_Driven_Development_TDD_G3.md`:

1. Introducción y US elegida (con criterios de aceptación y pruebas de usuario).
2. Stack y guía de estilo utilizada (referencia al TP2).
3. Arquitectura por capas: diagrama y responsabilidad de cada carpeta.
4. Decisiones de diseño (sección 3 de este plan) con su justificación.
5. Tabla de reglas de negocio → FAQ → test que la cubre.
6. Supuestos tomados (sección 8 de este plan, más zona horaria Argentina y sesión mockeada).
7. Evidencia del ciclo TDD: tabla de ciclos con el hash de los commits `test:` (Red), `feat:` (Green) y `refactor:` de cada ciclo.
8. Mapeo de las pruebas de usuario de la US a los tests automatizados.
9. Reporte de cobertura.
10. Cómo ejecutar el proyecto y los tests.

---

## 8. Supuestos confirmados

- [x] Lenguaje y guía de estilo: TypeScript + ESLint Airbnb + Prettier.
- [x] Ventana de compra: desde hoy hasta el mismo día del mes siguiente, inclusive (ej. hoy 14/10 → se puede comprar para el 14/10 hasta el 14/11). Fechas más lejanas se rechazan.
- [x] Rango de edad válido: número entero entre 0 y 120, inclusive.
- [x] El tipo de pase (VIP / Común) se elige por cada entrada, no por compra.
- [x] Si el mes siguiente no tiene ese día, el límite es su último día (ej. hoy 31/01 → hasta 28/02).
