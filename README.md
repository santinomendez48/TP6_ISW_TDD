# TP6 – TDD: EcoHarmony Park · Comprar entradas

Implementación de la User Story **"Comprar entradas"** de EcoHarmony Park aplicando
Desarrollo Conducido por Pruebas (ciclo Red → Green → Refactor).

Ingeniería y Calidad de Software · UTN FRC · Curso 4K3 · Grupo 3 · 2026

| Documento | Contenido |
|---|---|
| [`consigna.md`](./consigna.md) | Consigna del TP, dominio, FAQ del PO y la User Story |
| [`PLAN.md`](./PLAN.md) | Plan de implementación y secuencia de ciclos TDD |
| [`docs/TP-Grupal_6_Test_Driven_Development_TDD_G3.md`](./docs/TP-Grupal_6_Test_Driven_Development_TDD_G3.md) | Decisiones de diseño, evidencia del ciclo TDD y cobertura |

---

## Requisitos

- [Node.js](https://nodejs.org/) 22 o superior
- npm 10 o superior

## Instalación

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Ejecución

En dos terminales:

```bash
# Terminal 1 – API en http://localhost:3000
cd backend
npm run dev

# Terminal 2 – App web en http://localhost:5173
cd frontend
npm run dev
```

Abrir http://localhost:5173 en el navegador.

- El usuario está **mockeado** (FAQ 19): la sesión corresponde siempre a
  `visitante@ecoharmony.test`.
- **Mercado Pago** y el **envío de mails** están simulados (FAQ 4 y 5): el pago con
  tarjeta redirige a una pantalla "Mercado Pago – Compra exitosa" y el mail se
  muestra en un modal en la app y por la consola del backend.
- Los datos se guardan **en memoria**: se pierden al reiniciar el backend.

### Variables de entorno (opcionales)

| Variable | Dónde | Por defecto |
|---|---|---|
| `PORT` | backend | `3000` |
| `URL_FRONTEND` | backend (URL de redirección de Mercado Pago) | `http://localhost:5173` |
| `VITE_URL_API` | frontend | `http://localhost:3000/api` |

## Tests y calidad de código

Disponible en `backend/` y en `frontend/`:

```bash
npm test               # ejecuta la suite una vez
npm run test:watch     # modo watch (útil para el ciclo TDD)
npm run lint           # ESLint con la guía de estilo Airbnb + Prettier
npm run typecheck      # verificación de tipos de TypeScript
```

Sólo en `backend/`:

```bash
npm run test:coverage  # reporte de cobertura (texto + HTML en coverage/)
```

## Estructura

```
├── backend/
│   ├── src/
│   │   ├── controllers/     # HTTP → service; sesión simulada (header x-usuario-id)
│   │   ├── services/        # casos de uso: compra, cotización, calendario
│   │   ├── repositories/    # interfaces + implementaciones en memoria
│   │   ├── dtos/            # forma del body (zod)
│   │   ├── entities/        # TipoPase, FormaPago, Compra, Usuario, Momento…
│   │   ├── rules/           # reglas de negocio puras: precios, calendario, límites
│   │   ├── integrations/    # pasarela de pago y notificador (interfaces + simulados)
│   │   ├── config/          # Reloj (zona horaria Argentina)
│   │   ├── errors/          # errores de negocio tipados
│   │   ├── middlewares/     # errores de negocio → status HTTP
│   │   ├── utils/           # fechas y montos
│   │   ├── routes.ts · app.ts
│   │   └── server.ts        # composición de dependencias
│   └── tests/               # rules, services, adapters, api
└── frontend/
    ├── src/
    │   ├── components/      # Calendario, SelectorCantidad, FormularioVisitante…
    │   ├── pages/           # ComprarEntradas, MercadoPagoSimulado, Confirmacion
    │   ├── services/api.ts  # cliente HTTP
    │   └── styles/          # paleta FAQ 3 + fuente Lato
    └── tests/               # formulario y flujo completo (Testing Library)
```

## API

| Método y ruta | Descripción | Respuestas |
|---|---|---|
| `GET /api/calendario` | Días desde hoy hasta 1 mes después, con `habilitado` y `motivo` | 200 |
| `POST /api/compras/cotizar` | Precio de cada entrada y total | 200 · 400 · 422 |
| `POST /api/compras` | Registra la compra (requiere header `x-usuario-id`) | 201 · 400 · 401 · 402 · 422 |

Ejemplo de body de `POST /api/compras`:

```json
{
  "fechaVisita": "2026-10-20",
  "formaPago": "TARJETA",
  "entradas": [
    { "edad": 30, "tipoPase": "VIP" },
    { "edad": 8, "tipoPase": "COMUN" }
  ]
}
```

Los errores responden `{ "error": { "tipo": "ParqueCerradoError", "mensaje": "…" } }`.
