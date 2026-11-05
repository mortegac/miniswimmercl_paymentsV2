# Flujo de retorno MercadoPago (`/return-mp`)

> Investigación del 2026-05-06 — bug en validación de pagos aprobados y condiciones de aprobación/rechazo.

---

## 1. Descripción del flujo

Cuando un usuario completa (o cancela) el pago en la plataforma de MercadoPago, MP redirige al usuario a la URL configurada en `back_urls` de la preferencia. En este proyecto esa URL es:

```
https://<dominio>/return-mp/?status=...&payment_id=...&collection_status=...&...
```

La página `/return-mp` evalúa los parámetros recibidos y redirige al usuario a:
- `/recibo-pago` — si el pago fue aprobado
- `/rechazo-pago` — si el pago fue rechazado, cancelado o está pendiente

---

## 2. Parámetros recibidos de MercadoPago

| Parámetro | Ejemplo | Descripción |
|---|---|---|
| `status` | `approved` / `failure` / `pending` | Estado del pago |
| `collection_status` | `approved` / `rejected` / `pending` | Estado de la cobranza |
| `payment_id` | `1327092180` | ID del pago en MercadoPago |
| `collection_id` | `1327092180` | Igual a `payment_id` |
| `payment_type` | `credit_card` / `debit_card` / `ticket` | Método de pago |
| `external_reference` | `charge-1778077263267` | Referencia interna generada por la Lambda |
| `preference_id` | `3343781182-f98bc5da-...` | ID de la preferencia (formato: `{collector_id}-{uuid}`) |
| `merchant_order_id` | `40589597207` | ID de la orden en MP |
| `site_id` | `MLC` | País (Chile) |
| `processing_mode` | `aggregator` | Modo de procesamiento |

---

## 3. Bugs encontrados y corregidos

### Bug 1 — Lambda `mercadopagoStatus` usaba token TEST en producción

**Síntoma:** Pagos aprobados en producción devolvían `"Payment not found"` (404) al verificar el estado.

**Causa raíz:** La Lambda `mercadopagoStatusgen2lam` tenía `ENV=prod` pero el handler lee `process.env.environment` (minúscula). Al no encontrar la variable, `isProd = false` → usaba `MP_ACCESS_TOKEN_TEST` → no podía ver pagos de producción.

```typescript
// handler.ts
const enviroment = process.env.environment ?? "dev";   // lee "environment", minúscula
const isProd     = enviroment === "prod" || enviroment === "main";
// La Lambda tenía ENV=prod (mayúscula) → process.env.environment = undefined → isProd = false
```

**Fix aplicado:** Se agregó `environment=prod` a las variables de entorno de la Lambda `mercadopagoStatus`.

| Lambda | Variable antes | Variable después |
|---|---|---|
| `mercadopagoStart` | `environment=prod` ✅ | `environment=prod` ✅ |
| `mercadopagoStatus` | ❌ solo `ENV=prod` | `environment=prod` ✅ |

---

### Bug 2 — ReturnMP enviaba pagos sandbox a Lambda de producción

**Síntoma:** En testing local (localhost), los pagos aprobados por MercadoPago sandbox redirigían a `/rechazo-pago`.

**Causa raíz:** En localhost, `NavigationBar` usa `sandboxInitPoint` → el usuario paga en el entorno sandbox de MP → se genera un `payment_id` de sandbox. La Lambda de producción (con token real) no puede ver pagos sandbox → 404 → catch → `/rechazo-pago`.

```typescript
// NavigationBar.tsx
const isProd = window.location.hostname !== "localhost";
window.location.href = isProd ? preference.initPoint : preference.sandboxInitPoint;
//                                                      ↑ sandbox en localhost
```

**Fix aplicado:** `ReturnMP/index.tsx` detecta el entorno en tiempo de ejecución:
- **Localhost (sandbox):** confía en los parámetros de la URL (`status=approved` + `collection_status=approved`) sin llamar a la Lambda.
- **Producción:** verifica el estado real via Lambda → API de MercadoPago con token de producción.

---

## 4. Condiciones de PAGO APROBADO → `/recibo-pago`

### En localhost / sandbox

```
status = "approved"
AND collection_status = "approved"
```

