# 01-router-pages.md — Router & Pages Replication Specification

## 1. Source File Locations

| File | Path |
|---|---|
| Router entry | `src/router/index.tsx` |
| Route path constants | `src/router/paths.tsx` |
| Public route definitions | `src/router/PublicRoute.tsx` |
| FullscreenComponent | `src/router/FullscreenComponent.tsx` |

---

## 2. Route Path Constants (`src/router/paths.tsx`)

Every exported constant is a plain string literal used as the `path` value in the React Router `useRoutes` config.

| Constant | Value | Notes |
|---|---|---|
| `PUBLIC` | `"/"` | Root / home |
| `PUBLIC_TOKEN` | `":t"` | Dynamic segment — path param `t` (not a query param) |
| `PUBLIC_RETURN` | `"/return"` | Transbank Webpay return callback |
| `PUBLIC_RETURN_TOKEN` | `"/return:TBK_TOKEN"` | Alternate Transbank return path (token in path, not query) |
| `PUBLIC_INVOICE` | `"/recibo-pago"` | Approved payment receipt |
| `PUBLIC_FAILED` | `"/rechazo-pago"` | Rejected payment page |
| `PUBLIC_RETURN_MP` | `"/return-mp"` | MercadoPago return callback |

All commented-out constants (`PUBLIC_LOGOUT`, `PUBLIC_REGISTER`, etc.) reference an authentication subsystem that has been removed and must NOT be implemented.

---

## 3. Router Entry Point (`src/router/index.tsx`)

Built with `react-router-dom`'s `useRoutes` hook. Returns a single `<Router />` component mounted at the application root.

### Route table (final merged array passed to `useRoutes`)

| Priority | Path | Component | Source |
|---|---|---|---|
| 1 | (spread of publicRoutes — see §4) | multiple | `publicRoutes` object |
| 2 | `"500"` | `<ErrorDataPage />` | top-level sibling |
| 3 | `"*"` | `<ErrorPage />` | catch-all wildcard |

The `"500"` route is a **top-level sibling** of the public route subtree — it is NOT nested under `"/"`. The wildcard `"*"` is also a top-level sibling and catches every unmatched path.

---

## 4. Public Route Definitions (`src/router/PublicRoute.tsx`)

The exported object `publicRoutes` is a single React Router route config object with `path: "/"` and a `children` array. It contains no `element` at the parent level (no shared layout wrapper) and no `<Outlet />` is rendered by the parent — individual page components render their own layout.

### Lazy loading

Only `Payment` is lazy-loaded:

```ts
const Payment = lazy(() => import("../pages/public/Payment"));
```

All other page components (`Return`, `ReciboPago`, `RechazoPago`, `ReturnMP`) are imported statically (eager).

### Children route table

| `path` value | Constant | Component | Lazy? |
|---|---|---|---|
| `"/"` | `PUBLIC` | `<Payment />` | Yes |
| `":t"` | `PUBLIC_TOKEN` | `<Payment />` | Yes |
| `"/return"` | `PUBLIC_RETURN` | `<Return />` | No |
| `"/return:TBK_TOKEN"` | `PUBLIC_RETURN_TOKEN` | `<Return />` | No |
| `"/recibo-pago"` | `PUBLIC_INVOICE` | `<ReciboPago />` | No |
| `"/rechazo-pago"` | `PUBLIC_FAILED` | `<RechazoPago />` | No |
| `"/return-mp"` | `PUBLIC_RETURN_MP` | `<ReturnMP />` | No |

**Important:** The `publicRoutes` object does NOT export a `PublicRoute` wrapper component. The name "PublicRoute" refers only to the file and the exported route config. There is no authentication guard, no redirect, no `<Outlet />` wrapper — it is a plain nested route config with no shared parent element. The `useEffect` import present in the file is unused.

---

## 5. FullscreenComponent (`src/router/FullscreenComponent.tsx`)

A utility wrapper component that requests the browser's Fullscreen API on the **first user click** after mount.

### Behavior

