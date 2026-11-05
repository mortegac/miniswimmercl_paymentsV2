# Informe Ejecutivo: Flujo de Persistencia MercadoPago en PaymentTransaction

> Auditoría del 2026-05-06 — Proyectos: `energica_payments` + `eve-backend-v2`

---

## Resumen Ejecutivo

El flujo de pagos MercadoPago tiene un **gap crítico en la capa de persistencia**: el usuario ve "pago aprobado" en el frontend, pero **no se crea automáticamente ningún registro en la tabla `PaymentTransaction`**. El resolver `mercadopagoCommit` — el único que persiste la transacción — nunca es invocado desde el flujo web actual.

**Estado actual:**
```
Frontend:  Start (no crea registro) → MP Checkout → Status (solo consulta MP)
Backend:   mercadopagoCommit ← NUNCA SE LLAMA DESDE EL FLUJO WEB
Resultado: DB vacía de transacciones MP aprobadas
```

**Estado requerido:**
```
Frontend:  Start → MP Checkout → Status → ✅ navega a /recibo-pago
Backend:   Webhook/Cron → Commit (automático) → Registro creado en DB
```

---

## 1. Handlers del Backend — Análisis Individual

### 1.1 `mercadopagoStart`

| Atributo | Detalle |
|---|---|
| **Archivo** | `eve-backend-v2/amplify/resolvers/mercadopagoStart/handler.ts` |
| **Crea registro en DB** | ❌ NO |
| **Actualiza status** | ❌ NO |
| **Rol** | Crea preferencia en la API de MercadoPago y retorna URLs de checkout |

**Flujo interno:**
1. Valida `amount > 0`, `userId`, `glosa`
2. Obtiene `access_token` desde AWS Secrets Manager (`energica/mercadopago`)
3. Llama a `POST https://api.mercadopago.com/checkout/preferences`
4. Retorna `{ preferenceId, initPoint, sandboxInitPoint }`

**Gap:** No hay registro de que se inició un pago. Si el usuario abandona en el checkout de MP, no queda trazabilidad.

---

### 1.2 `mercadopagoStatus`

| Atributo | Detalle |
|---|---|
| **Archivo** | `eve-backend-v2/amplify/resolvers/mercadopagoStatus/handler.ts` |
| **Crea registro en DB** | ❌ NO |
| **Actualiza status** | ❌ NO |
| **Rol** | Query de consulta — verifica estado en la API de MP |

**Flujo interno:**
1. Recibe `paymentId`
2. Llama a `GET https://api.mercadopago.com/v1/payments/{paymentId}`
3. Retorna `{ paymentId, status, statusDetail, amount, glosa, externalReference, payerEmail, paymentMethodId, dateApproved }`

**Gap:** Es solo una consulta. No escribe nada en la base de datos. El frontend lo usa en `/return-mp` para decidir si redirige a éxito o rechazo, pero no persiste la decisión.

---

### 1.3 `mercadopagoCommit` ← **Único que crea el registro**

| Atributo | Detalle |
|---|---|
| **Archivo** | `eve-backend-v2/amplify/resolvers/mercadopagoCommit/handler.ts` |
| **Crea registro en DB** | ✅ SÍ |
| **Actualiza status** | N/A (crea directamente con status final) |
| **Status creado** | `"CAPTURED"` |
| **Llamado desde frontend** | ❌ NO — gap crítico |

**Campos que persiste:**

