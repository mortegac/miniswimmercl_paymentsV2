# Spec: Flujo de la Ruta Raíz — Inicio de Pago

**Versión:** 1.0  
**Ruta:** `/` (y `/:t`)  
**Componente principal:** `src/pages/public/Payment/index.tsx`

---

## 1. Objetivo

Permitir que un usuario inicie una sesión de carga eléctrica y sea redireccionado a Webpay para realizar el pago, a partir de un identificador de cargador recibido por URL.

---

## 2. Actores

- **Usuario final:** accede desde un QR físico en el cargador. No está autenticado.
- **Backend (AppSync/GraphQL):** responde queries de estado del cargador y ejecuta las mutaciones de Webpay.

---

## 3. Parámetros de entrada por URL

| Parámetro | Ejemplo | Tipo de cargador activado |
|---|---|---|
| `?id=EVE220621` | `/?id=EVE220621` | EVE |
| `?id=OCPPBE250600130` | `/?id=OCPPBE250600130` | STATION (OCPP) |
| `?pay=<JWT>` | `/?pay=eyJ...` | EMA (flujo separado, fuera de este spec) |
| _(sin parámetro)_ | `/` | CartNotExist — pantalla de error (step 0) |

---

## 4. Estado global relevante (Redux)

### Slice: `paymentTransactions`

| Campo | Tipo | Descripción |
|---|---|---|
| `step` | `number` | Controla qué componente se renderiza (ver §6) |
| `typeOfCharger` | `"EVE" \| "STATION" \| ""` | Tipo de cargador detectado |
| `duration` | `number` | Horas seleccionadas por el usuario (valor entero o 0.6 para ~36 min) |
| `pricing` | `number` | Precio calculado por `getCalculatePricing` (en CLP entero) |
| `transaction.usersPaymentTransactionsId` | `string` | Email del usuario |

### Slice: `eves`

| Campo | Tipo | Descripción |
|---|---|---|
| `status` | `"idle" \| "loading" \| "failed"` | Estado de la petición |
| `statusEve` | `"ONLINE" \| "OFFLINE" \| ""` | Disponibilidad calculada |
| `eve.eveId` | `string` | ID del EVE |

### Slice: `charger`

| Campo | Tipo | Descripción |
|---|---|---|
| `status` | `"idle" \| "loading" \| "failed"` | Estado de la petición |
| `statusCharger` | `"ONLINE" \| "OFFLINE" \| ""` | Disponibilidad calculada |
| `charger.stationId` | `string` | ID de la estación OCPP |

### Slice: `WP`

| Campo | Tipo | Descripción |
|---|---|---|
| `status` | `"idle" \| "loading" \| "failed"` | Estado de la petición |
| `transaction.token` | `string` | Token Webpay para el form POST |
| `transaction.url` | `string` | URL del form POST a Webpay |
| `transaction.order` | `string` | Orden de compra |

---

## 5. Máquina de steps

El componente raíz delega el render a `ChangeStep`, que usa `paymentTransactions.step` para seleccionar:

| Step | Componente | Cuándo se muestra |
|---|---|---|
| `0` | `CartNotExist` | Sin `?id` válido, o ID no reconocido |
| `1` | `StepChargingHours` | EVE u OCPP identificado y ONLINE |
| `2` | `StepChargingHours` | Alias de confirmación (mismo componente) |
| `3` | `ResumePayment` | Precio calculado y WP iniciado |
| `4` | `SearchIdEve` | Usuario presiona "Buscar cargador" manualmente |
| `5` | `EveOffline` | Cargador OFFLINE o sin datos |
| `6` | `StepEveInUse` | (Reservado) Cargador en uso |
| `7` | `StepChargingHours` | Alias de ingreso manual de horas/email |

---

## 6. Flujo EVE (`?id=EVExxxxxx`)

### 6.1 Detección de tipo

- `id` comienza con `"EVE"` (case-insensitive, comparar `substring(0,3).toUpperCase() === "EVE"`)
- Dispatch: `setTypeOfCharger("EVE")`
- Dispatch: `getEve({ eveId: id })` — el `eveId` se pasa tal cual viene en la URL (en mayúsculas: `id?.toUpperCase()`)
- Dispatch: `setStep(1)`

