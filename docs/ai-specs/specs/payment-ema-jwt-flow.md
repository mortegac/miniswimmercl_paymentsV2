# Spec: Flujo EMA — Pago por JWT (`?pay=<token>`)

**Versión:** 1.0  
**Ruta:** `/` con parámetro `?pay=<JWT>`  
**Componentes principales:** `src/pages/public/Payment/index.tsx`, `src/pages/public/Payment/components/ResumePayment.tsx`

---

## 1. Objetivo

Permitir que un sistema externo (EMA u otro emisor) inicie un pago predefinido enviando un JWT en la URL. El flujo es completamente automático: el usuario llega a la pantalla de resumen sin necesidad de ingresar datos, y solo debe presionar "Continuar" para ser redireccionado a Webpay.

---

## 2. Diferencias clave respecto a flujos EVE y OCPP

| Aspecto | EVE / OCPP | EMA (JWT) |
|---|---|---|
| Entrada | `?id=<identificador>` | `?pay=<JWT>` |
| Consulta de estado | Query GraphQL al cargador | Ninguna |
| Ingreso de datos por usuario | Horas + email | Ninguno |
| Pantalla inicial | `StepChargingHours` (step 1) | `ResumePayment` (step 3) |
| Origen de `amount`, `glosa`, `email` | Calculado + ingresado | Decodificado del JWT |
| `typeOfCharger` en `wpStart` | `"EVE"` / `"OCPP"` | `"EMA"` |
| `chargingHours` en `wpStart` | `duration × 60` (minutos) | `0` |
| `idEve` en `wpStart` | `eve.eveId` | `""` |
| `stationId` en `wpStart` | `charger.stationId` | `""` |

---

## 3. Estructura del JWT

El JWT es generado externamente y firmado por el sistema emisor. El cliente lo **decodifica sin verificar firma** usando `jose.decodeJwt()`.

### Payload esperado

```json
{
  "sub": "EMA220464",
  "name": "Luis Iglesias",
  "iat": 1761251623,
  "email": "luisdanielrosell@gmail.com",
  "monto": 1206794,
  "glosa": "Instalacion cargador Luis Iglesias"
}
```

### Mapeo de campos

| Campo JWT | Tipo | Uso en el sistema |
|---|---|---|
| `sub` | `string` | Identificador del servicio/EMA (ej: `"EMA220464"`). No se envía a Webpay directamente. |
| `name` | `string` | Nombre del cliente → `shoppingCart.nameShoppingCartId` |
| `iat` | `number` | Timestamp Unix del token → `shoppingCart.order` |
| `email` | `string` | Email del pagador → `shoppingCart.usersShoppingCartId` + `wpStart.userId` |
| `monto` | `number` | Monto en CLP (entero) → `shoppingCart.totalPrice` + `wpStart.amount` |
| `glosa` | `string` | Descripción del servicio → `shoppingCart.glosa` + `wpStart.glosa` |

---

## 4. Flujo completo

### 4.1 Detección en `Payment/index.tsx`

Al montar el componente, `processUrlParams()` se ejecuta una única vez (controlado por `hasProcessed.current`):

```
searchParams.get('pay') !== null
  → dispatch(setStep(3))          ← salta directamente a ResumePayment
  → setJwt(payParam)              ← almacena JWT en estado local del componente
```

> `typeOfCharger` **no se modifica** en este flujo. Permanece `""` en el slice `paymentTransactions`.

### 4.2 Render inmediato de `ResumePayment`

`ChangeStep` recibe `step = 3` y renderiza `ResumePayment` con el prop `jwt`:

```tsx
<ResumePayment
  step={3}
  id={""}          // charger.stationId, vacío porque typeOfCharger === ""
  state={""}       // statusCharger, vacío en este flujo
  jwt={payParam}   // el JWT completo de la URL
/>
```

### 4.3 Decodificación del JWT y llamada a Webpay (`ResumePayment.useEffect`)

Cuando el componente recibe `jwt` con valor, el `useEffect([jwt])` se dispara automáticamente:

**Paso 1 — Decodificar:**
```typescript
const claims = jose.decodeJwt(jwt)
// claims = { sub, name, iat, email, monto, glosa }
```

> `jose.decodeJwt()` solo decodifica el payload Base64 — **no verifica la firma**. La validación de autenticidad del JWT es responsabilidad del backend.

**Paso 2 — Poblar el carrito:**
```typescript
dispatch(setShoppingCart({
  totalPrice: Number(claims.monto),       // ej: 1206794
  nameShoppingCartId: String(claims.name), // ej: "Luis Iglesias"
  order: Number(claims.iat),              // ej: 1761251623
  usersShoppingCartId: String(claims.email), // ej: "luisdanielrosell@gmail.com"
  glosa: String(claims.glosa),            // ej: "Instalacion cargador Luis Iglesias"
}))
```

**Paso 3 — Iniciar Webpay:**
```typescript
dispatch(setWPStart({
  amount: Number(claims.monto),    // ej: 1206794
  userId: String(claims.email),    // ej: "luisdanielrosell@gmail.com"
  glosa: String(claims.glosa),     // ej: "Instalacion cargador Luis Iglesias"
  idEve: "",
  stationId: "",
  typeOfCharger: "EMA",
  chargingHours: 0,
}))
```

### 4.4 Mutación GraphQL `WebpayStart`

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

