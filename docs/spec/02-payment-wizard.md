# 02-payment-wizard.md — Payment Wizard Specification

## Overview

The Payment page (`src/pages/public/Payment/index.tsx`) is the primary entry point for EV charging payments. It implements a URL-driven entry logic that detects charger type, fetches charger data, and drives a numbered step state machine rendered entirely through a single `<ChangeStep>` switcher component.

---

## 1. Page Entry Logic

### Route

The page is mounted at `/` and `/:t` (both resolve to the same component `Main`).

### URL Parameter Resolution (runs once on mount via `useRef` guard)

```tsx
const hasProcessed = useRef(false);

useEffect(() => {
  if (!hasProcessed.current) {
    processUrlParams();
    hasProcessed.current = true;
  }
}, []);
```

The `hasProcessed` ref prevents double-execution in React StrictMode.

### Decision Tree

```
URL params present?
├── ?id= present
│   ├── id[0..5].toUpperCase() === "OCPPBE"  → STATION flow
│   ├── id[0..2].toUpperCase() === "EVE"     → EVE flow
│   └── neither                              → setStep(0) [CartNotExist]
├── ?pay= present                            → DIRECT / EMA flow
└── neither                                  → setStep(0) [CartNotExist]
```

---

## 2. Charger Type Detection Rules

### EVE type

- Condition: `idParam.substring(0, 3).toUpperCase() === "EVE"`
- Dispatches:
  ```ts
  dispatch(getEve({ eveId: idParam }));
  dispatch(setTypeOfCharger("EVE"));
  dispatch(setStep(1));
  ```
- `idParam` is used verbatim as `eveId`.

### STATION type (OCPP)

- Condition: `idParam.substring(0, 6).toUpperCase() === "OCPPBE"`
- Dispatches:
  ```ts
  const stationId = idParam.substring(6); // strips "OCPPBE" prefix
  dispatch(getCharger({ stationId }));
  dispatch(setTypeOfCharger("STATION"));
  dispatch(setStep(1));
  ```
- The prefix `"OCPPBE"` is stripped before calling the backend.

### DIRECT type (EMA / JWT)

- Condition: `?pay=<JWT>` present in URL (no `?id=`)
- No charger fetch is performed.
- JWT is stored in local `useState` as `jwt`.
- Dispatches:
  ```ts
  dispatch(setStep(3));
  setJwt(payParam);
  ```
- `typeOfCharger` remains `""` in Redux; the JWT carries all payment metadata.

### Unknown / missing params

- Condition: `?id=` present but prefix matches neither `"EVE"` nor `"OCPPBE"`, OR no params at all.
- Dispatches: `dispatch(setStep(0))` → renders `CartNotExist`.

---

## 3. Online/Offline Status Side-Effect

After fetching charger data a second `useEffect` watches `statusCharger` and `statusEve`:

```tsx
useEffect(() => {
  typeOfCharger === "STATION" && statusCharger !== "ONLINE" && dispatch(setStep(5));
  typeOfCharger === "EVE"     && statusEve    !== "ONLINE" && dispatch(setStep(5));
}, [statusCharger, statusEve]);
```

This overrides whatever step the URL logic set. Any non-ONLINE status forces step 5 (`EveOffline`).

### How "ONLINE" is computed

**Charger slice** (`src/stores/Charger/slice.ts`):
- If `updatedAt` is missing → `statusCharger = connectorStatus` (raw value from API)
- If `diffInMinutes > 10` → `statusCharger = "OFFLINE"`
- If `connectorStatus` is `"Preparing"` or `"Available"` → `statusCharger = "ONLINE"`
- Otherwise → `statusCharger = "OFFLINE"`

**Eve slice** (`src/stores/Eves/slice.ts`):
- If payload is empty/null → `statusEve = "OFFLINE"`
- If `updatedAt` missing → `statusEve = "OFFLINE"`
- If `diffInMinutes > 10` → `statusEve = "OFFLINE"`
- Otherwise → `statusEve = "ONLINE"`

---

## 4. Loading Gate

The `<ChangeStep>` component is only rendered when all three statuses are `"idle"`:

```tsx
{status === "idle" && eveStatus === "idle" && chargerStatus === "idle" &&
  <ChangeStep step={step} id={...} state={...} jwt={jwt} />
}
```

While any status is `"loading"`, `<Loading />` is shown instead:

```tsx
{status === "loading" || eveStatus === "loading" || chargerStatus === "loading" && <Loading />}
```