### 6.2 Query GraphQL: `GetEve`

```graphql
query GetEve($eveId: ID!) {
  getEve(eveId: $eveId) {
    eveId
    name
    eveState
    lastCheckedIn
    updatedAt
    currentActivity
  }
}
```

**Variables:**
```json
{ "eveId": "EVE220621" }
```

### 6.3 Cálculo de `statusEve` (en el slice)

| Condición | `statusEve` |
|---|---|
| Respuesta vacía o sin datos | `"OFFLINE"` |
| `updatedAt` hace más de 10 minutos | `"OFFLINE"` |
| `updatedAt` hace 10 minutos o menos | `"ONLINE"` |

### 6.4 Reacción al status en `Payment/index.tsx`

```
useEffect → si typeOfCharger === "EVE" && statusEve !== "ONLINE" → dispatch(setStep(5))
```

Esto ocurre cuando `statusCharger` o `statusEve` cambian (mismo effect para ambos tipos).

### 6.5 Formulario de horas y email (step 1 — `StepChargingHours`)

**Muestra:**
- `StatusEVE`: badge con ícono de encendido (verde=ONLINE, gris=OFFLINE) + label `DISPONIBLE` / `NO DISPONIBLE` + ID del cargador.
- Si `state !== "OFFLINE"`: controles de horas + campo email.

**Control de horas:**
- Botón `+` (`incrementHours`): `duration + 1`
- Botón `−` (`handleMinusClick`):
  - Si `duration > 1`: `duration - 1`
  - Si `duration === 1` y se hace clic 3+ veces en < 2 s: baja a `0.6` (representa ~36 min)
  - Mínimo efectivo: `0.6`

**Campo email:**
- Vinculado a `paymentTransactions.transaction.usersPaymentTransactionsId` vía `dispatch(setEmail(value))`
- Se actualiza en `onChange`, `onBlur`, y al presionar `Enter`

**Botón "Continuar" → `processPayment()`:**

Validaciones (en orden):
1. `id` no debe ser vacío/null
2. `duration > 0`
3. `usersPaymentTransactionsId` no debe ser vacío
4. Email debe pasar regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

Si alguna falla → `alert(mensaje)`, no continúa.

Si todas pasan:
- Calcula `chargingHoursInMinutes = duration < 1 ? 6 : duration * 60`
- Dispatch: `setCalculatePricing({ idEve: eve.eveId, stationId: "", chargingHours: chargingHoursInMinutes, typeOfCharger: "EVE" })`

### 6.6 API `getCalculatePricing` — EVE

**GraphQL query:**
```graphql
query getCalculateEvePricing($eveId: String!, $stationId: String!, $chargingHours: Float!) {
  CalculateEvePricing(eveId: $eveId, stationId: $stationId, chargingHours: $chargingHours)
}
```

**Variables (ejemplo 1 hora):**
```json
{
  "eveId": "EVE220621",
  "stationId": "",
  "chargingHours": 60
}
```

**Retorna:** `number` (precio en CLP entero, ej: `3469`)

### 6.7 Reacción al `pricing` — `useEffect([pricing])`

Cuando `pricing` cambia a un valor > 0:

1. Dispatch `setShoppingCart`:
```json
{
  "totalPrice": 3469,
  "nameShoppingCartId": "",
  "order": 0,
  "usersShoppingCartId": "hi@manuelo.dev",
  "glosa": "1 hrs de carga electrica Estacionamiento EVE220621"
}
```
> Nota: `glosa` usa `parseInt(duration)` (horas enteras), e `id` es `eve.eveId`.

2. Dispatch `setWPStart` → **mutación `WebpayStart`:**

```graphql
mutation WebpayStart(
  $idEve: String, $stationId: String, $userId: String,
  $amount: Int!, $glosa: String!, $chargingHours: Float, $type: WebpayStartType!
) {
  webpayStart(idEve: $idEve, stationId: $stationId, userId: $userId,
    amount: $amount, glosa: $glosa, chargingHours: $chargingHours, type: $type) {
    order
    token
    url
  }
}
```

