# 03-transbank-webpay-flow.md — Transbank Webpay Plus Integration Spec

## 1. Overview

This document specifies the complete Transbank Webpay Plus integration for the `energica_payments` SPA. The integration is client-driven: all Webpay API calls go through the AWS AppSync GraphQL layer (via Amplify `generateClient()`). There is no server-side session — the browser initiates payment, redirects to Transbank, and receives the callback at `/return`.

---

## 2. Route Map

| Route | Component | Purpose |
|---|---|---|
| `/` or `/:t` | `Payment/index.tsx` | Payment wizard — user selects charger, duration, enters email |
| `/return` | `Return/index.tsx` | Transbank callback handler (all 4 flows) |
| `/recibo-pago` | `Recibo-pago/index.tsx` | Success receipt page |
| `/rechazo-pago` | `Rechazo-pago/index.tsx` | Rejection page |
| `/return-mp` | `ReturnMP/index.tsx` | MercadoPago callback (separate flow, out of scope here) |

Path constants live in `src/router/paths.tsx`:
```typescript
export const PUBLIC_RETURN = "/return";
export const PUBLIC_INVOICE = "/recibo-pago";
export const PUBLIC_FAILED = "/rechazo-pago";
```

---

## 3. Payment Initiation — `webpayStart`

### 3.1 When it runs

Inside `Return/components/FormStep01.tsx`, a `useEffect` on mount dispatches `setWPStart`. The form's `action` and the hidden `token_ws` input are bound to Redux `WP.transaction`.

```typescript
// FormStep01.tsx (abbreviated)
dispatch(setWPStart({
  amount: total,
  userId: email,
  glosa: `Productos Energica | ${shoppingCart?.id}`,
}))
```

The rendered form submits via standard HTML POST to Transbank's URL:
```tsx
<form action={transaction?.url || ""} method="POST">
  <input type="hidden" name="token_ws" value={transaction?.token || ""} />
</form>
```

### 3.2 GraphQL mutation — `webpayStart`

Located inline in `src/stores/WP/services.ts`:

```graphql
mutation WebpayStart(
  $idEve: String
  $stationId: String
  $userId: String
  $amount: Int!
  $glosa: String!
  $chargingHours: Float
  $type: WebpayStartType!
) {
  webpayStart(
    idEve: $idEve
    stationId: $stationId
    userId: $userId
    amount: $amount
    glosa: $glosa
    chargingHours: $chargingHours
    type: $type
  ) {
    order
    token
    url
  }
}
```

**Variables mapping (from `wpInput`):**

| Variable | Source |
|---|---|
| `idEve` | `objFilter.idEve` |
| `stationId` | `objFilter.stationId` |
| `userId` | `objFilter.userId` — user's email address |
| `amount` | `objFilter.amount` — integer cents/pesos |
| `glosa` | `objFilter.glosa` — display description |
| `chargingHours` | `objFilter.chargingHours` — float, minutes |
| `type` | `objFilter.typeOfCharger` — enum `WebpayStartType` (`"EVE"` | `"STATION"`) |

**Response shape (`Transaction` type):**

```typescript
type Transaction = {
  order: string   // Transbank order number
  token: string   // Webpay token posted to Transbank URL
  url: string     // Transbank form POST URL
}
```

After dispatch, Redux stores the result in `WP.transaction`.

---

## 4. Transbank Callback — `/return` Flows

When the user completes or abandons the Transbank form, Transbank redirects to `https://<app>/return` with URL parameters that identify the flow.

### 4.1 URL Parameter Detection Matrix

| Flow | `token_ws` | `TBK_TOKEN` | `TBK_ORDEN_COMPRA` | `TBK_ID_SESION` | Result |
|---|---|---|---|---|---|
| 1 — Approved | present | absent | absent | absent | `PAYMENT_APPROVED` |
| 2 — Timeout (>10 min) | absent | absent | present | present | `PAYMENT_REJECTED` |
| 3 — User cancelled | absent | present | (any) | (any) | `PAYMENT_REJECTED` |
| 4 — Invalid / atypical | present | present | (any) | (any) | `PAYMENT_REJECTED` |