Note: the condition has a precedence bug — only `chargerStatus === "loading"` is inside the `&&`, not the full OR expression. In practice the `<Loading />` renders during any of the three loading states due to how React evaluates truthy JSX.

---

## 5. Step Machine — All Steps (0–7)

The `typeOfComponents` map in `Payment/index.tsx`:

| Step | Component | Label |
|------|-----------|-------|
| 0 | `CartNotExist` | Tu carrito está vacío |
| 1 | `StepChargingHours` | Configure su servicio |
| 2 | `StepChargingHours` | Confirme sus datos |
| 3 | `ResumePayment` | Realice el pago |
| 4 | `SearchIdEve` | Ingreso manual de cargador |
| 5 | `EveOffline` | Cargador offline |
| 6 | `StepEveInUse` | Cargador en uso |
| 7 | `StepChargingHours` | Ingreso de horas e email |

Steps 1, 2, and 7 all render the same `StepChargingHours` component. The component itself does not read or branch on `step`; all three are functionally identical renders.

### Step Wizard indicator (`StepsWizard`)

Maps logical steps to visual progress steps 1–3:

```ts
if ([0, 1, 4, 5, 6, 7].includes(step)) assignedStep = 1;
else if (step === 2)                    assignedStep = 2;
else if (step === 3)                    assignedStep = 3;
```

Visual labels: "Configure su servicio" → "Confirme sus datos" → "Realice el pago".

---

## 6. Step Component Details

### Step 0 — `CartNotExist`
**File:** `src/pages/public/Payment/components/CartNotExist.tsx`

**Purpose:** Shown when no valid `?id=` or `?pay=` param is present, or when the id prefix is unrecognised.

**Props:** none (no props forwarded from `ChangeStep`)

**UI:** Animated shopping-cart video (`animatedIcons/shopping-cart.mp4`), heading "Tu carrito está vacío", subtext "Explora nuestros servicios".

**User actions:**
- "Buscar cargador" button → `dispatch(setStep(4))`

**Redux effects:**
- `setStep(4)` — navigates to `SearchIdEve`

**Edge cases:** No charger data is available at this point. Redux `typeOfCharger` is `""`.

---

### Step 1 / 2 / 7 — `StepChargingHours`
**File:** `src/pages/public/Payment/components/StepChargingHours.tsx`

**Purpose:** Collects the charging duration (in hours) and the user's email address before calculating price and proceeding to payment.

**Props:**
```ts
interface Props {
  step?: number;
  id?: string | null;       // eveId or stationId
  status?: boolean;
  state?: string | null;    // "ONLINE" | "OFFLINE" | ""
}
```

**Redux selectors used:**
- `selectPaymentTransactions` → `typeOfCharger`, `duration`, `transaction.usersPaymentTransactionsId`
- `selectEve` → `eve`, `eveStatus`
- `selectCharger` → `charger`, `chargerStatus`

**UI:**
- `<StatusEVE id state />` — status pill at the top
- If `state !== "OFFLINE"`:
  - Animated `wait.mp4` video (hidden on mobile `hidden sm:block`)
  - Hour selector: minus/plus Tippy-wrapped anchors around a circular `duration` display
  - Email `<FormInput>` bound to `usersPaymentTransactionsId`
  - Two action buttons: "Buscar cargador" and "Continuar"

**User actions:**

| Action | Effect |
|--------|--------|
| Minus button click | `dispatch(setDuration(duration - 1))` minimum 1; triple-click within 2 s while at 1 → `setDuration(0.6)` (30-min mode) |
| Plus button click | `dispatch(setDuration(duration + 1))` |
| Email field change/blur/Enter | `dispatch(setEmail(value))` |
| "Buscar cargador" button | `dispatch(setStep(4))` |
| "Continuar" button | Validates, then calls `handleContinue()` |

**`handleContinue` sequence:**
1. `validateInputs()` — checks `id` non-empty, `duration > 0`, `usersPaymentTransactionsId` non-empty and valid email regex; alerts on failure.
2. `await dispatch(setCalculatePricing({ idEve, stationId, chargingHours: chargingMinutes(), typeOfCharger })).unwrap()` — sets `paymentTransactions.status = "loading"` during fetch.
3. `dispatch(setShoppingCart({ totalPrice, usersShoppingCartId, glosa, ... }))` — persists cart.
4. `dispatch(setStep(3))` — component unmounts immediately.

**`chargingMinutes()` helper:** `duration < 1 ? 6 : duration * 60` — the 0.6 "duration" value maps to 6 minutes.