No se llama a la Lambda. Se confía en los parámetros enviados por MP (aceptable en sandbox/testing).

### En producción

```
status = "approved"
AND payment_id presente
AND Lambda mercadopagoStatus devuelve result.status === "approved"
```

La Lambda consulta la API de MP con el token de producción y confirma el estado real del pago.

---

## 5. Condiciones de PAGO RECHAZADO → `/rechazo-pago`

| Condición | Causa típica en MercadoPago |
|---|---|
| `status = "failure"` | Tarjeta rechazada, fondos insuficientes, error del banco emisor |
| `status = "rejected"` | Rechazo por reglas antifraude, límite de crédito, tarjeta bloqueada |
| `status = "pending"` | Pago en efectivo (Multicaja, Serviestado) o transferencia bancaria pendiente de acreditación |
| `status = "approved"` pero Lambda retorna status ≠ `"approved"` | Pago revertido, disputa activa (`in_mediation`), o pago parcial |
| Excepción en Lambda | Error de red, credenciales inválidas, timeout → redirige a rechazo por seguridad |
| Ausencia de `payment_id` o `status` en URL | Acceso directo a la ruta sin params, URL mal formada |
| `collection_status ≠ "approved"` (sandbox) | Pago cancelado por el usuario en checkout sandbox |

### Detalle de `statusDetail` posibles (campo retornado por Lambda)

| `statusDetail` | Significado |
|---|---|
| `accredited` | Pago acreditado correctamente (ideal) |
| `pending_contingency` | Contingencia temporal, reintento automático |
| `pending_review_manual` | En revisión manual por MP |
| `cc_rejected_insufficient_amount` | Fondos insuficientes |
| `cc_rejected_bad_filled_security_code` | CVV incorrecto |
| `cc_rejected_bad_filled_date` | Fecha de vencimiento incorrecta |
| `cc_rejected_call_for_authorize` | Requiere autorización del banco |
| `cc_rejected_card_disabled` | Tarjeta bloqueada o inactiva |
| `cc_rejected_duplicated_payment` | Pago duplicado detectado |
| `cc_rejected_high_risk` | Rechazado por riesgo |

---

## 6. Estado de las Lambdas (producción)

| Lambda | ARN parcial | `environment` | Token usado |
|---|---|---|---|
| `mercadopagoStart` | `...mercadopagoStartgen2lamb-0n2VW1DGhSar` | `prod` | `MP_ACCESS_TOKEN` (producción) |
| `mercadopagoStatus` | `...mercadopagoStatusgen2lam-9r8ffkRNQZzc` | `prod` ✅ | `MP_ACCESS_TOKEN` (producción) |
| `mercadopagoRefund` | `...mercadopagoRefundgen2lam-nr1WMC8HC8mO` | `prod` | `MP_ACCESS_TOKEN` (producción) |
| `mercadopagoCommit` | `...mercadopagoCommitgen2lam-NzVMOSH1dGV8` | `prod` | `MP_ACCESS_TOKEN` (producción) |

Secret usado: `energica/mercadopago` (AWS Secrets Manager, región `us-east-2`)

---

## 7. Arquitectura del flujo completo

```
Usuario en /return-mp?status=approved&payment_id=XXX
    │
    ├─ localhost?
    │   ├─ SÍ → collection_status=approved? → SÍ → /recibo-pago
    │   │                                   → NO → /rechazo-pago
    │   │
    │   └─ NO (producción)
    │         ↓
    │   dispatch(setMPStatus(payment_id))
    │         ↓
    │   AppSync → Lambda mercadopagoStatus
    │         ↓
    │   MP API /v1/payments/{payment_id}  [token producción]
    │         ↓
    │   result.status === "approved"?
    │       SÍ → sessionStorage ← { email } → /recibo-pago
    │       NO → /rechazo-pago
    │   catch → /rechazo-pago
    │
    └─ status ≠ "approved" → /rechazo-pago
```

---

## 8. Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/pages/public/ReturnMP/index.tsx` | Lógica sandbox/prod separada; manejo explícito de `failure`, `pending`, `rejected` |
| Lambda `mercadopagoStatus` (AWS) | Agregada variable `environment=prod` via CLI |
