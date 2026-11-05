# Spec: Integración MercadoPago — Implementación completa

**Versión:** 1.0  
**Directorio:** `docs/ai-specs/specs/mcp-mercadopago/`  
**Estado del MCP en el proyecto:** No instalado — requiere instalación previa (ver Fase 0)

---

## Contexto

El proyecto actualmente procesa pagos exclusivamente a través de Transbank Webpay Plus (flujo documentado en `payment-root-route-flow.md` y `payment-ema-jwt-flow.md`).

Este spec cubre la implementación de **MercadoPago Checkout Pro** como procesador de pagos alternativo/adicional. El patrón de integración sigue el mismo modelo de redirección que Webpay: el backend genera una preferencia de pago, devuelve una URL de pago (`init_point`), y el browser redirige al usuario al checkout de MercadoPago.

---

## Fase 0 — Instalación del MCP Server de MercadoPago

> El MCP no está instalado en el proyecto. Esta fase es prerequisito para las demás.

### Por qué el MCP

El MCP Server de MercadoPago permite a Claude Code:
- Buscar documentación oficial de MP en lenguaje natural durante el desarrollo
- Crear usuarios de prueba para testing
- Configurar y simular webhooks sin salir del IDE
- Evaluar la calidad de la integración contra el checklist oficial de MP

### Opción recomendada para Claude Code: Servidor local (demo oficial)

**Referencia:** https://www.mercadopago.com.ar/developers/es/docs/mcp-server/overview  
**Repositorio:** https://github.com/mercadolibre/demo-mercadopago-mcp-server

#### Paso 0.1 — Clonar y compilar el servidor MCP

```bash
# Clonar en una ubicación global (fuera del proyecto)
git clone https://github.com/mercadolibre/demo-mercadopago-mcp-server.git ~/tools/demo-mercadopago-mcp-server
cd ~/tools/demo-mercadopago-mcp-server
npm install
npm run build
```

#### Paso 0.2 — Obtener credenciales de MercadoPago

1. Ingresar a https://www.mercadopago.com.ar/developers/panel/app
2. Crear o seleccionar una aplicación
3. Obtener:
   - `CLIENT_ID` (ID de aplicación)
   - `CLIENT_SECRET` (Clave secreta)
4. Para Chile usar Site ID: `MLC`

#### Paso 0.3 — Configurar el MCP en Claude Code

Agregar la siguiente configuración al archivo de settings de Claude Code (`~/.claude/settings.json` o el settings.json del proyecto):

```json
{
  "mcpServers": {
    "mercadopago": {
      "command": "node",
      "args": ["~/tools/demo-mercadopago-mcp-server/build/index.js"],
      "env": {
        "CLIENT_ID": "<tu-mercadopago-client-id>",
        "CLIENT_SECRET": "<tu-mercadopago-client-secret>",
        "DEBUG": "true"
      }
    }
  }
}
```

> **Importante:** No hardcodear `CLIENT_ID` ni `CLIENT_SECRET` en archivos del repositorio. Usar variables de entorno del sistema o un gestor de secretos.

#### Paso 0.4 — Verificar instalación

Una vez configurado, Claude Code podrá ejecutar tools como:
- `search_documentation` — buscar en docs de MP
- `create_test_user` — crear usuarios de prueba (vendedor y comprador)
- `save_webhook` / `simulate_webhook` — configurar y probar notificaciones
- `quality_checklist` / `quality_evaluation` — validar calidad de integración

#### Herramientas MCP disponibles (9 en total)

| Tool | Uso en este proyecto |
|---|---|
| `search_documentation` | Consultar docs de Checkout Pro, preferencias, webhooks durante desarrollo |
| `create_test_user` | Crear cuentas vendedor/comprador para testear el flujo end-to-end |
| `add_money_test_user` | Agregar saldo a cuenta de prueba compradora |
| `save_webhook` | Configurar la URL de notificaciones IPN/webhook |
| `simulate_webhook` | Simular notificación de pago aprobado/rechazado antes de tener transacciones reales |
| `notifications_history_diagnostics` | Diagnosticar problemas de entrega de webhooks en staging |
| `quality_checklist` | Obtener lista de campos requeridos para aprobar la integración en producción |
| `quality_evaluation` | Evaluar calidad usando un `payment_id` real de producción |
| `get_application` | Verificar configuración de la aplicación MP registrada |

---

## Fase 1 — Arquitectura de la integración

### Patrón de pago: Checkout Pro (redirección)