Detection code from `Return/index.tsx` (`handleValidation` → `validation`):

```typescript
const token = query.get("token_ws") || "";
const tbkToken = query.get("TBK_TOKEN") || "";
const tbkOrdenCompra = query.get("TBK_ORDEN_COMPRA") || "";
const tbkIdSesion = query.get("TBK_ID_SESION") || "";

// Flow 1
if (token && !tbkToken) { ... }
// Flow 2
else if (!token && !tbkToken && tbkIdSesion && tbkOrdenCompra) { ... }
// Flow 3
else if (!token && tbkToken) { ... }
// Flow 4
else if (token && tbkToken) { ... }
```

### 4.2 Flow 1 — Approved Transaction

**Trigger:** `token_ws` present, `TBK_TOKEN` absent.

**Operations (sequential, awaited):**

1. Set local state `step: 1`, `statusRedirect: "PAYMENT_APPROVED"`.
2. `dispatch(setWPCommit({ token }))` — calls `webpayCommit` mutation.
3. `dispatch(setWPStatus({ token }))` — calls `webpayStatus` mutation.

**Token used for both calls:** `token_ws` query param.

**Loading message sequence:**
- "⌛ Validando respuesta de transbank"
- "🎉 Transbank nos indica que la operación fue realizada"

### 4.3 Flow 2 — Timeout

**Trigger:** `token_ws` absent, `TBK_TOKEN` absent, both `TBK_ORDEN_COMPRA` and `TBK_ID_SESION` present.

**Operations:**

1. Set local state `step: 3`, `statusRedirect: "PAYMENT_REJECTED"`.
2. `dispatch(setWPStatus({ token: tbkIdSesion }))` — uses `TBK_ID_SESION` as the token argument.

**Note:** The `throw new Error` guard after `setWPStatus` in Flow 2 checks `!statusData || !statusData.status`. However, because `statusData` is read from Redux state synchronously before the dispatch resolves, this check will always see the previous (empty) `statusData` — this is a known race condition bug. The guard throws unconditionally but is caught by the outer `try/catch`, which sets `apiError: true`. Flow continues to a `PAYMENT_REJECTED` redirect regardless.

**Loading message:** "⚠️ Transbank nos indica que la transacción fue anulada"

### 4.4 Flow 3 — User Cancelled

**Trigger:** `token_ws` absent, `TBK_TOKEN` present.

**Operations:**

1. Set local state `step: 4`, `statusRedirect: "PAYMENT_REJECTED"`.
2. `dispatch(setWPStatus({ token: tbkToken }))` — uses `TBK_TOKEN` as the token argument.

**Loading message:** "⚠️ Transbank nos indica que la operación fue anulada"

### 4.5 Flow 4 — Invalid / Atypical

**Trigger:** Both `token_ws` and `TBK_TOKEN` present.

**Operations:**