- On mount: attaches a one-shot `click` event listener to `document`.
- On first click: calls `document.documentElement.requestFullscreen()` (with vendor-prefixed fallbacks for Firefox `mozRequestFullScreen`, Chrome/Safari/Opera `webkitRequestFullscreen`, IE/Edge `msRequestFullscreen`).
- After the first click: the listener removes itself. Subsequent clicks do not trigger fullscreen again.
- On unmount: the listener is removed via the `useEffect` cleanup function.
- Renders `{children}` directly inside a React fragment — no wrapping DOM node.

### Current usage

`FullscreenComponent` exists in the router directory but is **not wired into any route** in the current `index.tsx` or `PublicRoute.tsx`. It is available for use but not currently applied.

---

## 6. Page Inventory

### 6.1 Payment (`src/pages/public/Payment/index.tsx`)

**Routes:** `"/"` and `"/:t"` (path param `t` is unused in the component — the component reads query params instead)

**Responsibility:** Payment wizard entry point. Reads URL parameters, determines charger type, dispatches Redux actions to fetch charger/EVE data, and renders the appropriate wizard step component.

**URL parameters consumed:**

| Param | Source | Type | Effect |
|---|---|---|---|
| `?id=` | `location.search` via `URLSearchParams` | query string | Determines charger type and triggers device fetch |
| `?pay=` | `location.search` via `URLSearchParams` | query string (JWT) | EMA/direct payment flow; skips device lookup |

**`?id=` detection logic (exact):**

1. Take first 6 characters uppercased: if `=== "OCPPBE"` → type `"STATION"`, strip prefix, dispatch `getCharger({stationId: idParam.substring(6)})`, dispatch `setTypeOfCharger("STATION")`.
2. Else take first 3 characters uppercased: if `=== "EVE"` → type `"EVE"`, dispatch `getEve({eveId: idParam})`, dispatch `setTypeOfCharger("EVE")`.
3. Else → dispatch `setStep(0)`.

**`?pay=` detection logic:**

- Dispatch `setStep(3)` and store the JWT value in local state (`jwt`). The JWT is decoded later by `ResumePayment` using `jose.decodeJwt`.

**No `?id=` and no `?pay=`:** dispatch `setStep(0)`.

**Wizard step→component map (exact `typeOfComponents` object):**

| Step | Component | Description |
|---|---|---|
| `0` | `CartNotExist` | Verifying EVE / no device found |
| `1` | `StepChargingHours` | Configure service (hours + email input) |
| `2` | `StepChargingHours` | Confirm data (same component) |
| `3` | `ResumePayment` | Order review + payment initiation |
| `4` | `SearchIdEve` | Manual EVE ID entry |
| `5` | `EveOffline` | Error: device offline |
| `6` | `StepEveInUse` | Error: device in use |
| `7` | `StepChargingHours` | Charging hours entry (alternate path) |

**Charger status side-effect:** A `useEffect` watches `statusCharger` and `statusEve`. If `typeOfCharger === "STATION"` and `statusCharger !== "ONLINE"`, dispatches `setStep(5)`. Same for `typeOfCharger === "EVE"` and `statusEve !== "ONLINE"`.

**Render guards:** Shows `<Loading />` when any of `status`, `eveStatus`, or `chargerStatus` equals `"loading"`. Renders `<ChangeStep />` only when all three are `"idle"`.

---

### 6.2 Return (`src/pages/public/Return/index.tsx`)

**Routes:** `"/return"` and `"/return:TBK_TOKEN"` (both render the same component)

**Responsibility:** Transbank Webpay Plus return callback handler. Reads URL params, classifies the flow, dispatches commit/status Redux actions, sends confirmation email via EmailJS, then navigates to receipt or rejection page.

**URL parameters consumed:**

| Param | Source |
|---|---|
| `token_ws` | `location.search` via `URLSearchParams` |
| `TBK_TOKEN` | `location.search` via `URLSearchParams` |
| `TBK_ORDEN_COMPRA` | `location.search` via `URLSearchParams` |
| `TBK_ID_SESION` | `location.search` via `URLSearchParams` |