Igual que Webpay, el flujo es:

```
Frontend → Backend (GraphQL) → API MP → init_point URL
Frontend redirige a init_point
Usuario paga en MP
MP redirige a back_url/success (o failure/pending)
Frontend valida el pago
```

### Site ID para Chile

```
MLC
```

### Variables de entorno requeridas (backend — AppSync Lambda/resolver)

| Variable | Descripción |
|---|---|
| `MP_ACCESS_TOKEN` | Access token de producción de la app MP |
| `MP_ACCESS_TOKEN_TEST` | Access token de sandbox/test |
| `MP_WEBHOOK_SECRET` | Secreto para validar firma de notificaciones IPN |

### URLs de retorno de MercadoPago

| Tipo | Ruta sugerida | Descripción |
|---|---|---|
| `back_url.success` | `/return-mp?status=approved` | Pago aprobado |
| `back_url.failure` | `/return-mp?status=failure` | Pago rechazado |
| `back_url.pending` | `/return-mp?status=pending` | Pago pendiente |
| `notification_url` | (endpoint backend) | Webhook IPN de MP |

---

## Fase 2 — Backend (AppSync GraphQL)

### Paso 2.1 — Nuevas mutaciones y queries en el schema

Agregar al schema de Amplify (archivo en `amplify/data/`):

#### Mutación: `mercadopagoStart`

Crea una preferencia de pago en MP y retorna la `init_point` URL.

**Input:**
```graphql
type MercadopagoStartInput {
  amount: Float!
  glosa: String!
  userId: String!           # Email del comprador
  idEve: String
  stationId: String
  chargingHours: Float
  type: MercadopagoStartType!  # EVE | OCPP | EMA
  externalReference: String!   # ID único de la transacción (buy_order)
}

enum MercadopagoStartType {
  EVE
  OCPP
  EMA
}
```

**Response:**
```graphql
type MercadopagoStartResponse {
  preferenceId: String!
  initPoint: String!        # URL para redirigir al usuario (producción)
  sandboxInitPoint: String! # URL para redirigir al usuario (sandbox)
}
```

#### Query: `mercadopagoStatus`

Consulta el estado de un pago por su `payment_id` o `preference_id`.

**Input:** `paymentId: String!`

**Response:**
```graphql
type MercadopagoStatusResponse {
  paymentId: String!
  status: String!             # approved | rejected | pending | cancelled
  statusDetail: String!
  amount: Float!
  glosa: String!
  externalReference: String!
  payerEmail: String!
  paymentMethodId: String!
  dateApproved: String
}
```

### Paso 2.2 — Resolver/Lambda: `mercadopagoStart`

La función Lambda que implementa esta mutación debe:

1. Recibir los parámetros del input
2. Generar un `external_reference` único (UUID o buy_order)
3. Llamar a la API de MercadoPago:

```http
POST https://api.mercadopago.com/checkout/preferences
Authorization: Bearer {{MP_ACCESS_TOKEN}}
Content-Type: application/json

{
  "items": [
    {
      "id": "{{externalReference}}",
      "title": "{{glosa}}",
      "quantity": 1,
      "unit_price": {{amount}},
      "currency_id": "CLP"
    }
  ],
  "payer": {
    "email": "{{userId}}"
  },
  "back_urls": {
    "success": "{{FRONTEND_URL}}/return-mp?status=approved",
    "failure": "{{FRONTEND_URL}}/return-mp?status=failure",
    "pending": "{{FRONTEND_URL}}/return-mp?status=pending"
  },
  "auto_return": "approved",
  "external_reference": "{{externalReference}}",
  "notification_url": "{{BACKEND_WEBHOOK_URL}}/mp-webhook",
  "statement_descriptor": "ENERGICA",
  "binary_mode": true
}
```

> `binary_mode: true` simplifica el flujo: solo existe `approved` o `rejected`, nunca `pending`.

4. Retornar `preferenceId`, `initPoint` y `sandboxInitPoint`

### Paso 2.3 — Resolver/Lambda: `mercadopagoStatus`

Llama a:
```http
GET https://api.mercadopago.com/v1/payments/{{paymentId}}
Authorization: Bearer {{MP_ACCESS_TOKEN}}
```

Extrae y retorna los campos del `MercadopagoStatusResponse`.

---

## Fase 3 — Frontend (React + Redux)

### Paso 3.1 — Nuevo slice: `src/stores/MercadoPago/`