**`buildGlosa()` helper:** `` `${parseInt(duration.toString())} hrs de carga electrica Estacionamiento ${id}` ``

**Redux effects summary:**
- `setDuration(n)` — updates `paymentTransactions.duration`
- `setEmail(s)` — updates `paymentTransactions.transaction.usersPaymentTransactionsId`
- `setCalculatePricing(input)` — async thunk; sets `paymentTransactions.status` loading/idle/failed; writes `paymentTransactions.pricing`
- `setShoppingCart(obj)` — writes `paymentTransactions.shoppingCart`
- `setStep(3)` — navigates to `ResumePayment`
- `setStep(4)` — navigates to `SearchIdEve`

**Error handling:** On `handleContinue` rejection, `setLoading(false)` is called; step does not advance. `validateInputs` uses `alert()` for inline validation errors.

---

### Step 3 — `ResumePayment`
**File:** `src/pages/public/Payment/components/ResumePayment.tsx`

**Purpose:** Displays the order summary and initiates both payment gateway flows (MercadoPago only — Webpay is commented out). Hosts the `<NavigationBar>` which provides the payment action buttons.

**Props:**
```ts
interface Props {
  step?: number;
  id?: string | null;
  status?: boolean;
  state?: string | null;
  jwt?: string | "";
}
```

**Redux selectors used:**
- `selectWP` → `transaction` (Webpay token/url)
- `selectPaymentTransactions` → `shoppingCart`, `duration`, `typeOfCharger`
- `selectEve` → `eve`
- `selectCharger` → `charger`
- `selectMP` → `preference`, `status` (via `NavigationBar`)

**Two independent mount effects, guarded by `initiated` ref:**

**Effect 1 — EVE/OCPP flow** (runs when `jwt` is falsy):
```ts
if (jwt) return;
if (initiated.current) return;
initiated.current = true;
if (!shoppingCart?.totalPrice || !shoppingCart?.usersShoppingCartId) return;

dispatch(resetMPPreference());
dispatch(setMPStart({ amount, userId, glosa, idEve, stationId, chargingHours, typeOfCharger: "EVE"|"OCPP" }));
// dispatch(setWPStart(...)); // commented out
```

**Effect 2 — EMA/JWT flow** (runs when `jwt` is truthy):
```ts
const claims = jose.decodeJwt(jwt);
dispatch(setShoppingCart({ totalPrice: claims.monto, usersShoppingCartId: claims.email, glosa: claims.glosa, ... }));
dispatch(resetMPPreference());
dispatch(setMPStart({ amount, userId, glosa, idEve: "", stationId: "", chargingHours: 0, typeOfCharger: "EMA" }));
// dispatch(setWPStart(...)); // commented out
```

JWT claims used: `monto`, `name`, `iat`, `email`, `glosa`.

**UI:**
- Order confirmation header with email display
- `<form action={transaction?.url} method="POST">` — Webpay legacy form (token hidden input, currently non-functional as WPStart is commented out)
- Scrollable order detail list showing `shoppingCart.glosa` and formatted price
- Total display
- `<NavigationBar />` anchored at `absolute bottom-1`

**Redux effects:**
- `resetMPPreference()` — clears previous MP preference
- `setMPStart(input)` — async thunk; sets `mercadoPago.status = "loading"` then `"idle"`; writes `mercadoPago.preference` (`initPoint`, `sandboxInitPoint`)
- `setShoppingCart(obj)` — only in JWT flow, overrides cart with JWT claims

**No step transitions** are dispatched by `ResumePayment` itself; navigation is delegated to `NavigationBar`.

---

### Step 4 — `SearchIdEve`
**File:** `src/pages/public/Payment/components/SearchIdEve.tsx`

**Purpose:** Manual charger ID entry. Applies the same charger-type detection logic as the URL param handler.

**Props:** none

**Redux selectors used:**
- `selectEve` → `eve`
- `selectCharger` → `charger`

**Local state:**
- `inputValue: string` — controlled input
- `isValid: boolean` — true when `inputValue.length >= 6`
- `errorMessage: string`

**UI:**
- Animated `find-charging-station.mp4` video
- `<FormInput>` for ID entry with minimum 6 character validation
- "Buscar" button (disabled while `!isValid`)
- Error message display

**User actions / validation:**