| Campo | Valor |
|---|---|
| `paymentTransactionId` | `"mp-{paymentId}"` |
| `paymentMethod` | `"mercadopago"` |
| `status` | `"CAPTURED"` (hardcodeado — solo pagos aprobados) |
| `amount` | `param.amount` o `payment.transaction_amount` |
| `buy_order` | `String(paymentId)` |
| `token` | `String(paymentId)` |
| `glosa` | `param.glosa` o `payment.description` |
| `usersPaymentTransactionsId` | `payerEmail` |
| `userName` | `payerEmail` (usa email como nombre) |
| `payment_type_code` | `payment.payment_method_id` (ej: `"credit_card"`) |
| `card_detail` | `payment.payment_type_id` (ej: `"visa"`) |
| `authorization_code` | `payment.authorization_code` o `payment.id` |
| `response_code` | `payment.status_detail` |
| `transaction_date` | `payment.date_approved` |
| `accounting_date` | `payment.money_release_date` |
| `session_id` | `external_reference` |
| `transactionType` | `EVE \| EMA \| OCPP \| OTHER` |
| `eveId` | Parámetro opcional |
| `stationId` | Parámetro opcional |
| `residenceId` | Parámetro opcional |
| `userPhone` | `""` (siempre vacío) |
| `paymentsProcessorCommission` | `0` (no se calcula) |
| `vci` | `""` (campo Webpay, no aplica) |

**Condición de creación:** Solo crea el registro si `payment.status === "approved"` en la API de MP. Si el pago no está aprobado, lanza excepción y no persiste nada.

---

### 1.4 `mercadopagoRefund`

| Atributo | Detalle |
|---|---|
| **Archivo** | `eve-backend-v2/amplify/resolvers/mercadopagoRefund/handler.ts` |
| **Crea registro en DB** | ❌ NO |
| **Actualiza status** | ✅ SÍ — con riesgo de inconsistencia |

**Flujo de estados:**

```
CAPTURED → (reembolso total)   → REVERSED
CAPTURED → (reembolso parcial) → PARTIALLY_NULLIFIED
```

**Riesgo crítico:** El reembolso se procesa primero en MP API y luego se actualiza la DB. Si la actualización en DB falla, el error se silencia (`console.error`) y no se reintenta. El dinero fue devuelto pero el registro en DB sigue en `CAPTURED`.

---

## 2. Schema `PaymentTransaction` — Campos y Estados

### 2.1 Campos disponibles

```typescript
PaymentTransaction: a.model({
  paymentTransactionId: a.id().required(),      // PK: "mp-{paymentId}"
  status: a.string(),                           // Estado actual
  paymentMethod: a.string().default('webpay'),  // "mercadopago" | "webpay"
  amount: a.float().default(0),                 // Monto CLP
  date: a.datetime(),                           // Timestamp ISO
  buy_order: a.string(),                        // paymentId de MP
  token: a.string(),                            // paymentId de MP
  payment_type_code: a.string(),                // "credit_card" | "debit_card"
  card_detail: a.string(),                      // "visa" | "mastercard"
  authorization_code: a.string(),               // Código autorización
  response_code: a.string(),                    // status_detail de MP
  transaction_date: a.string(),                 // date_approved de MP
  accounting_date: a.string(),                  // money_release_date de MP
  usersPaymentTransactionsId: a.id(),           // Email usuario
  transactionType: a.enum(['EVE','EMA','OCPP','OTHER']),
  // Relaciones opcionales
  eveId, stationId, residenceId, eveChargeEventId, refundId
})
```

### 2.2 Estados posibles en MercadoPago

| Status en DB | Cuándo se asigna | Quién lo asigna |
|---|---|---|
| `CAPTURED` | Pago aprobado y committeado | `mercadopagoCommit` al crear |
| `REVERSED` | Reembolso total procesado | `mercadopagoRefund` al actualizar |
| `PARTIALLY_NULLIFIED` | Reembolso parcial procesado | `mercadopagoRefund` al actualizar |
| *(ninguno)* | Pago iniciado sin commit | No hay estado de "pendiente" |

### 2.3 Índices secundarios disponibles en el backend desplegado

| Índice | Campos | Query disponible |
|---|---|---|
| Primary | `paymentTransactionId` | `getPaymentTransaction` |
| `byStatus` | `status`, `date` | `listPaymentTransactionByStatusAndDate` |
| `byToken` | `token` | `listPaymentTransactionByToken` |
| `byTransactionType` | `transactionType`, `date` | `listPaymentTransactionByTransactionTypeAndDate` |
| `byResidenceId` | `residenceId`, `date` | `listPaymentTransactionByResidenceIdAndDate` |
| `byPaymentMethod` | `paymentMethod`, `date` | `listPaymentTransactionByPaymentMethodAndDate` ⚠️ no desplegado aún |

