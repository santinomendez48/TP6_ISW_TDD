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

Leyenda: cada fila es un ciclo → 1 commit `test:` (Red) + 1 commit `feat:` (Green) (+ 1 `refactor:` cuando se indica).

Ejemplo de un ciclo en el historial:

```
test: precio de entrada Común para un adulto
feat: calcular precio de entrada Común
test: precio de entrada VIP para un adulto
feat: calcular precio según tipo de pase
refactor: extraer tabla de precios base
```

### Fase 0 – Setup

| # | Commit |
|---|---|
| 0.1 | `chore: inicializar backend con TypeScript, Vitest, ESLint y Prettier` (incluye smoke test) |

### Fase 1 – Reglas de precios (`rules/precios.ts`, `entities/`)

| # | Red (test que falla) | Green | Refactor |
|---|---|---|---|
| 1.1 | Adulto con pase Común cuesta 10000 | Devolver constante | — |
| 1.2 | Adulto con pase VIP cuesta 20000 | Condicional por tipo | Tabla `PRECIOS_BASE` + enum `TipoPase` en `entities/` |
| 1.3 | Visitante de 3 años no paga / 4 años paga | Regla gratis | — |
| 1.4 | 15 años paga 50% / 16 años paga completo | Regla menor | — |
| 1.5 | 60 años paga 50% / 59 años paga completo | Regla mayor | Reglas de descuento como lista de políticas |
| 1.6 | Total de un grupo mixto (edades y pases variados) | `calcularTotal` | — |

### Fase 2 – Reglas de calendario y fecha (`rules/calendario-parque.ts`, `config/reloj.ts`)

| # | Red | Green | Refactor |
|---|---|---|---|
| 2.1 | Un lunes el parque está cerrado | `estaAbierto(fecha)` | — |
| 2.2 | 25/12 y 1/1 cerrados en cualquier año | Feriados fijos | Constante `FERIADOS_FIJOS` |
| 2.3 | Fecha anterior a hoy es rechazada (Reloj fake) | Interfaz `Reloj` + validación | — |
| 2.4 | Hoy aceptada; mismo día del mes siguiente aceptada; un día después de eso rechazada (ej. hoy 14/10: 14/11 ✓, 15/11 ✗) | Límite de anticipación | — |
| 2.5 | Mismo día: 17:30 aceptada / 17:31 rechazada | Hora de corte | Unificar en `validarFechaVisita` con errores tipados (`errors/`) |

### Fase 3 – Reglas de cantidad y visitantes (`rules/limites-compra.ts`)

| # | Red | Green | Refactor |
|---|---|---|---|
| 3.1 | 0 y 11 entradas rechazadas / 1 y 10 aceptadas | `validarCantidad` | — |
| 3.2 | Edades 0 y 120 aceptadas; -1, 121 y 10.5 rechazadas | Validación de edad | — |
| 3.3 | Cada entrada debe tener su tipo de pase; una compra con pases mixtos (VIP + Común) es válida | Validación de pase por entrada | Agrupar en `validarEntradas` |
| 3.4 | 6 ya compradas + 5 nuevas para la misma fecha → rechazada; 6 + 4 → aceptada | `validarLimiteAcumulado` | — |

### Fase 4 – Service `CompraService` (con fakes inyectados)

Incluye las 4 **pruebas de usuario** de la US (marcadas con ★).

| # | Red | Green | Refactor |
|---|---|---|---|
| 4.1 | Compra válida en efectivo: se guarda y devuelve cantidad + fecha | `CompraService.comprar` + `CompraRepository` (interfaz) | — |
| 4.2 | ★ Compra sin forma de pago → falla | Validación forma de pago | — |
| 4.3 | ★ Compra en fecha con parque cerrado → falla | Usa `rules/calendario-parque` | — |
| 4.4 | ★ Compra de más de 10 entradas → falla | Usa `rules/limites-compra` | — |
| 4.5 | Supera el límite acumulado por usuario/fecha → falla | `CompraRepository.contarPorUsuarioYFecha` | — |
| 4.6 | Usuario no registrado → falla | `UsuarioRepository` (interfaz) | — |
| 4.7 | ★ Compra válida con tarjeta: autoriza en Mercado Pago, devuelve URL de redirección y envía mail | `PasarelaPago` + `Notificador` | — |
| 4.8 | El mail contiene cantidad, fecha, detalle por visitante, subtotales y total | Plantilla del mail | Extraer `construirResumen` |
| 4.9 | Pago con tarjeta rechazado → falla, no se guarda ni se envía mail | Manejo de rechazo | — |
| 4.10 | Si una validación falla, no se llama a la pasarela, al repositorio ni al notificador | Orden validar → pagar → guardar → notificar | Simplificar el flujo del service |

### Fase 5 – Infraestructura y API

| # | Red | Green | Refactor |
|---|---|---|---|
| 5.1 | Repositorios en memoria: guardar compra y contar por usuario/fecha | `repositories/memoria/` | — |
| 5.2 | `MercadoPagoSimulado` y `NotificadorMailSimulado` cumplen su interfaz | `integrations/` | — |
| 5.3 | `POST /compras` válido → 201 con cantidad, fecha y total | `compra.controller` + `routes` + `app` | — |
| 5.4 | Body inválido (sin forma de pago, sin edades, etc.) → 400 con mensaje | `dtos/compra.request.dto.ts` (zod) | — |
| 5.5 | Errores de negocio → 422; usuario no registrado → 401; pago rechazado → 402 | Middleware de errores | Mapa error → status |
| 5.6 | `POST /compras/cotizar` devuelve subtotales y total | Endpoint de cotización | — |
| 5.7 | `GET /calendario` devuelve los días del próximo mes indicando si están habilitados | `calendario.service` + controller | — |

### Fase 6 – Frontend (Testing Library, API mockeada)

| # | Red | Green |
|---|---|---|
| 6.1 | — | `chore: scaffold de frontend (Vite + React), paleta FAQ 3 y fuente Lato` |
| 6.2 | El calendario deshabilita lunes, feriados y fechas fuera de rango | `Calendario` |
| 6.3 | Selector de cantidad entre 1 y 10; genera un formulario (edad + pase) por entrada | `SelectorCantidad` + `FormularioVisitante` |
| 6.4 | El botón Confirmar está deshabilitado sin forma de pago | `SelectorFormaPago` |
| 6.5 | Muestra el total cotizado por la API | Integración con `services/` |
| 6.6 | Con tarjeta, redirige a la pantalla "Mercado Pago – Compra exitosa" | `MercadoPagoSimulado` |
| 6.7 | La confirmación muestra cantidad y fecha, y el modal "Mail enviado a …" | `Confirmacion` |
| 6.8 | Muestra el mensaje de error devuelto por la API | Manejo de errores |

Refactors de frontend según aparezcan (extraer hooks, componentes, etc.).

### Fase 7 – Cierre

| # | Commit |
|---|---|
| 7.1 | `docs: README con instrucciones de instalación, ejecución y tests` |
| 7.2 | `docs: documento de decisiones de diseño (TP-Grupal_6_Test_Driven_Development_TDD_G3)` |
| 7.3 | `chore: reporte de cobertura` (opcional) |

**Total estimado:** ~55–65 commits.

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