**Flow classification (exact logic):**

| Flow | Condition | Step set | Actions |
|---|---|---|---|
| 1 — Approved | `token_ws` present AND `TBK_TOKEN` absent | `step: 1`, `statusRedirect: "PAYMENT_APPROVED"` | Dispatch `setWPCommit({token})`, then `setWPStatus({token})` |
| 2 — Timeout | `token_ws` absent AND `TBK_TOKEN` absent AND `TBK_ID_SESION` present AND `TBK_ORDEN_COMPRA` present | `step: 3`, `statusRedirect: "PAYMENT_REJECTED"` | Dispatch `setWPStatus({token: tbkIdSesion})` |
| 3 — User cancelled | `token_ws` absent AND `TBK_TOKEN` present | `step: 4`, `statusRedirect: "PAYMENT_REJECTED"` | Dispatch `setWPStatus({token: tbkToken})` |
| 4 — Invalid | `token_ws` present AND `TBK_TOKEN` present | `step: 5` (no `statusRedirect` set) | Dispatch `setWPStatus({token})` |

**Post-flow actions (on `PAYMENT_APPROVED` only):**
- After commit is `"AUTHORIZED"`: dispatches `getPaymentTransactions({token})`.
- Sends email via EmailJS (service `service_56ebg58`, template `template_o36lzyb`, user key `lUerPXXiKXnrvLlVw`) with transaction data.
- Email guard: tracked by `emailAttempted` and `emailWasSent` state booleans to prevent duplicate sends.

**Navigation:**
- Approved + email sent: after 3 s → writes `{email}` to `sessionStorage.paymentData` → `navigate("/recibo-pago", { replace: true })`.
- Rejected: after 3 s → `navigate("/rechazo-pago", { replace: true })`.
- "Hacer otra carga" button: `navigate("/")`.

**Retry logic:** If `resTransaction.step` is not `0` or `1`, sets a 20-second timeout then calls `handleValidation` again (one retry).

**Loading state:** `isProcessing` starts `true`. Shows a spinner (`LoadingIcon icon="oval" color="#4DBFD9"`) with a dynamic `loadingMessage` string. Set to `false` just before navigation.

---

### 6.3 ReturnMP (`src/pages/public/ReturnMP/index.tsx`)

**Route:** `"/return-mp"`

**Responsibility:** MercadoPago return callback handler. Reads URL params, dispatches `setMPStatus` to the MercadoPago Redux slice, then navigates to receipt or rejection page.

**URL parameters consumed (via `useSearchParams`):**

| Param | Description |
|---|---|
| `status` | MP payment status string (`"approved"`, `"failure"`, `"cancelled"`, `"rejected"`, `"pending"`) |
| `payment_id` | MP payment ID (may be `"null"` string on failures) |
| `collection_id` | Alternate payment ID field |
| `collection_status` | Alternate status field |
| `preference_id` | MP preference ID (always present) |
| `external_reference` | Internal reference ID |

**Payment ID resolution (exact):** Use `payment_id` if truthy and not `"null"`, else use `collection_id` if truthy and not `"null"`, else empty string.

**Flow classification:**

| Flow | Condition | Dispatch | Navigation |
|---|---|---|---|
| No status | `status === ""` | none | Immediately `navigate("/rechazo-pago", { replace: true })` |
| Approved | `(status === "approved" OR collection_status === "approved") AND hasPaymentId` | `setMPStatus({paymentId, preferenceId, externalReference, mpStatus: "approved"})` → await `.unwrap()` → if result `.status === "approved"` or `"CAPTURED"`: write `sessionStorage.paymentData = {email: result.payerEmail}` → after 2 s → `navigate("/recibo-pago")`. Else after 1.5 s → `navigate("/rechazo-pago")`. Catch: after 1.5 s → `navigate("/rechazo-pago")`. | |
| Failure / cancelled / rejected | `status === "failure"` or `"cancelled"` or `"rejected"` | Fire-and-forget `setMPStatus({preferenceId, externalReference, mpStatus: status})` (if preferenceId or externalReference present) | After 1.5 s → `navigate("/rechazo-pago", { replace: true })` |
| Pending | `status === "pending"` | Fire-and-forget `setMPStatus({preferenceId, externalReference, mpStatus: "pending"})` | After 3 s → `navigate("/rechazo-pago", { replace: true })` |
| Unknown | (none of the above) | none | Immediately `navigate("/rechazo-pago", { replace: true })` |