Crear los siguientes archivos siguiendo el patrón del slice `WP`:

#### `src/stores/MercadoPago/types.ts`

```typescript
export type MercadoPagoInput = {
  amount?: number;
  userId?: string;
  glosa?: string;
  idEve?: string;
  stationId?: string;
  chargingHours?: number;
  typeOfCharger?: string;
  paymentId?: string;
};

export type MercadoPagoPreference = {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
};

export const emptyPreference: MercadoPagoPreference = {
  preferenceId: "",
  initPoint: "",
  sandboxInitPoint: "",
};

export type MercadoPagoStatusData = {
  paymentId: string;
  status: string;        // "approved" | "rejected" | "pending"
  statusDetail: string;
  amount: number;
  glosa: string;
  externalReference: string;
  payerEmail: string;
  paymentMethodId: string;
  dateApproved: string;
};
```

#### `src/stores/MercadoPago/services.ts`

```typescript
// Usa generateClient() igual que WP/services.ts
// Mutación: mercadopagoStart → retorna MercadoPagoPreference
// Query: mercadopagoStatus → retorna MercadoPagoStatusData
```

#### `src/stores/MercadoPago/slice.ts`

Estado inicial:
```typescript
{
  status: "idle" | "loading" | "failed";
  preference: MercadoPagoPreference;    // resultado de mercadopagoStart
  statusData: MercadoPagoStatusData;    // resultado de mercadopagoStatus
  errorMessage: string;
}
```

Thunks:
- `setMPStart(input: MercadoPagoInput)` → llama `mercadopagoStart`, popula `preference`
- `setMPStatus(paymentId: string)` → llama `mercadopagoStatus`, popula `statusData`

Selectors:
- `selectMP = (state: RootState) => state.mercadoPago`

#### `src/stores/store.ts` — agregar reducer

```typescript
import mercadoPagoReducer from "./MercadoPago/slice";

// En configureStore:
mercadoPago: mercadoPagoReducer,
```

### Paso 3.2 — Integración en el flujo existente de pago

El punto de integración es `StepChargingHours.tsx` en la función `processPayment()`. 

**Decisión de diseño:** agregar selector de procesador de pago (Webpay / MercadoPago) o activar MP condicionalmente por tipo de cargador. Esta decisión debe cerrarse antes de implementar.

**Opción A — Botón "Pagar con MercadoPago" adicional** (recomendada):

En `StepChargingHours.tsx`, junto al botón "Continuar" actual (que usa Webpay), agregar:

```typescript
const processMercadoPago = () => {
  // Mismas validaciones que processPayment()
  const chargingHoursInMinutes = duration < 1 ? 6 : duration * 60;
  
  dispatch(setMPStart({
    amount: Number(pricing),
    userId: usersPaymentTransactionsId,
    glosa: `${parseInt(duration.toString())} hrs de carga electrica Estacionamiento ${id}`,
    idEve: typeOfCharger === "EVE" ? eve?.eveId : "",
    stationId: typeOfCharger === "STATION" ? charger?.stationId : "",
    typeOfCharger: typeOfCharger === "EVE" ? "EVE" : "OCPP",
    chargingHours: chargingHoursInMinutes,
  }));
};
```

Cuando `MP.preference.initPoint` se popula → redirigir:
```typescript
useEffect(() => {
  if (preference.initPoint) {
    window.location.href = isProduction()
      ? preference.initPoint
      : preference.sandboxInitPoint;
  }
}, [preference.initPoint]);
```

**Opción B — Reemplazar Webpay por MercadoPago** (cambio disruptivo, requiere decisión explícita).

### Paso 3.3 — Nueva ruta de retorno: `/return-mp`

Crear los siguientes archivos (siguiendo patrón de `src/pages/public/Return/`):

```
src/pages/public/ReturnMP/
  index.tsx               ← componente principal
  components/
    Layout.tsx            ← igual que Return/components/Layout.tsx
    Logo.tsx
    NavigationBar.tsx
```

#### Lógica de `ReturnMP/index.tsx`

```typescript
// Lee de URL:
const status = searchParams.get("status");       // "approved" | "failure" | "pending"
const paymentId = searchParams.get("payment_id"); // ID numérico del pago
const preferenceId = searchParams.get("preference_id");
const externalReference = searchParams.get("external_reference");
```

**Flujos según `status`:**