| Condition | Action |
|-----------|--------|
| `input[0..5] === "OCPPBE"` | `dispatch(getCharger({ stationId: input.substring(6) }))` + `setTypeOfCharger("STATION")` + `setStep(1)` + `navigate("/?id="+input)` |
| `input[0..2] === "EVE"` | `dispatch(getEve({ eveId: input }))` + `setTypeOfCharger("EVE")` + `setStep(1)` + `navigate("/?id="+input)` |
| neither prefix matched | `setErrorMessage("Cargador no reconocido...")` — no dispatch |
| `!isValid` | `setErrorMessage("Complete el campo correctamente")` |

**Navigation:** Uses `useNavigate` from `react-router-dom`. On success, navigates to `/?id=<inputValue>` which causes the URL to reflect the chosen charger. This does NOT re-trigger `processUrlParams` because `hasProcessed.current` is already `true`.

**Redux effects:**
- `getCharger({ stationId })` or `getEve({ eveId })` — sets charger/eve slice to loading, then idle
- `setTypeOfCharger("STATION"|"EVE")`
- `setStep(1)`

---

### Step 5 — `EveOffline`
**File:** `src/pages/public/Payment/components/EveOffline.tsx`

**Purpose:** Shown automatically when the charger status is not `"ONLINE"` after fetching.

**Props:**
```ts
interface Props {
  step?: number;
  id?: string | null;
  status?: boolean;
  state?: string | null;
}
```

**UI:**
- Static SVG icon (offline charger illustration)
- `<StatusEVE id status state />` — status pill
- Heading "El Cargador esta Offline"
- Subtext "Explora otros cargadores"
- "Buscar otro cargador" secondary button

**User actions:**
- "Buscar otro cargador" → `dispatch(setStep(4))`

**Redux effects:**
- `setStep(4)` — navigates to `SearchIdEve`

---

### Step 6 — `StepEveInUse`
**File:** `src/pages/public/Payment/components/StepEveInUse.tsx`

**Purpose:** Shown when the charger is in use. Currently not triggered automatically by any status logic (the status side-effect only dispatches step 5, not step 6). Step 6 would need to be dispatched by external logic if needed.

**Props:** none forwarded from `ChangeStep` (receives step/id/status/state but does not use them)

**UI:**
- Animated `charging-station.mp4` video
- Heading "Lo sentimos este cargador"
- Subtext "está en uso"
- "Buscar otro cargador" secondary button

**User actions:**
- "Buscar otro cargador" → `dispatch(setStep(4))`

**Redux effects:**
- `setStep(4)` — navigates to `SearchIdEve`

---

## 7. Layout and Shared Components

### `Layout`
**File:** `src/pages/public/Payment/components/Layout.tsx`

**Props:** `{ children: React.ReactNode, step: number }`

**Structure:**
```tsx
<div className="grid grid-cols-12 gap-y-10 gap-x-6 mt-4">
  <div className="col-span-12 sm:col-span-10 sm:col-start-2 max-w-3xl w-full mx-auto px-2 sm:px-0">
    <div className="flex justify-center items-center">
      <Logo />
    </div>
    <StepsWizard step={step} />
    {children}
  </div>
</div>
```

`step` is read from `useAppSelector(selectPaymentTransactions).step` in `Main` and passed down.

### `Logo`
**File:** `src/pages/public/Payment/components/Logo.tsx`

Renders the Energica SVG logo (150×69 px). No props, no Redux. Pure presentational.

### `Loading`
**File:** `src/pages/public/Payment/components/Loading.tsx`

Renders a centered 64×64 px `<LoadingIcon icon="oval" color="#4DBFD9" />`. No props, no Redux.

Used in two places:
1. `Main` — shown while any of the three async operations is loading.
2. `StepChargingHours` — shown while `eveStatus === "loading" && chargerStatus === "loading"`.

### `StepsWizard`
**File:** `src/pages/public/Payment/components/StepsWizard.tsx`

**Props:** `{ step: number }`

Three visual steps rendered as a horizontal row with connecting lines. Uses `clsx` and Tailwind group modifiers.

Visual step labels:
1. "Configure su servicio"
2. "Confirme sus datos"
3. "Realice el pago"

Step mapping (see Section 5 above). The current visible label is shown on mobile only for the active step; all labels are shown on `lg:` screens.

### `StatusEVE` (named `StatusEVESTATION`)
**File:** `src/pages/public/Payment/components/StatusEVESTATION.tsx`

**Props:**
```ts
interface StatusEVEProps {
  id: string;
  state: string;   // "ONLINE" | anything else
  status: boolean;
}
```