**Loading state:** `isProcessing` starts `true`. Spinner color `#009EE3` (MercadoPago blue). "Hacer otra carga" button shown when `isProcessing === false`.

---

### 6.4 ReciboPago (`src/pages/public/Recibo-pago/index.tsx`)

**Route:** `"/recibo-pago"`

**Responsibility:** Approved payment receipt page. Reads email from `sessionStorage.paymentData` written by `Return` or `ReturnMP`. Displays success SVG and confirmation message.

**sessionStorage key:** `"paymentData"` — parsed as JSON, reads `.email` field.

**Conditional render:**
- If `paymentData.hasData === true`: shows `<SvgSuccess />`, email confirmation text, and "Hacer otra carga" button → `navigate("/")`.
- If `paymentData.hasData === false`: shows an inline SVG illustration and "No se encontraron datos de la transacción" text (no button).

**No URL parameters consumed.**

---

### 6.5 RechazoPago (`src/pages/public/Rechazo-pago/index.tsx`)

**Route:** `"/rechazo-pago"`

**Responsibility:** Payment rejection/failure page. Displays failure SVG and "Hacer otra carga" button.

**No URL parameters consumed.** No sessionStorage reads.

**Navigation:** "Hacer otra carga" button → `navigate("/")`.

---

### 6.6 ErrorPage (`src/pages/public/ErrorPage/index.tsx`)

**Route:** `"*"` (wildcard catch-all, top-level)

**Responsibility:** 404 not-found page.

**Display:** Full-screen centered layout on `bg-primary` background. Large `"404"` heading. Spanish copy: "Oops. Esta página desaparecio" / "Es posible que escribio mal la dirección o que la página fue movida." "Volver al Inicio" `<Link to="/">` using `<Button rounded variant="primary">`.

**No URL parameters consumed.**

---

### 6.7 ErrorDataPage (`src/pages/public/ErrorDataPage/index.tsx`)

**Route:** `"500"` (top-level, relative — resolves as `/500`)

**Responsibility:** Server/data error page.

**Display:** Same full-screen layout as ErrorPage. Large `"500"` heading with `px-14` padding. Spanish copy: "Tenemos un problema con nuestros servidores" / "Intente más tarde". "Volver al Inicio" `<Link to="/">` using `<Button rounded variant="primary">`.

**No URL parameters consumed.**

---

## 7. URL Parameter Reference (Complete)

| Page | Param | Method | Description |
|---|---|---|---|
| Payment | `?id=` | `URLSearchParams(location.search).get('id')` | Charger/EVE identifier. Prefix determines device type. |
| Payment | `?pay=` | `URLSearchParams(location.search).get('pay')` | JWT for EMA/direct payment flow |
| Return | `?token_ws=` | `URLSearchParams(location.search).get('token_ws')` | Webpay commit token |
| Return | `?TBK_TOKEN=` | `URLSearchParams(location.search).get('TBK_TOKEN')` | Webpay abort token |
| Return | `?TBK_ORDEN_COMPRA=` | `URLSearchParams(location.search).get('TBK_ORDEN_COMPRA')` | Webpay order number (timeout flow) |
| Return | `?TBK_ID_SESION=` | `URLSearchParams(location.search).get('TBK_ID_SESION')` | Webpay session ID (timeout flow) |
| ReturnMP | `?status=` | `useSearchParams()` | MP status string |
| ReturnMP | `?payment_id=` | `useSearchParams()` | MP payment ID |
| ReturnMP | `?collection_id=` | `useSearchParams()` | MP alternate payment ID |
| ReturnMP | `?collection_status=` | `useSearchParams()` | MP alternate status |
| ReturnMP | `?preference_id=` | `useSearchParams()` | MP preference ID |
| ReturnMP | `?external_reference=` | `useSearchParams()` | Internal reference ID |