> **Nota:** El índice `byPaymentMethod` está definido en `main.schema.ts` del backoffice pero **no ha sido desplegado** al backend activo. El campo `paymentMethod` tampoco está en la introspección actual.

---

## 3. Flujo de Estados End-to-End

```
┌─────────────────────────────────────────────────────────────────┐
│              FLUJO COMPLETO MERCADOPAGO + DB                     │
└─────────────────────────────────────────────────────────────────┘

FASE 1 — INICIO (Frontend + mercadopagoStart)
──────────────────────────────────────────────
  [Sin registro en DB]
  Usuario → clic "Pagar con MercadoPago"
       ↓
  dispatch(setMPStart({ amount, userId, glosa, idEve, stationId, type }))
       ↓
  GraphQL mutation mercadopagoStart → Lambda → MP API /checkout/preferences
       ↓
  Retorna: { preferenceId, initPoint, sandboxInitPoint }
       ↓
  Frontend redirige a initPoint (prod) o sandboxInitPoint (localhost)
       ↓
  Usuario completa / cancela en plataforma MercadoPago

FASE 2 — RETORNO (Frontend + mercadopagoStatus)
──────────────────────────────────────────────────
  [Sin registro en DB]
  MP redirige → /return-mp?status=X&payment_id=Y&collection_status=Z
       ↓
  ReturnMP.tsx evalúa params:
       ↓
  Si status=approved Y payment_id:
    → En producción: dispatch(setMPStatus(paymentId))
      → GraphQL query mercadopagoStatus → Lambda → MP API GET /v1/payments/{id}
      → Si result.status="approved": sessionStorage ← email → /recibo-pago ✅
      → Si result.status≠"approved": → /rechazo-pago ❌
    → En localhost: confía en collection_status=approved → /recibo-pago ✅
  Si status≠approved: → /rechazo-pago ❌

  ⚠️ IMPORTANTE: En NINGÚN punto de estas 2 fases se crea registro en DB

FASE 3 — PERSISTENCIA (mercadopagoCommit — NO AUTOMATIZADO)
──────────────────────────────────────────────────────────────
  [AQUÍ se crea el registro — pero debe invocarse manualmente/externamente]

  Llamada externa a mutation mercadopagoCommit({ paymentId, payerEmail, ... })
       ↓
  Lambda verifica payment.status === "approved" en MP API
       ↓
  Si aprobado:
    client.models.PaymentTransaction.create({
      paymentTransactionId: "mp-{paymentId}",
      status: "CAPTURED",
      paymentMethod: "mercadopago",
      ...campos del pago
    })
    → [REGISTRO CREADO: status="CAPTURED"] ✅
  Si no aprobado:
    → throw Error (sin registro) ❌

FASE 4 — REEMBOLSO (mercadopagoRefund — cuando aplica)
───────────────────────────────────────────────────────
  Llamada a mutation mercadopagoRefund({ paymentId, amount? })
       ↓
  Lambda llama MP API POST /v1/payments/{id}/refunds
       ↓
  MP procesa reembolso → éxito
       ↓
  Lambda actualiza PaymentTransaction:
    - Reembolso total  → status = "REVERSED"
    - Reembolso parcial → status = "PARTIALLY_NULLIFIED"
  ⚠️ Si falla DB update: log silencioso, refund ya ejecutado en MP

ESTADOS EN DB:
  [Inexistente] → CAPTURED → REVERSED
                           → PARTIALLY_NULLIFIED
```

---

## 4. Gaps y Problemas Identificados

### 🔴 CRÍTICO — mercadopagoCommit no se invoca automáticamente