Renders a pill row showing:
- `StatusON` SVG (green gradient) when `state === "ONLINE"`; `StatusOFF` SVG (grey) otherwise
- Text: "DISPONIBLE" / "NO DISPONIBLE"
- The charger ID on the right

Used by: `StepChargingHours` and `EveOffline`.

### `NavigationBar`
**File:** `src/pages/public/Payment/components/NavigationBar.tsx`

**Purpose:** Action bar at the bottom of step 3 (`ResumePayment`). Contains the MercadoPago payment button. Webpay button is commented out.

**Redux selectors:**
- `selectWP` → `transaction`, `status`
- `selectMP` → `preference`, `status` (as `mpStatus`)

**MercadoPago button logic:**
```ts
const handleMercadoPago = () => {
  if (!preference.initPoint) return;
  const isProd = window.location.hostname !== "localhost";
  window.location.href = isProd ? preference.initPoint : preference.sandboxInitPoint;
};
```

Button is disabled while `mpStatus === "loading"` or `!preference.initPoint`. Shows `<LoadingIcon>` spinner while loading, "Pagar con MercadoPago" text otherwise. Uses inline `backgroundColor: "#00b1ea"` (MercadoPago brand blue).

Webpay button (commented out): would render a Webpay SVG logo and a "Pagar con Webpay" `<Button>` disabled until `transaction.token` is truthy, submitting the hidden form in `ResumePayment`.

---

## 8. Redux Store Slices Used

### `paymentTransactions` slice
**File:** `src/stores/PaymentTransactions/slice.ts`

| Field | Type | Purpose |
|-------|------|---------|
| `status` | `"idle"\|"loading"\|"failed"` | Tracks `setCalculatePricing` async state |
| `step` | `number` | Current wizard step (0–7) |
| `typeOfCharger` | `"EVE"\|"STATION"\|""` | Charger type set on URL parse |
| `duration` | `number` | Hours selected (0.6 = 30 min) |
| `transaction.usersPaymentTransactionsId` | `string` | Email address |
| `shoppingCart` | `ShoppingCart` | Calculated cart with total, glosa, userId |
| `pricing` | `number` | Raw pricing result from `setCalculatePricing` |

**Actions:** `setStep`, `setDuration`, `setEmail`, `setTypeOfCharger`, `setShoppingCart`

**Async thunks:** `setCalculatePricing(wpInput)`, `getPaymentTransactions(FilterOptions)`

**Initial `step`:** `1` (not 0 — URL logic overrides this on mount)

### `charger` slice
**File:** `src/stores/Charger/slice.ts`

| Field | Type | Purpose |
|-------|------|---------|
| `status` | `"idle"\|"loading"\|"failed"` | Fetch state |
| `statusCharger` | `string` | Computed: `"ONLINE"\|"OFFLINE"` |
| `stateCharger` | `""` | Raw state field from API |
| `charger` | `Charger` | Full charger record; `charger.stationId` is the ID used downstream |
| `minutesSinceLastCheck` | `number` | Staleness indicator; >10 → OFFLINE |

**Async thunk:** `getCharger({ stationId: string })`

### `eves` (Eve) slice
**File:** `src/stores/Eves/slice.ts`

| Field | Type | Purpose |
|-------|------|---------|
| `status` | `"idle"\|"loading"\|"failed"` | Fetch state |
| `statusEve` | `string` | Computed: `"ONLINE"\|"OFFLINE"` |
| `stateEve` | `""` | Raw state field from API |
| `eve` | `Eve` | Full EVE record; `eve.eveId` is the ID used downstream |
| `minutesSinceLastCheck` | `number` | Staleness indicator; >10 → OFFLINE |

**Async thunk:** `getEve({ eveId: string })`

### `mercadoPago` slice
**File:** `src/stores/MercadoPago/slice.ts`

| Field | Type | Purpose |
|-------|------|---------|
| `status` | `"idle"\|"loading"\|"failed"` | Async state for both `setMPStart` and `setMPStatus` |
| `preference.initPoint` | `string` | Production MP checkout URL |
| `preference.sandboxInitPoint` | `string` | Sandbox MP checkout URL |
| `statusData` | `MercadoPagoStatusData` | Payment status after return |
| `errorMessage` | `string` | Error text |

**Actions:** `resetMPPreference`

**Async thunks:** `setMPStart(MercadoPagoInput)`, `setMPStatus(MercadoPagoStatusInput)`

### `WP` slice (Webpay — currently inactive)
**File:** `src/stores/WP/` (referenced but `setWPStart` calls are commented out in `ResumePayment`)