**Variables (ejemplo 1 hora, EVE):**
```json
{
  "idEve": "EVE220621",
  "stationId": "",
  "userId": "hi@manuelo.dev",
  "amount": 3469,
  "glosa": "1 hrs de carga electrica Estacionamiento EVE220621",
  "chargingHours": 60,
  "type": "EVE"
}
```

**Retorna:** `{ order, token, url }`

3. Dispatch `setStep(3)` → renderiza `ResumePayment`

### 6.8 Pantalla de confirmación (step 3 — `ResumePayment`)

**Muestra:**
- Email del usuario (`shoppingCart.usersShoppingCartId`)
- Glosa del servicio (`shoppingCart.glosa`)
- Total a pagar (`shoppingCart.totalPrice` formateado como moneda CLP)
- Logo de Transbank (SVG embebido)
- Botón **"Continuar"** (en `NavigationBar`):
  - Deshabilitado mientras `WP.status === "loading"` o `transaction.token === ""`
  - Habilitado cuando `WP.status === "idle"` y `transaction.token !== ""`
  - Mientras carga: muestra `LoadingIcon` (`icon="three-dots"`)

**Mecanismo de redirección a Webpay:**

El botón "Continuar" es de tipo `submit` dentro de un `<form>` con:
```html
<form action="{transaction.url}" method="POST">
  <input type="hidden" name="token_ws" value="{transaction.token}" />
  ...
  <button type="submit">Continuar</button>
</form>
```

Al presionar "Continuar", el browser hace POST a la URL de Webpay con `token_ws`.

---

## 7. Flujo OCPP (`?id=OCPPBExxxxxx`)

### 7.1 Detección de tipo

- `id` comienza con `"OCPPBE"` (comparar `substring(0,6).toUpperCase() === "OCPPBE"`)
- `stationId` = `id.substring(6)` (ej: `"OCPPBE250600130"` → `"250600130"`)
- Dispatch: `setTypeOfCharger("STATION")`
- Dispatch: `getCharger({ stationId: "250600130" })`
- Dispatch: `setStep(1)`

### 7.2 Query GraphQL: `getOneCharger`

```graphql
query getOneCharger($stationId: ID!) {
  getCharger(stationId: $stationId) {
    stationId
    fantasyName
    connectorStatus
    lastCheckedIn
    updatedAt
  }
}
```

**Variables:**
```json
{ "stationId": "250600130" }
```

### 7.3 Cálculo de `statusCharger` (en el slice)

| Condición | `statusCharger` |
|---|---|
| `updatedAt` hace más de 10 minutos | `"OFFLINE"` |
| `connectorStatus` === `"Available"` o `"Preparing"` (y ≤10 min) | `"ONLINE"` |
| Cualquier otro `connectorStatus` (y ≤10 min) | `"OFFLINE"` |
| Sin `updatedAt` | valor crudo de `connectorStatus` |

**Estados OCPP conocidos:** `Available`, `Preparing`, `Charging`, `SuspendedEVSE`, `SuspendedEV`, `Finishing`, `Reserved`, `Unavailable`, `Faulted`, `Unknown`

### 7.4 Formulario (mismo que EVE — §6.5)

Idéntico al flujo EVE con la diferencia en cómo se obtiene el `id` para mostrar en `StatusEVE` y en los parámetros de las APIs.

### 7.5 API `getCalculatePricing` — OCPP

**Variables (ejemplo 1 hora):**
```json
{
  "eveId": "",
  "stationId": "250600130",
  "chargingHours": 60
}
```

### 7.6 Mutación `WebpayStart` — OCPP

**Variables (ejemplo 1 hora):**
```json
{
  "idEve": "",
  "stationId": "250600130",
  "userId": "hi@manuelo.dev",
  "amount": 3469,
  "glosa": "1 hrs de carga electrica Estacionamiento 250600130",
  "chargingHours": 60,
  "type": "OCPP"
}
```

> Nota: `glosa` usa `charger.stationId` como identificador (no el `id` completo con prefijo `OCPPBE`).

---

## 8. Estados de carga y transiciones de UI