**Variables (ejemplo con el JWT del §3):**
```json
{
  "idEve": "",
  "stationId": "",
  "userId": "luisdanielrosell@gmail.com",
  "amount": 1206794,
  "glosa": "Instalacion cargador Luis Iglesias",
  "chargingHours": 0,
  "type": "EMA"
}
```

**Retorna:** `{ order, token, url }`

### 4.5 Pantalla de resumen y botón "Continuar"

Una vez `setWPStart` completa con éxito, `WP.transaction` queda poblado con `{ token, url, order }`.

**Lo que muestra `ResumePayment`:**
- Nombre del cliente: `shoppingCart.nameShoppingCartId` — "Luis Iglesias"
- Email: `shoppingCart.usersShoppingCartId` — "luisdanielrosell@gmail.com"
- Descripción: `shoppingCart.glosa` — "Instalacion cargador Luis Iglesias"
- Total a pagar: `shoppingCart.totalPrice` formateado → `$ 1.206.794`
- Logo de Transbank (SVG embebido)
- Botón **"Continuar"** (componente `NavigationBar`)

**Estado del botón "Continuar":**

| Condición | Estado del botón |
|---|---|
| `WP.status === "loading"` | Deshabilitado + muestra `LoadingIcon` |
| `WP.status === "idle"` y `transaction.token === ""` | Deshabilitado |
| `WP.status === "idle"` y `transaction.token !== ""` | **Habilitado** — muestra "Continuar" |

### 4.6 Redirección a Webpay

El botón "Continuar" es de tipo `submit` dentro del `<form>`:

```html
<form action="{transaction.url}" method="POST">
  <input type="hidden" name="token_ws" value="{transaction.token}" />
  <!-- ... contenido del resumen ... -->
  <button type="submit">Continuar</button>
</form>
```

Al hacer clic, el browser realiza un POST a `transaction.url` con `token_ws` en el body → Webpay toma control.

---

## 5. Diagrama de transiciones de estado

```
URL /?pay=<JWT>
  └─► processUrlParams()
        └─► dispatch(setStep(3))
        └─► setJwt(payParam)
              └─► ResumePayment se monta con jwt prop
                    └─► useEffect([jwt]) dispara
                          ├─► jose.decodeJwt(jwt) → claims
                          ├─► dispatch(setShoppingCart(...))
                          └─► dispatch(setWPStart(...))
                                ├─► WP.status = "loading"
                                │     → botón deshabilitado + LoadingIcon
                                └─► WP.status = "idle"
                                      WP.transaction.token ≠ ""
                                        → botón "Continuar" habilitado
                                            └─► clic usuario
                                                  └─► POST a transaction.url
                                                        → Webpay
```

---

## 6. Casos de error y comportamiento esperado

| Caso | Comportamiento |
|---|---|
| JWT malformado (no decodificable) | `jose.decodeJwt` lanza excepción → capturada en `catch`, no se despacha nada, pantalla queda vacía sin feedback visual (comportamiento actual) |
| JWT válido pero campos faltantes (`monto`, `email`, `glosa`) | `Number(undefined) = 0`, `String(undefined) = "undefined"` → llama igual a `setWPStart` con valores degradados |
| `setWPStart` falla (error de red o GraphQL) | `WP.status = "failed"`, `transaction.token` permanece `""`, botón "Continuar" no se habilita |
| JWT expirado | El flujo actual no valida `exp` — `jose.decodeJwt` no verifica expiración. La validación de expiración es responsabilidad del backend al recibir `webpayStart` |

---

## 7. Archivos involucrados

| Archivo | Rol |
|---|---|
| `src/pages/public/Payment/index.tsx` | Detecta `?pay=`, despacha `setStep(3)`, almacena JWT en `useState` local |
| `src/pages/public/Payment/components/ResumePayment.tsx` | Decodifica JWT, despacha `setShoppingCart` + `setWPStart`, renderiza resumen y form POST |
| `src/pages/public/Payment/components/NavigationBar.tsx` | Botón "Continuar" con estado de carga, tipo `submit` dentro del form de Webpay |
| `src/stores/WP/slice.ts` | Thunk `setWPStart`, gestiona `transaction.token`, `transaction.url` |
| `src/stores/WP/services.ts` | Mutación `webpayStart` via GraphQL inline |
| `src/stores/PaymentTransactions/slice.ts` | `setShoppingCart` — popula `shoppingCart` con datos del JWT |
| `jose` (npm) | Decodifica el JWT en el cliente sin verificar firma |

---

## 8. Criterios de éxito

1. Dado `/?pay=<JWT válido>`, la pantalla de `ResumePayment` aparece directamente sin pasar por formulario de horas/email.
2. Los datos del JWT se muestran correctamente: email, glosa y monto formateado en CLP.
3. El botón "Continuar" muestra `LoadingIcon` mientras `WP.status === "loading"`.
4. Una vez obtenido `transaction.token`, el botón "Continuar" se habilita automáticamente.
5. Al presionar "Continuar", el browser redirige a Webpay mediante POST con `token_ws`.
6. La mutación `webpayStart` recibe `type: "EMA"`, `idEve: ""`, `stationId: ""`, `chargingHours: 0`.
7. El flujo completo ocurre **sin intervención del usuario** entre la carga de la URL y la habilitación del botón.