The `selectWP` selector is still used by `NavigationBar` to read `transaction.token` and `transaction.url` for the legacy Webpay form, but `setWPStart` is no longer dispatched.

---

## 9. `id` Prop Forwarding

In `Main`, the `id` prop passed to `<ChangeStep>` is resolved as:

```tsx
id={typeOfCharger === "EVE" ? eve?.eveId : charger.stationId}
```

`state` is resolved as:

```tsx
state={typeOfCharger === "EVE" ? statusEve : statusCharger}
```

When `typeOfCharger` is `""` (DIRECT/EMA flow), both resolve to `charger.stationId` (empty initial value) and `statusCharger` (empty string). These values are passed but not used by `ResumePayment` in the JWT flow.

---

## 10. Edge Cases

### Unknown charger ID (neither EVE nor OCPPBE prefix)
- In URL param handler: `dispatch(setStep(0))` → shows `CartNotExist`
- In `SearchIdEve`: `setErrorMessage("Cargador no reconocido...")` — no Redux dispatch, stays on step 4

### Missing params (no `?id=` and no `?pay=`)
- `dispatch(setStep(0))` → shows `CartNotExist`

### Empty payload from charger API
- Eve slice: empty payload → `statusEve = "OFFLINE"` → triggers `setStep(5)` via status watcher
- Charger slice: no explicit empty-payload guard; falls through to `statusCharger = connectorStatus` (which would be undefined, treated as non-ONLINE)

### Network failure (thunk rejected)
- Charger/Eve: `status = "failed"`, `error` string set. No automatic step transition is dispatched on rejection — the status watcher only triggers on `statusCharger`/`statusEve` changes, which do not update on rejection. The Loading gate (`status === "idle"`) would never clear and the UI would be stuck showing `<Loading />`. This is a known gap.
- `setCalculatePricing` rejection: `status = "failed"`, `setLoading(false)` in `StepChargingHours`, user stays on step 1/2/7.

### Stale charger data (>10 minutes since last heartbeat)
- Both slices compute `minutesSinceLastCheck` from `updatedAt`. If > 10 minutes → `"OFFLINE"` → step 5.

### Double-mount (React StrictMode)
- `hasProcessed.current` ref prevents `processUrlParams()` running twice.
- `initiated.current` ref in `ResumePayment` prevents `setMPStart` being dispatched twice.

### JWT decode failure
- `ResumePayment` catches with `try/catch`, logs to `console.log`. No step transition; shopping cart is not populated; MercadoPago is not initiated. UI shows empty order summary.

### duration = 0 (initial state)
- `validateInputs()` in `StepChargingHours` blocks `handleContinue` with alert if `duration <= 0`.
- `chargingMinutes()` returns `6` when `duration < 1` (0.6 special case maps to 30-minute session).

### MercadoPago not yet loaded
- `NavigationBar` button is disabled while `mpStatus === "loading"` or `!preference.initPoint`.
- On localhost, `sandboxInitPoint` is used; on any other hostname, `initPoint` is used.

---

## 11. File Locations Summary

| File | Path |
|------|------|
| Main page | `src/pages/public/Payment/index.tsx` |
| Layout | `src/pages/public/Payment/components/Layout.tsx` |
| Logo | `src/pages/public/Payment/components/Logo.tsx` |
| Loading | `src/pages/public/Payment/components/Loading.tsx` |
| StepsWizard | `src/pages/public/Payment/components/StepsWizard.tsx` |
| NavigationBar | `src/pages/public/Payment/components/NavigationBar.tsx` |
| StatusEVESTATION | `src/pages/public/Payment/components/StatusEVESTATION.tsx` |
| CartNotExist | `src/pages/public/Payment/components/CartNotExist.tsx` |
| StepChargingHours | `src/pages/public/Payment/components/StepChargingHours.tsx` |
| ResumePayment | `src/pages/public/Payment/components/ResumePayment.tsx` |
| SearchIdEve | `src/pages/public/Payment/components/SearchIdEve.tsx` |
| EveOffline | `src/pages/public/Payment/components/EveOffline.tsx` |
| StepEveInUse | `src/pages/public/Payment/components/StepEveInUse.tsx` |
| PaymentTransactions slice | `src/stores/PaymentTransactions/slice.ts` |
| Charger slice | `src/stores/Charger/slice.ts` |
| Eve slice | `src/stores/Eves/slice.ts` |
| MercadoPago slice | `src/stores/MercadoPago/slice.ts` |