---

## 8. Navigation Flow Diagram

```
User scans QR / opens URL
        │
        ▼
┌───────────────────────────────────────────────┐
│                 / or /:t                       │
│            Payment (wizard)                   │
│                                               │
│  ?id=EVE*   → step 1  (StepChargingHours)    │
│  ?id=OCPPBE*→ step 1  (StepChargingHours)    │
│  ?pay=<JWT> → step 3  (ResumePayment)         │
│  (none)     → step 0  (CartNotExist)          │
│                                               │
│  step 1/2 → [Continue] → step 3              │
│  step 3   → [form POST to Transbank URL]      │
│           → [MP redirect URL]                 │
│  step 4   → SearchIdEve → back to step 1     │
│  step 5   → EveOffline (terminal)            │
│  step 6   → StepEveInUse (terminal)          │
└───────────────────────────────────────────────┘
        │                        │
    Transbank                MercadoPago
    redirects                redirects
        │                        │
        ▼                        ▼
┌──────────────┐        ┌────────────────┐
│   /return    │        │   /return-mp   │
│  (Return)    │        │  (ReturnMP)    │
│              │        │                │
│ Flow 1: OK   │        │ approved →     │
│ Flow 2: TO   │        │   /recibo-pago │
│ Flow 3: ABT  │        │ failure/cancel │
│ Flow 4: INV  │        │ rejected/pend  │
│              │        │   /rechazo-pago│
└──────────────┘        └────────────────┘
        │ PAYMENT_APPROVED           │
        ▼                            │
┌────────────────┐                   │
│  /recibo-pago  │ ◄─────────────────┘
│  (ReciboPago)  │
│  SvgSuccess    │
│  email confirm │
└────────────────┘
        │ [Hacer otra carga]
        ▼
       /

        │ PAYMENT_REJECTED
        ▼
┌────────────────┐
│ /rechazo-pago  │ ◄─── (all rejection paths from Return and ReturnMP)
│ (RechazoPago)  │
│  SvgFailed     │
└────────────────┘
        │ [Hacer otra carga]
        ▼
       /

       /* → /500 (ErrorPage / ErrorDataPage)
```

---

## 9. sessionStorage Contract

`Return` and `ReturnMP` write to `sessionStorage` before navigating to `/recibo-pago`. `ReciboPago` reads from it on mount.

| Key | Written by | Shape | Read by |
|---|---|---|---|
| `"paymentData"` | `Return` (approved flow) | `JSON.stringify({ email: transaction?.usersPaymentTransactionsId ?? "" })` | `ReciboPago` |
| `"paymentData"` | `ReturnMP` (approved flow) | `JSON.stringify({ email: result.payerEmail ?? "" })` | `ReciboPago` |

`ReciboPago` does NOT call `sessionStorage.removeItem` after reading (the removal is commented out).

---

## 10. Implementation Notes for Replication

1. `publicRoutes` has no parent `element` — do not add a layout wrapper at the `path: "/"` level.
2. Only `Payment` uses `React.lazy`. All others are eagerly imported. A `<Suspense>` boundary must exist above the router for the lazy `Payment` to work.
3. The `"/return:TBK_TOKEN"` path is a literal string with the colon inside it, meaning it matches paths like `/returnABC123` (the `:TBK_TOKEN` is a React Router dynamic segment named `TBK_TOKEN`). The `Return` component ignores this path param and reads all values from `location.search` query params instead.
4. `FullscreenComponent` is defined but not currently used in any route. Do not insert it into routes unless explicitly required.
5. The `"500"` route path is a relative string (no leading slash). When nested inside the top-level `useRoutes` array it resolves to `/500`.
6. Both `ErrorPage` and `ErrorDataPage` are eagerly imported in `src/router/index.tsx`.
7. The `Outlet` import in `PublicRoute.tsx` is imported but not used — no outlet is rendered.