| `status` en URL | Acción |
|---|---|
| `"approved"` | Llamar `setMPStatus(paymentId)` → validar `statusData.status === "approved"` → enviar email → redirigir a `/recibo-pago` |
| `"failure"` | Llamar `setMPStatus(paymentId)` → redirigir a `/rechazo-pago` |
| `"pending"` | Mostrar pantalla de pago pendiente (si `binary_mode: true`, este caso no ocurre) |

### Paso 3.4 — Agregar ruta en el router

En `src/router/paths.tsx`:
```typescript
export const PUBLIC_RETURN_MP = "/return-mp";
```

En `src/router/PublicRoute.tsx`:
```typescript
import ReturnMP from "../pages/public/ReturnMP";
// ...
{ path: PUBLIC_RETURN_MP, element: <ReturnMP /> }
```

---

## Fase 4 — Testing con MCP

### Paso 4.1 — Crear usuarios de prueba

Usando el MCP tool `create_test_user`:
```
Crear un usuario vendedor (seller) en MLC con saldo 0
Crear un usuario comprador (buyer) en MLC con saldo inicial 2.000.000 CLP
```

### Paso 4.2 — Configurar webhook para testing

Usando el MCP tool `save_webhook`:
```
Configurar notification_url con la URL del backend de staging
Suscribir al topic: payment
```

### Paso 4.3 — Simular pago aprobado

Usando el MCP tool `simulate_webhook`:
```
Simular notificación de pago aprobado para la preference creada en el test
```

### Paso 4.4 — Validar calidad de integración

Usando el MCP tool `quality_checklist` → obtener lista de campos requeridos.  
Usando el MCP tool `quality_evaluation` → evaluar con un `payment_id` de producción real.

---

## Fase 5 — Variables de entorno del frontend

Agregar a `.env.local` (desarrollo) y `.env.production`:

```bash
# MercadoPago
VITE_MP_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  # dev
# VITE_MP_PUBLIC_KEY=APP_USR-xxxx...                          # prod
```

> La `PUBLIC_KEY` solo se usa si se implementa Checkout Bricks (formulario embebido). Para Checkout Pro (redirección) no se necesita en el frontend.

---

## Resumen de archivos a crear/modificar

### Archivos nuevos

| Archivo | Descripción |
|---|---|
| `src/stores/MercadoPago/types.ts` | Tipos TypeScript del slice |
| `src/stores/MercadoPago/services.ts` | GraphQL inline: `mercadopagoStart`, `mercadopagoStatus` |
| `src/stores/MercadoPago/slice.ts` | Redux slice: thunks + state + selectors |
| `src/pages/public/ReturnMP/index.tsx` | Manejo del retorno desde MP |
| `src/pages/public/ReturnMP/components/Layout.tsx` | Layout de la pantalla de retorno |

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/stores/store.ts` | Agregar `mercadoPago: mercadoPagoReducer` |
| `src/router/paths.tsx` | Agregar `PUBLIC_RETURN_MP = "/return-mp"` |
| `src/router/PublicRoute.tsx` | Agregar ruta `/return-mp → <ReturnMP />` |
| `src/pages/public/Payment/components/StepChargingHours.tsx` | Agregar botón + lógica `processMercadoPago()` |
| `amplify/data/*.schema.ts` | Agregar tipos `MercadopagoStart` y `MercadopagoStatus` |
| `.env.local` / `.env.production` | Variables MP del frontend (si aplica) |

### Archivos MCP (fuera del repositorio)

| Ubicación | Descripción |
|---|---|
| `~/tools/demo-mercadopago-mcp-server/` | Servidor MCP clonado y compilado |
| `~/.claude/settings.json` | Configuración del MCP en Claude Code |

---

## Criterios de éxito

1. Claude Code puede ejecutar `search_documentation` del MCP de MP sin errores.
2. Con el flujo EVE/OCPP: al presionar "Pagar con MercadoPago" el browser redirige a `preference.initPoint` / `preference.sandboxInitPoint`.
3. Tras pago aprobado en sandbox MP, el retorno llega a `/return-mp?status=approved&payment_id=<id>`.
4. La pantalla `/return-mp` valida el pago vía `mercadopagoStatus` y redirige a `/recibo-pago`.
5. Tras pago rechazado, el retorno llega a `/return-mp?status=failure` y redirige a `/rechazo-pago`.
6. La mutación `mercadopagoStart` incluye `external_reference`, `back_urls` y `notification_url`.
7. `quality_evaluation` con un pago de producción retorna puntuación ≥ umbral aceptado por MP.