**Problema:** El resolver que crea el registro `PaymentTransaction` no es llamado por ningún componente del flujo web actual.

**Impacto:** La DB no tiene registro de los pagos aprobados. El backoffice muestra 0 transacciones MP aunque los pagos existan en MercadoPago.

**Solución requerida:** Implementar uno de:
- **Webhook de MP** → endpoint que reciba IPN y llame `mercadopagoCommit`
- **Lambda schedulado** → polling periódico de pagos recientes aprobados en MP

---

### 🔴 CRÍTICO — Sin estado "PENDING" al iniciar el pago

**Problema:** No hay registro cuando el usuario hace clic en "Pagar con MercadoPago". Si el usuario abandona o MP falla, no hay trazabilidad.

**Solución:** `mercadopagoStart` debería crear un registro con `status = "INITIALIZED"` o `"PENDING_MP"` antes de redirigir al checkout.

---

### 🟡 MEDIO — Inconsistencia en reembolsos

**Problema:** Si `mercadopagoRefund` falla al actualizar la DB, el dinero fue devuelto en MP pero el status en DB sigue `CAPTURED`.

**Solución:** Implementar retry o cola de eventos para actualizar el status.

---

### 🟡 MEDIO — `paymentMethod` no desplegado en backend activo

**Problema:** El campo `paymentMethod` y su índice `byPaymentMethod` están en el schema local del backoffice pero no en el backend desplegado. El backoffice no puede filtrar por método de pago.

**Workaround actual:** Filtrar por `status = "CAPTURED"` como proxy de transacciones MP.

**Solución:** Deploy del schema con el campo `paymentMethod`.

---

### 🟢 BAJO — Campos vacíos o inconsistentes

| Campo | Problema |
|---|---|
| `userPhone` | Siempre `""` — MP no lo proporciona |
| `paymentsProcessorCommission` | Siempre `0` — la comisión de MP no se calcula |
| `userName` | Usa `payerEmail` — semánticamente incorrecto |
| `vci`, `horaOn`, `horaOff` | Campos de Webpay sin equivalente en MP |

---

## 5. Recomendaciones Priorizadas

| Prioridad | Acción | Impacto |
|---|---|---|
| 🔴 P1 | Implementar webhook de MP o Lambda cron para llamar `mercadopagoCommit` automáticamente | Crítico — sin esto no hay registros en DB |
| 🔴 P2 | Crear registro `status="INITIALIZED"` en `mercadopagoStart` para trazabilidad completa | Alto — permite auditar pagos abandonados |
| 🟡 P3 | Deploy de `main.schema.ts` con campo `paymentMethod` e índice `byPaymentMethod` | Medio — desbloquea filtro en backoffice |
| 🟡 P4 | Implementar retry para actualización de status en `mercadopagoRefund` | Medio — previene inconsistencias en reembolsos |
| 🟢 P5 | Calcular `paymentsProcessorCommission` usando tarifa de MP (≈3.99% + fija) | Bajo — mejora precisión financiera |

---

## 6. Archivos Clave

| Archivo | Rol |
|---|---|
| `eve-backend-v2/amplify/resolvers/mercadopagoStart/handler.ts` | Crea preferencia en MP |
| `eve-backend-v2/amplify/resolvers/mercadopagoStatus/handler.ts` | Consulta estado pago en MP |
| `eve-backend-v2/amplify/resolvers/mercadopagoCommit/handler.ts` | **Crea registro en DB** (no automatizado) |
| `eve-backend-v2/amplify/resolvers/mercadopagoRefund/handler.ts` | Actualiza status a REVERSED/PARTIALLY_NULLIFIED |
| `energica_payments/src/stores/MercadoPago/services.ts` | Mutaciones GraphQL del frontend |
| `energica_payments/src/pages/public/ReturnMP/index.tsx` | Manejo de retorno desde MP |
| `eve_adminwebv3/amplify/backend/data/main.schema.ts` (líneas 721-800) | Modelo PaymentTransaction |