```
URL load
  └─► dispatch getEve/getCharger
        ├─► status = "loading"
        │     → mostrar <Loading />
        └─► status = "idle"
              ├─► statusEve/Charger = "ONLINE"  → step 1 (formulario activo)
              └─► statusEve/Charger = "OFFLINE" → step 5 (EveOffline)

processPayment()
  └─► dispatch setCalculatePricing
        ├─► status = "loading" (WP.status)
        │     → botón "Continuar" deshabilitado
        └─► pricing > 0
              └─► dispatch setWPStart
                    ├─► status = "loading"
                    │     → NavigationBar muestra LoadingIcon
                    └─► transaction.token !== ""
                          → step 3 + botón "Continuar" habilitado
```

---

## 9. Casos de error y comportamiento esperado

| Caso | Comportamiento |
|---|---|
| Sin parámetro `?id` | `setStep(0)` → `CartNotExist` |
| ID no reconocido (no empieza con EVE ni OCPPBE) | `setStep(0)` → `CartNotExist` |
| `getEve` retorna vacío | `statusEve = "OFFLINE"` → `setStep(5)` |
| `updatedAt` del cargador > 10 minutos | `status = "OFFLINE"` → `setStep(5)` |
| Formulario con `duration = 0` | `alert("Error: La duración debe ser mayor a 0")` |
| Formulario sin email | `alert("Error: Email es requerido")` |
| Email con formato inválido | `alert("Error: Formato de email inválido")` |
| `getCalculatePricing` falla | Error capturado en `catch`, no avanza a step 3 |
| `wpStart` falla | `WP.status = "failed"`, botón no se habilita |

---

## 10. Archivos involucrados

| Archivo | Rol |
|---|---|
| `src/pages/public/Payment/index.tsx` | Orquestador principal. Detecta tipo de cargador desde URL, despacha queries, controla step |
| `src/pages/public/Payment/components/StepChargingHours.tsx` | Formulario de horas + email. Ejecuta `processPayment()`, `setCalculatePricing`, `setWPStart` |
| `src/pages/public/Payment/components/ResumePayment.tsx` | Resumen de pago. Form POST a Webpay |
| `src/pages/public/Payment/components/NavigationBar.tsx` | Botón "Continuar" con estado de carga y submit del form |
| `src/pages/public/Payment/components/StatusEVESTATION.tsx` | Badge visual de estado del cargador |
| `src/pages/public/Payment/components/EveOffline.tsx` | Pantalla de cargador no disponible |
| `src/stores/Eves/slice.ts` | Thunk `getEve`, cálculo de `statusEve` basado en `updatedAt` |
| `src/stores/Eves/services.ts` | Query GraphQL `GetEve` via Amplify typed client |
| `src/stores/Charger/slice.ts` | Thunk `getCharger`, cálculo de `statusCharger` |
| `src/stores/Charger/services.ts` | Query GraphQL `getOneCharger` via Amplify typed client |
| `src/stores/WP/slice.ts` | Thunks `setWPStart`, `setWPCommit`, `setWPStatus` |
| `src/stores/WP/services.ts` | Mutaciones GraphQL inline via `generateClient()` |
| `src/stores/PaymentTransactions/slice.ts` | `setCalculatePricing`, `setStep`, `setEmail`, `setDuration`, `setShoppingCart`, `setTypeOfCharger` |
| `src/router/paths.tsx` | Define `PUBLIC = "/"` y `PUBLIC_TOKEN = ":t"` |

---

## 11. Criterios de éxito

1. Con `/?id=EVE220621`: se carga estado del EVE, si es ONLINE muestra formulario, al completarlo y presionar "Continuar" se genera token Webpay y el formulario hace POST a la URL de Webpay.
2. Con `/?id=OCPPBE250600130`: ídem con `stationId = "250600130"` y `type: "OCPP"`.
3. Si el cargador lleva más de 10 minutos sin `updatedAt`: muestra pantalla EveOffline (step 5).
4. Formulario no avanza si email es inválido o `duration === 0`.
5. El botón "Continuar" en `ResumePayment` permanece deshabilitado hasta que `transaction.token` tenga valor.
6. Al presionar "Continuar" (habilitado), el browser redirige a la URL de Webpay vía form POST con `token_ws`.