1. Set local state `step: 5` (no `statusRedirect` set — this is a gap; redirect logic won't fire unless manually triggered).
2. `dispatch(setWPStatus({ token }))` — uses `token_ws`.

**Loading message:** "⚠️ Transbank nos indica que falló la transacción"

**Note:** Flow 4 does not set `statusRedirect`, so the redirect `useEffect` will not navigate. This is a known gap — the user will see the loading spinner indefinitely unless the retry timeout triggers `handleValidation` again.

---

## 5. GraphQL Mutations — `webpayCommit` and `webpayStatus`

Both mutations are defined inline in `src/stores/WP/services.ts` using `generateClient()` from `aws-amplify/api`.

### 5.1 `webpayCommit`

```graphql
mutation wpCommit($token: String!) {
  webpayCommit(token: $token) {
    message
    status
  }
}
```

**Input:** `{ token: string }` — the `token_ws` value from the callback URL.

**Response type (`CommitData`):**
```typescript
type CommitData = {
  message: string  // Human-readable message from backend
  status: string   // e.g. "AUTHORIZED" | "FAILED"
}
```

**Redux action:** `setWPCommit` (thunk). On fulfillment, stores result in `WP.commitData`.

**Significance of `commitData.status === "AUTHORIZED"`:** This is the gate for fetching payment transaction details (`getPaymentTransactions`) and sending email. Any other value means the transaction was not captured by Transbank.

### 5.2 `webpayStatus`

```graphql
mutation webpayStatus($token: String!) {
  webpayStatus(token: $token) {
    paymentTransactionId
    payment_type_code
    buy_order
    amount
    glosa
    card_number
    usersPaymentTransactionsId
    status
    eveId
    stationId
  }
}
```

**Input:** `{ token: string }` — varies by flow:
- Flow 1: `token_ws`
- Flow 2: `TBK_ID_SESION`
- Flow 3: `TBK_TOKEN`
- Flow 4: `token_ws`

**Response type (`StatusData`):**
```typescript
type StatusData = {
  paymentTransactionId: string
  payment_type_code: string          // e.g. "VD" (debit), "VN" (credit)
  buy_order: string
  amount: string
  glosa: string
  card_number: string
  usersPaymentTransactionsId: string // user's email address
  status: string                     // e.g. "AUTHORIZED"
  eveId: string
  stationId: string
}
```

**Redux action:** `setWPStatus` (thunk). On fulfillment, stores result in `WP.statusData`.

**Important:** `webpayStatus` is implemented as a GraphQL **mutation** (not a query) even though it reads state. This is intentional — the backend performs side effects (recording status, updating charge event records) when called.

---

## 6. Redux WP Slice

**File:** `src/stores/WP/slice.ts`
**Store key:** `WP`
**Selector:** `selectWP`

### 6.1 Full State Shape

```typescript
interface WPState {
  status: "idle" | "loading" | "failed";
  transaction: Transaction;       // webpayStart result
  statusTransaction: string;      // unused in Return page
  commitData: CommitData;         // webpayCommit result
  statusData: StatusData;         // webpayStatus result
  errorMessage: string;
}
```

**Initial state:**
```typescript
{
  status: "idle",
  transaction: { order: "", token: "", url: "" },
  statusTransaction: "",
  commitData: { message: "", status: "" },
  statusData: {
    paymentTransactionId: "",
    payment_type_code: "",
    buy_order: "",
    amount: "",
    glosa: "",
    card_number: "",
    usersPaymentTransactionsId: "",
    status: "",
    eveId: "",
    stationId: "",
  },
  errorMessage: "",
}
```

### 6.2 Async Thunks

| Thunk | Action type prefix | Service called | Stores result in |
|---|---|---|---|
| `setWPStart` | `WP/create` | `wpStart()` | `state.transaction` |
| `setWPCommit` | `WP/commit` | `wpCommit()` | `state.commitData` |
| `setWPStatus` | `WP/status` | `wpStatus()` | `state.statusData` |

All three follow the same pattern:
- **pending:** `state.status = "loading"`
- **fulfilled:** `state.status = "idle"`, write payload to respective field
- **rejected:** `state.status = "failed"`, `state.errorMessage = objPayload.errorMessage`

### 6.3 Synchronous Reducers

None. The WP slice has no synchronous reducers — all state changes come through async thunks.

---

## 7. PaymentTransactions Slice — `getPaymentTransactions`

**File:** `src/stores/PaymentTransactions/slice.ts`
**Store key:** `paymentTransactions`
**Selector:** `selectPaymentTransactions`

### 7.1 When it runs in the Return flow

A `useEffect` in `Return/index.tsx` watches `resTransaction` (local state) and fires `getTransaction()` when:
```typescript
commitData?.status === "AUTHORIZED" && resTransaction.token_ws
```

`getTransaction()` dispatches `getPaymentTransactions({ token: resTransaction.token_ws })`.

### 7.2 GraphQL Query

```graphql
query ListPaymentTransactionByToken($token: ID!) {
  listPaymentTransactionByToken(token: $token) {
    items {
      paymentTransactionId
      status
      amount
      horaOn
      horaOff
      chargingHours
      date
      buy_order
      card_number
      transaction_date
      accounting_date
      installments_number
      installments_amount
      payment_type_code
      card_detail
      session_id
      authorization_code
      response_code
      vci
      glosa
      transactionType
      usersPaymentTransactionsId
      eveId
      stationId
    }
    nextToken
  }
}
```

Returns first item of `items` array: `response.data?.listPaymentTransactionByToken?.items?.[0]`.

### 7.3 PaymentTransactions Type

```typescript
type PaymentTransactions = {
  id: string
  usersPaymentTransactionsId: string  // user email
  amount: number
  buy_order: string
  card_number: string
  transaction_date: string
  accounting_date: string
  installments_number: string
  payment_type_code: string
  session_id: string
  card_detail: string
  installments_amount: string
  authorization_code: string
  response_code: string
  vci: string
  day: string
  month: string
  year: string
  hour: string
  glosa: string
  chargingHours: string
  horaOn: string
  horaOff: string
}
```

---

## 8. Email Sending via EmailJS

### 8.1 Credentials (hardcoded in source)

```typescript
const SERVICE  = "service_56ebg58";
const TEMPLATE = "template_o36lzyb";
init("lUerPXXiKXnrvLlVw");   // EmailJS public key
```

### 8.2 Trigger Conditions

A `useEffect` in `Return/index.tsx` watches `transaction` (from `paymentTransactions` slice):

```typescript
useEffect(() => {
  if (!emailAttempted &&
      transaction?.usersPaymentTransactionsId &&
      transaction?.usersPaymentTransactionsId !== "" &&
      commitData?.status === "AUTHORIZED") {
    sendEmail();
    setEmailAttempted(true);
  }
}, [transaction]);
```

All three conditions must be true:
1. `emailAttempted === false` — prevents duplicate sends
2. `transaction.usersPaymentTransactionsId` is non-empty — user's email is available
3. `commitData.status === "AUTHORIZED"` — payment was captured

### 8.3 Template Variables

The object passed to `emailjs.send()`:

| Template var | Source | Notes |
|---|---|---|
| `glosa` | `transaction.glosa` | Payment description |
| `total` | `formatCurrency(transaction.amount)` | Formatted amount string |
| `order` | `transaction.buy_order` | Transbank order number |
| `card` | `transaction.card_number` | Masked card number |
| `typePay` | `transaction.payment_type_code` | Payment type code |
| `to_email` | `transaction.usersPaymentTransactionsId` | Recipient email |
| `html_content` | Conditional HTML string | Charging session details (see §8.4) |

### 8.4 `html_content` Conditional Rendering

`html_content` is a non-empty HTML table string only when `transaction.chargingHours` passes the `hasValidChargingHours` check:
- Not `undefined`, not `null`, not `""`, not `0` (numeric), not `"0"`, not `"   "` (whitespace string).

When valid, the table contains three rows:
- **Duración:** `formatChargingHours(transaction.chargingHours)` — converts minutes to hours (e.g., `"1.50 hrs"`)
- **Inicio:** `formatTime(transaction.horaOn)` — formats to `HH:MM` (24h, es-CL locale)
- **Término:** `formatTime(transaction.horaOff)` — formats to `HH:MM`

When invalid (no charging hours), `html_content` is `""`.

### 8.5 Email Send State Machine

| State var | Initial | After attempt | After success | After error |
|---|---|---|---|---|
| `emailAttempted` | `false` | `true` | unchanged | `false` (reset to allow retry) |
| `emailWasSent` | `false` | unchanged | `true` | unchanged |

`emailWasSent === true` is the gate for the redirect `useEffect` (see §9).

---

## 9. Redirect Logic

### 9.1 The Redirect `useEffect`

```typescript
useEffect(() => {
  if (resTransaction?.statusRedirect === "PAYMENT_APPROVED" && !emailWasSent) {
    return;  // Wait for email to be sent before redirecting
  }

  const timeoutId = window.setTimeout(() => {
    setIsProcessing(false);

    const paymentData = { email: transaction?.usersPaymentTransactionsId ?? "" };
    sessionStorage.setItem("paymentData", JSON.stringify(paymentData));

    if (resTransaction?.statusRedirect === "PAYMENT_APPROVED") {
      navigate("/recibo-pago", { replace: true });
      return;
    }
    if (resTransaction?.statusRedirect === "PAYMENT_REJECTED") {
      navigate("/rechazo-pago", { replace: true });
      return;
    }
  }, 3000);

  return () => window.clearTimeout(timeoutId);
}, [emailWasSent, resTransaction.statusRedirect, navigate]);
```

### 9.2 Redirect Decision Tree

```
resTransaction.statusRedirect set?
  ├─ "PAYMENT_APPROVED"
  │     └─ emailWasSent === true?
  │           ├─ YES → wait 3s → write sessionStorage → navigate("/recibo-pago", replace)
  │           └─ NO  → do nothing (wait for email effect)
  └─ "PAYMENT_REJECTED"
        └─ immediately eligible → wait 3s → write sessionStorage → navigate("/rechazo-pago", replace)
  └─ "" (not set, e.g., Flow 4)
        └─ useEffect body runs but neither branch matches → setTimeout fires, no navigation
```

### 9.3 `sessionStorage` Payload

Key: `"paymentData"`. Written immediately before navigation.

```json
{ "email": "<usersPaymentTransactionsId>" }
```

The `Recibo-pago/index.tsx` page reads this on mount:
```typescript
const storedData = sessionStorage.getItem('paymentData');
if (storedData) {
  const data = JSON.parse(storedData);
  setPaymentData({ email: data.email || "", hasData: true });
}
```

If `sessionStorage` is empty (e.g., direct navigation to `/recibo-pago`), `hasData: false` and the page shows a "no data found" illustration instead of the success UI.

---

## 10. Retry Logic

A second `useEffect` in `Return/index.tsx` watches `resTransaction.step`:

```typescript
useEffect(() => {
  if (resTransaction.step === 1 || resTransaction.step === 0) {
    return;  // No retry for approved (1) or unstarted (0)
  }
  setLoadingMessage("🤓 Reintentando la validación con transbank");
  const retryTimeoutId = window.setTimeout(() => {
    handleValidation();
  }, 20000);  // 20-second retry delay
  return () => window.clearTimeout(retryTimeoutId);
}, [resTransaction.step, handleValidation]);
```

Steps that trigger retry: `3` (timeout), `4` (user cancelled), `5` (invalid). This means rejected flows will re-call `handleValidation` once after 20 seconds. There is no retry limit — a second failure will set the same `step` value, which does not trigger the `useEffect` again (same dependency value), so effectively one retry occurs.

---

## 11. Component Tree — Return Page

```
Return/index.tsx (Main)
└── Layout (Return/components/Layout.tsx)
    ├── Logo (Return/components/Logo.tsx)
    └── <div box>
        ├── [isProcessing === true]
        │   ├── LoadingIcon (oval, color #4DBFD9)
        │   └── <p>{loadingMessage}</p>
        └── [isProcessing === false]
            └── Button "Hacer otra carga" → navigate("/")
```

**Sub-components present in directory but not rendered in `Main` (commented out):**
- `SvgSuccess` — green checkmark SVG
- `SvgFailed` — red X SVG
- `FormStep01` — not used in the Return callback page (used in Payment wizard)
- `HeaderTitle`, `NavigationBar`, `SentEmail` — utility components

The `SvgSuccess` and `SvgFailed` components exist in the Return component directory but their JSX usage in `Main` is commented out. The current UI only shows `LoadingIcon` + `loadingMessage` while processing, and a "Hacer otra carga" button when done.

---

## 12. `isProcessing` State and Loading Messages

`isProcessing` starts as `true` and is only set to `false` inside the redirect `setTimeout` callback (3 seconds after conditions are met). This means the loading spinner is shown throughout the entire validation, email, and pre-redirect period.

**Full sequence of `loadingMessage` values during Flow 1:**

1. `"Iniciando ..."` — set by `handleValidation` before calling `validation`
2. `"Verificando su transacción"` — set at start of `validation`
3. `"⌛ Validando respuesta de transbank"` — set before flow detection
4. `"🎉 Transbank nos indica que la operación fue realizada"` — set before `webpayCommit`
5. `"🚀 Generando el comprobante de pago"` — set in `getTransaction()` when `commitData.status === "AUTHORIZED"`
6. `"✉️ Comprobante enviado a <email>"` — set on successful `emailjs.send`

---

## 13. `isFirstRender` Guard

`Return/index.tsx` uses a `useRef` to prevent double-invocation on React Strict Mode double-mount:

```typescript
const isFirstRender = useRef(true);

useEffect(() => {
  if (!isFirstRender.current) return;
  isFirstRender.current = false;
  handleValidation();
}, [handleValidation]);
```

This ensures `handleValidation` is called exactly once on mount regardless of React Strict Mode behavior.

---

## 14. Edge Cases and Known Bugs

### 14.1 Double Callback (browser back + forward)

`handleValidation` is guarded by `isFirstRender.current`. A page reload would re-run validation. If `webpayCommit` has already been called for a given `token_ws`, the backend may return an error (Transbank does not allow committing the same token twice). The error is caught in the outer `try/catch` in `validation`, which sets `apiError: true` and `statusRedirect: "PAYMENT_REJECTED"`, causing a redirect to `/rechazo-pago`. This is conservative but correct behavior.

### 14.2 Missing Token (no URL params)

If the user navigates to `/return` with no query params, `token`, `tbkToken`, `tbkOrdenCompra`, and `tbkIdSesion` are all empty strings. None of the four flow conditions match (Flow 2 requires `tbkIdSesion && tbkOrdenCompra` — both empty strings are falsy). `validation()` returns `false`. No Redux thunks are dispatched. `resTransaction.statusRedirect` remains `""`. The redirect `useEffect` fires its `setTimeout` but neither navigation branch matches. The user is stuck on the loading page. The retry `useEffect` also fires (step is `0` — initial), but step `0` is explicitly excluded from retry. **Net result:** the page shows an infinite spinner with the last `loadingMessage`. **Recommendation:** add a fallback branch for "no params at all" that sets `statusRedirect: "PAYMENT_REJECTED"`.

### 14.3 Network Timeout / GraphQL Error

Both `wpCommit` and `wpStatus` wrap calls in try/catch and re-throw. The thunk's rejected case sets `WP.status = "failed"`. However, the `Return/index.tsx` `validation` function only relies on an outer `try/catch` which catches any thrown error and sets:
```typescript
{ apiError: true, msg: "Error en la validación del pago", status: "ERROR", statusRedirect: "PAYMENT_REJECTED" }
```
This correctly redirects to `/rechazo-pago` on network failure.

### 14.4 Already Committed Token

Transbank returns a 4xx/5xx for a token that has already been committed. This surfaces as a GraphQL error thrown from `wpCommit`. The outer catch in `validation` handles it — the user is redirected to `/rechazo-pago`. The backend should ideally return idempotent results for double-commits; the frontend treats any error as rejection.

### 14.5 `commitData` Stale State Bug (Flow 1)

In `validation`, immediately after `dispatch(setWPCommit({token}))`:
```typescript
if (!commitData) {
  throw new Error('Error en getWPCommit');
}
```
`commitData` is read from the closure over Redux state **at the time `validation` was called** — it has not yet updated with the dispatch result. Because `emptyCommitData` is `{ message: "", status: "" }` (a non-null object), `!commitData` is always `false` and this guard never fires. The code continues regardless of the commit result. The actual commit data is read later via the `useEffect([resTransaction])` which checks `commitData?.status === "AUTHORIZED"` — at that point Redux has updated.

### 14.6 Email Retry on Error

If `emailjs.send()` throws, `emailAttempted` is reset to `false`, which allows a retry. However, since `emailAttempted` is local React state and the effect dependency is `[transaction]`, the effect only re-runs if `transaction` changes. If `transaction` does not change, the email will not be retried automatically. **Net result:** one attempt per `transaction` update.

### 14.7 Flow 4 Missing `statusRedirect`

As noted in §4.5, Flow 4 sets `step: 5` but never sets `statusRedirect`. The redirect `useEffect` will run its `setTimeout` callback but neither the `PAYMENT_APPROVED` nor `PAYMENT_REJECTED` branch will match. The `setIsProcessing(false)` call still executes, revealing the "Hacer otra carga" button. This is effectively a dead-end state — the user can manually navigate home but the page does not auto-redirect.

### 14.8 Transbank 4xx Responses

Transbank 4xx responses propagate as GraphQL resolver errors (the AppSync resolver calls the Transbank HTTP API and must forward the error). These surface as thrown exceptions in the service functions (`wpCommit`, `wpStatus`), are caught by the thunk, and cause a `rejected` action. The Redux `errorMessage` field is set, but `Return/index.tsx` does not read `WP.errorMessage`. The outer `try/catch` in `validation` catches the propagated rejection and triggers the `PAYMENT_REJECTED` redirect path.

---

## 15. Complete `useEffect` Execution Order (Flow 1 — Happy Path)

1. **Mount:** `isFirstRender` guard runs `handleValidation()`.
2. `validation()` dispatches `setWPCommit` then `setWPStatus` sequentially.
3. Redux updates `WP.commitData` and `WP.statusData`.
4. Local `resTransaction` state updated with `statusRedirect: "PAYMENT_APPROVED"`.
5. **Effect `[resTransaction]`** fires → `commitData.status === "AUTHORIZED"` → `getTransaction()` dispatched.
6. Redux updates `paymentTransactions.transaction`.
7. **Effect `[transaction]`** fires → conditions met → `sendEmail()` called → `emailAttempted = true`.
8. `emailjs.send()` succeeds → `emailWasSent = true`.
9. **Effect `[emailWasSent, resTransaction.statusRedirect]`** fires:
   - `statusRedirect === "PAYMENT_APPROVED"` and `emailWasSent === true` → no early return.
   - `setTimeout(3000)` → `setIsProcessing(false)` → `sessionStorage.setItem("paymentData", ...)` → `navigate("/recibo-pago", { replace: true })`.

---

## 16. `Recibo-pago` — Success Page Data Flow

`Recibo-pago/index.tsx` reads `sessionStorage.getItem("paymentData")` on mount. Expected shape:
```json
{ "email": "user@example.com" }
```

Displays:
- `SvgSuccess` component (green checkmark, "Pago Realizado" heading)
- `"Comprobante enviado al email <email>"` (only when `email` non-empty)
- "Hacer otra carga" button → `navigate("/")`

If `sessionStorage` key is absent (`hasData: false`): shows a "No se encontraron datos de la transacción" illustration with no action button.

---

## 17. Key Files Reference

| File | Purpose |
|---|---|
| `src/pages/public/Return/index.tsx` | Main callback handler — all logic |
| `src/stores/WP/slice.ts` | WP Redux slice — thunks, reducers |
| `src/stores/WP/services.ts` | GraphQL calls: `wpStart`, `wpCommit`, `wpStatus` |
| `src/stores/WP/types.ts` | `Transaction`, `CommitData`, `StatusData`, `emptyXxx` |
| `src/stores/PaymentTransactions/slice.ts` | `getPaymentTransactions` thunk, PT state |
| `src/stores/PaymentTransactions/services.ts` | `fetchPaymentTransactionByToken` GraphQL query |
| `src/stores/PaymentTransactions/types.ts` | `PaymentTransactions`, `ShoppingCart` types |
| `src/pages/public/Recibo-pago/index.tsx` | Success receipt page |
| `src/pages/public/Rechazo-pago/index.tsx` | Rejection page |
| `src/router/paths.tsx` | Route constants |
| `src/stores/store.ts` | Redux store — `WP` and `paymentTransactions` slices registered |
