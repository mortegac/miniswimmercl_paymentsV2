# 08-utils-edge-cases.md — Utilities and Edge-Case Catalog

## 1. Utilities Reference

### 1.1 Logger (`src/utils/log.ts`)

**Pattern:** Singleton — the class constructor is private; the single instance is obtained via `Logger.getInstance()`. Calling `getInstance()` again always returns the same object.

**Enum:**

```ts
export enum LogLevel {
  NONE  = 0,
  ERROR = 1,
  WARN  = 2,
  INFO  = 3,   // default
}
```

**Level semantics:**
- `NONE (0)` — all output suppressed.
- `ERROR (1)` — only `logger.error(...)` outputs.
- `WARN (2)` — `logger.error(...)` and `logger.warn(...)` output.
- `INFO (3)` — all three (`error`, `warn`, `info`) output.

**Method signatures:**

```ts
logger.error(...args: any[]): void   // prefix "[ERROR]", calls console.error
logger.warn(...args: any[]): void    // prefix "[WARN]",  calls console.warn
logger.info(...args: any[]): void    // prefix "[INFO]",  calls console.info
logger.log(...args: any[]): void     // no level gate — always calls console.log
logger.setLevel(level: LogLevel): void
logger.getLevel(): LogLevel
logger.getLevelName(): string        // returns e.g. "INFO"
```

**Argument stringification:** every argument is run through `JSON.stringify`; circular references fall back to `String(arg)`. The prefix string is prepended as the first element before spread.

**Initialisation sequence at module load:**
1. `Logger.getInstance()` is created.
2. `getEnvVar('LOG_LEVEL', '3')` is called — checks `process.env.VITE_LOG_LEVEL` (Node) then `import.meta.env.VITE_LOG_LEVEL` (Vite).
3. `parseInt` is applied; if `NaN` or out of `[0,3]`, defaults to `LogLevel.INFO`.
4. `logger.setLevel(logLevel)` is called.

**Critical rule:** Never use `console.log` in production code. Use `logger.log()`, `logger.info()`, `logger.warn()`, or `logger.error()` exclusively. The `logger.log()` method is the only one with no level gate — it always produces output regardless of `VITE_LOG_LEVEL`.

---

### 1.2 Error Utility (`src/utils/error.ts`)

Single exported function:

```ts
export const throwError = (...args: any[]): never => {
  logger.error(args);
  throw new Error(JSON.stringify(args));
};
```

**Behaviour:** logs via the singleton logger at ERROR level, then throws a native `Error` whose `message` is `JSON.stringify(args)`. Return type is `never` — callers can use it in exhaustive type-narrowing.

**Usage:** call when a code path that should be unreachable is reached, or when a fatal precondition is violated. Do not catch the resulting error at the call site; let it propagate to an error boundary.

---

### 1.3 `useCallbackState` (`src/utils/callback-state.ts`)

A generic React hook that extends `useState` with a post-update callback (similar to the class-component `setState(newState, callback)` pattern).

```ts
const useCallbackState = <T>(value: T) => {
  const [state, setState] = useState<T>(value);
  const callback = useRef<(value: T) => void>();

  const updateState = (newVal: T, cb?: (value: T) => void) => {
    setState(newVal);
    callback.current = cb;
  };

  useEffect(() => {
    if (callback.current) {
      callback.current(state);
    }
  }, [state]);

  return [state, updateState] as [T, typeof updateState];
};
```

**How it works:**
- `updateState(newVal, cb?)` sets new state and stores the optional callback in a ref.
- The `useEffect` fires after the state update is committed to the DOM; it then calls `callback.current(state)` with the new value.
- The callback ref persists between renders; a subsequent call to `updateState` without a callback leaves the previous ref value intact until the next state change.

**Key detail:** the callback fires on every state change that follows a `updateState` call, not just the first. If `updateState` is called without a callback, `callback.current` is `undefined` and the effect is a no-op.

---

### 1.4 Money Handler (`src/utils/moneyHandler.ts`)

```ts
export const formatCurrency = (number: number): string
```

**Algorithm (CLP — Chilean Peso, no decimals):**
1. If `number` is falsy (0, null, undefined, NaN), return `""`.
2. Strip all non-digit characters: `number.toString().replace(/\D/g, "")`.
3. Calculate `rest = formattedNumber.length % 3`.
4. Take the first `rest` digits as the leading segment.
5. Group remaining digits into triples with `.` as thousands separator.
6. Concatenate: if `rest > 0`, join with `.`; if `rest === 0`, no leading separator.

**Examples:**
- `formatCurrency(1000)` → `"1.000"`
- `formatCurrency(1000000)` → `"1.000.000"`
- `formatCurrency(500)` → `"500"`
- `formatCurrency(0)` → `""`

**Note:** `helper.ts` also exports a `formatCurrency` function with the same algorithm but using `,` as the separator (US-style). The canonical CLP formatter for payment receipts is in `moneyHandler.ts`, which uses `.`.

---

### 1.5 Date Handler (`src/utils/dateHandler.ts`)

#### `FormatDate({ date, options? }): string`

```ts
type FormatDateType = {
  date: string;
  options?: Intl.DateTimeFormatOptions;
};
const optDefault: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };

export const FormatDate = ({ date, options = optDefault }: FormatDateType): string
```

**Behaviour:**
- Merges caller `options` with `optDefault` (caller wins).
- Appends `"Z"` to `date` if the last character is not `"Z"`, ensuring UTC interpretation.
- Formats with `Intl.DateTimeFormat("es-es", opt)`.
- Returns `""` on any exception.

**Example:** `FormatDate({ date: "2024-06-15T12:00:00" })` → `"15 de junio"` (locale-dependent).

#### `HoursAndMinutes(date: string): string`

Currently contains a bug: it calls `padTo2Digits(d.toUTCString())` instead of extracting hours/minutes from the Date object. Also contains `console.log` calls (violates production code rules). **Do not use in new code.** Its output is not reliable.

#### `dateConverter(fechaString: string): Date`

Converts `"dd/mm/yyyy"` string to a `Date` object using `new Date("yyyy-mm-dd")`.

#### `calculateAge(birthday: string): { years: number; month: number }`

Accepts `"dd/mm/yyyy"`, computes age in full years and remaining months. Returns `{ years: 0, month: 0 }` on parse error.

---

### 1.6 Helper (`src/utils/helper.ts`)

All exports:

| Function | Signature | Purpose |
|---|---|---|
| `cutText` | `(text: string, length: number) => string` | Truncates multi-word text to `length` chars, removing the last partial word, appending `"..."`. Single-word strings are returned as-is without truncation. |
| `formatDate` | `(date: string, format: string) => string` | Wraps `dayjs(date).format(format)`. |
| `capitalizeFirstLetter` | `(string: string) => string` | Uppercases first character. Returns `""` for falsy input. |
| `onlyNumber` | `(string: string) => string` | Strips non-digit characters. Returns `""` for falsy input. |
| `formatCurrency` | `(number: number) => string` | Comma-separated thousands (US style). **Not for CLP display — use `moneyHandler.formatCurrency` instead.** |
| `timeAgo` | `(time: string) => string` | Returns human-readable relative time ("just now", "1 minute ago", etc.). Falls back to `dayjs(time).format("MMMM DD, YYYY")` for dates > 30 days ago or invalid. |
| `diffTimeByNow` | `(time: string) => { days, hours, minutes, seconds }` | Returns zero-padded string values for each unit of difference from now to `time`. Rounds minutes up if seconds < 30. |
| `isset` | `(obj: object \| string) => number \| false` | Returns `Object.keys(obj).length` for objects/arrays, `obj.toString().length` for strings, `false` for null/undefined. |
| `toRaw` | `(obj: object) => object` | Deep clone via `JSON.parse(JSON.stringify(obj))`. Loses non-serializable values. |
| `randomNumbers` | `(from: number, to: number, length: number) => number[]` | Array of `length` random integers between `to` and `from`, first element always `0`. |
| `toRGB` | `(value: string) => string` | Converts Tailwind colour string to space-separated RGB via `parseColor` from `tailwindcss/lib/util/color`. |
| `stringToHTML` | `(arg: string) => HTMLElement` | Parses an HTML string with `DOMParser` and returns the first child node. |
| `slideUp` | `(el: HTMLElement, duration?: number, callback?) => void` | CSS height-collapse animation. Default 300 ms. Cleans up inline styles after `duration`. |
| `slideDown` | `(el: HTMLElement, duration?: number, callback?) => void` | CSS height-expand animation. Mirrors `slideUp`. |

---

### 1.7 Parser (`src/utils/parser.ts`)

```ts
export function transformResponse(response: string): any | null
```

**Algorithm:**
1. Remove all backslash characters: `response.replace(/\\/g, '')`.
2. `JSON.parse` the cleaned string.
3. Return the parsed value, or `null` on parse failure (logs to `console.error` — this should be `logger.error` in production).

**Use case:** normalising double-escaped JSON strings that come back from Lambda resolvers via AppSync.

---

## 2. Edge-Case Catalog

### Edge Case 1 — Missing `?id=` and `?pay=` URL params on Payment page

**File:** `src/pages/public/Payment/index.tsx` — `processUrlParams()`

**Code path:**
```ts
const idParam = searchParams.get('id');    // null
const payParam = searchParams.get('pay');  // null

if (idParam) { ... }
else if (payParam) { ... }
else {
  dispatch(setStep(0));  // → CartNotExist component
}
```

**Outcome:** Redux `step` is set to `0`. The `ChangeStep` component renders `CartNotExist`. No API calls are made.

**User sees:** the "cart does not exist" UI (`<CartNotExist />`).

**Design decision:** this is the correct fallback — no crash, no redirect, just an informative dead-end screen.

---

### Edge Case 2 — Unknown charger ID (doesn't start with `EVE` or `OCPPBE`)

**File:** `src/pages/public/Payment/index.tsx` — `processUrlParams()`

```ts
const firstThreeChars = idParam.substring(0, 3).toUpperCase();
const firstFiveChars  = idParam.substring(0, 6).toUpperCase();

if (firstFiveChars === "OCPPBE") { ... }
else if (firstThreeChars === "EVE") { ... }
else {
  dispatch(setStep(0));   // → CartNotExist
}
```

Note: `setStep(1)` is dispatched unconditionally before the prefix check. If the else-branch fires, `step` ends at `0` (overwriting the earlier `setStep(1)` call).

**Outcome:** same as Edge Case 1 — `CartNotExist` is shown.

**Gotcha:** the prefix check is case-insensitive via `.toUpperCase()`. IDs like `eve1234` or `ocppbeFoo` are handled correctly.

---

### Edge Case 3 — EVE device offline

**File:** `src/stores/Eves/slice.ts` — `getEve.fulfilled`

**Offline conditions (any one triggers `statusEve = "OFFLINE"`):**
1. `action.payload` is falsy or empty object → `statusEve = "OFFLINE"`.
2. `payload.updatedAt` is absent → `statusEve = "OFFLINE"`.
3. `diffInMinutes > 10` (last heartbeat more than 10 minutes ago) → `statusEve = "OFFLINE"`.

**Consumer:** `Payment/index.tsx`

```ts
useEffect(() => {
  typeOfCharger === "EVE" && statusEve !== "ONLINE" && dispatch(setStep(5));
}, [statusCharger, statusEve]);
```

`step = 5` renders `<EveOffline />`.

**Important:** the condition is `!== "ONLINE"`, not `=== "OFFLINE"`. An empty string `statusEve = ""` (initial state) also triggers `setStep(5)` if `typeOfCharger` is already `"EVE"`. This creates a brief flash to step 5 before the API response arrives if the effect fires early. The `status === "loading"` guard in the JSX suppresses rendering during loading, but the step value is already committed to Redux.

---

### Edge Case 4 — EVE device in use / Charger station not available

**File:** `src/stores/Charger/slice.ts` — `getCharger.fulfilled`

```ts
if (diffInMinutes > 10) {
  state.statusCharger = "OFFLINE";
} else {
  state.statusCharger =
    payload.connectorStatus === "Preparing" || payload.connectorStatus === "Available"
      ? "ONLINE"
      : "OFFLINE";
}
```

Any `connectorStatus` other than `"Preparing"` or `"Available"` (e.g., `"Charging"`, `"Faulted"`, `"Reserved"`, `"Unavailable"`, `"SuspendedEVSE"`, `"SuspendedEV"`, `"Finishing"`, `"Unknown"`) maps to `statusCharger = "OFFLINE"`.

**Consumer:** same `useEffect` as above:
```ts
typeOfCharger === "STATION" && statusCharger !== "ONLINE" && dispatch(setStep(5));
```

Step 5 renders `<EveOffline />` for both EVE and STATION types. There is no separate "in use" screen for STATION type — `StepEveInUse` (step 6) is mapped in `typeOfComponents` but is not reached by the current charger logic.

**For EVE type specifically:** the EVE slice does not inspect `currentActivity`; the commented-out code (`if (action?.payload?.currentActivity === "OFF")`) was removed. Online/offline status is determined solely by the 10-minute heartbeat threshold.

---

### Edge Case 5 — Transbank timeout (>10 min)

**Identified by:** `!token_ws && !TBK_TOKEN && TBK_ORDEN_COMPRA && TBK_ID_SESION` all present.

**File:** `src/pages/public/Return/index.tsx` — `validation()`

```ts
else if (!token && !tbkToken && tbkIdSesion && tbkOrdenCompra) {
  setResTransaction(prev => ({
    ...prev,
    step: 3,
    msg: "La transaccion fue Anulada por tiempo de espera",
    statusRedirect: "PAYMENT_REJECTED",
  }));

  // Calls setWPStatus with tbkIdSesion as the token argument
  const statusResponse = await dispatch(setWPStatus({ token: tbkIdSesion }));

  if (!statusData || !statusData.status) {
    throw new Error('Error en getWPStatus o respuesta inválida');
  }
  return true;
}
```

**Notable behaviour:** `setWPStatus` is called with `tbkIdSesion` as the token (not `tbkOrdenCompra`). The status result is used only to update `resTransaction.status`; the `statusRedirect` is already set to `"PAYMENT_REJECTED"` before the API call, so the redirect to `/rechazo-pago` will happen regardless of the API response.

---

### Edge Case 6 — Transbank double-callback (both `token_ws` AND `TBK_TOKEN`)

**Identified by:** `token_ws` present AND `TBK_TOKEN` present simultaneously.

**File:** `src/pages/public/Return/index.tsx` — `validation()`

```ts
else if (token && tbkToken) {
  setResTransaction(prev => ({
    ...prev,
    step: 5,
    msg: "El pago es inválido, contactese con su banco",
    tbk_token: tbkToken,
  }));
  // Note: statusRedirect is NOT set here — defaults to ""

  const statusResponse = await dispatch(setWPStatus({ token }));
  if (statusResponse?.status) {
    setResTransaction(prev => ({ ...prev, status: statusData.status }));
  }
  return true;
}
```

**Critical gap:** `statusRedirect` is never set to `"PAYMENT_REJECTED"` in this branch. The redirect `useEffect` only fires when `statusRedirect` equals `"PAYMENT_APPROVED"` or `"PAYMENT_REJECTED"`. With `statusRedirect = ""`, the redirect timer never starts. The `isProcessing` spinner continues indefinitely — user is stuck on the loading screen.

This is a known defect in the current implementation. A replication should document it and fix it by setting `statusRedirect: "PAYMENT_REJECTED"` in this branch.

---

### Edge Case 7 — User cancels Transbank (only `TBK_TOKEN`)

**Identified by:** `!token_ws && TBK_TOKEN` present.

**File:** `src/pages/public/Return/index.tsx` — `validation()`

```ts
else if (!token && tbkToken) {
  setResTransaction(prev => ({
    ...prev,
    step: 4,
    msg: "El pago fue anulado por el usuario",
    tbk_token: tbkToken,
    statusRedirect: "PAYMENT_REJECTED",
  }));

  await dispatch(setWPStatus({ token: tbkToken }));
  return true;
}
```

`setWPStatus` is called with `TBK_TOKEN` as the token. The `if (!statusData ...)` guard present in Flow 2 is omitted here — the status response error is silently ignored. `statusRedirect` is set correctly before the API call, so the redirect to `/rechazo-pago` proceeds even if `setWPStatus` throws (because the catch block in `validation()` sets `statusRedirect: "PAYMENT_REJECTED"` anyway).

---

### Edge Case 8 — MercadoPago payment rejected, cancelled, or pending

**File:** `src/pages/public/ReturnMP/index.tsx` — `handleValidation()`

**Rejected / cancelled:**
```ts
if (status === "failure" || status === "cancelled" || status === "rejected") {
  // payment_id may be null — that is fine
  if (preferenceId || externalReference) {
    dispatch(setMPStatus({ preferenceId, externalReference, mpStatus: status }))
      .catch(() => { /* non-critical */ });
  }
  window.setTimeout(() => {
    setIsProcessing(false);
    navigate("/rechazo-pago", { replace: true });
  }, 1500);
}
```

The DB update (`setMPStatus`) is fire-and-forget — redirect is not blocked by it. If `preferenceId` and `externalReference` are both absent, no DB update is attempted.

**Pending:**
```ts
if (status === "pending") {
  // same fire-and-forget pattern
  window.setTimeout(() => {
    navigate("/rechazo-pago", { replace: true });
  }, 3000);  // longer wait than failure (3s vs 1.5s)
}
```

Pending is treated the same as rejected from the user's perspective — they land on `/rechazo-pago`. There is no pending-state receipt page.

**Approved but API returns non-approved status:**
```ts
.then((result) => {
  if (result.status === "approved" || result.status === "CAPTURED") {
    navigate("/recibo-pago", ...);
  } else {
    navigate("/rechazo-pago", ...); // API returned unexpected status
  }
})
```

---

### Edge Case 9 — GraphQL network errors during any API call

**All services** use the pattern:
```ts
try {
  const response = await client.graphql({ query, variables });
  return response.data?.field || {};
} catch (error) {
  throw error;  // re-thrown to Redux thunk
}
```

Redux thunks catch re-throws and dispatch `.rejected`. Slice reducers set `state.status = "failed"` and `state.errorMessage`.

**In Return page:** the outer `try/catch` in `validation()` catches any throw from `dispatch(setWP*)` and sets:
```ts
setResTransaction(prev => ({
  ...prev,
  apiError: true,
  msg: "Error en la validación del pago",
  status: "ERROR",
  statusRedirect: "PAYMENT_REJECTED",
}));
```
This correctly triggers the redirect to `/rechazo-pago`.

**In ReturnMP:** `setMPStatus().catch()` for failure/pending flows is non-blocking. For the approved flow, `.catch()` sets the loading message to `"⚠️ Error al verificar el pago"` and navigates to `/rechazo-pago` after 1.5s.

**In Payment page:** if `getEve` or `getCharger` throws, the slice sets `status = "failed"`. The JSX conditionally renders `<Loading/>` for `status === "loading"`, but there is no explicit error UI for `status === "failed"`. The component stays stuck showing nothing (neither loading nor a step component) because the rendering condition is `status === "idle"`.

---

### Edge Case 10 — EmailJS send failure (non-blocking)

**File:** `src/pages/public/Return/index.tsx` — `sendEmail()`

```ts
try {
  await emailjs.send(SERVICE, TEMPLATE, { ...objEmail });
  setEmailWasSent(true);
} catch (error) {
  console.log('Error: en el envio del Email: ', error);
  setEmailAttempted(false);  // reset so a retry is possible
  return false;
}
```

**Behaviour on failure:**
- `emailWasSent` remains `false`.
- `emailAttempted` is reset to `false`, which would allow the `useEffect` that calls `sendEmail()` to retry — but only if the `transaction` dependency changes again, which it won't after the first fetch.
- The redirect `useEffect` checks `emailWasSent`. Since `statusRedirect === "PAYMENT_APPROVED"` and `emailWasSent === false`, the condition `resTransaction?.statusRedirect === "PAYMENT_APPROVED" && !emailWasSent` is `true`, which causes the effect to `return` early — meaning **the redirect to `/recibo-pago` never fires if the email fails**.

This is a critical defect for approved payments where EmailJS is down: the user is stuck on the loading screen. A replication must address this by adding a timeout-based fallback redirect independent of `emailWasSent`.

---

### Edge Case 11 — sessionStorage unavailable (private browser / iOS restrictions)

**Writing in Return/ReturnMP:**
```ts
sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
```

If `sessionStorage` is restricted (Safari private mode throws a `SecurityError` on write), this line throws synchronously, which is uncaught. The subsequent `navigate(...)` call is never reached, leaving the user on the Return page with the spinner running indefinitely.

**Reading in Recibo-pago:**
```ts
const storedData = sessionStorage.getItem('paymentData');
if (storedData) {
  const data = JSON.parse(storedData);
  setPaymentData({ email: data.email || "", hasData: true });
} else {
  setPaymentData({ ...paymentData, hasData: false });
}
```

If `sessionStorage.getItem` throws, it is also uncaught. The `hasData: false` branch renders "No se encontraron datos de la transacción" with a decorative SVG — this is the graceful degradation path if storage is simply empty, but not if it throws.

**Required hardening for replication:**
```ts
try {
  sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
} catch {
  // storage unavailable — proceed without persisting
}
```

---

### Edge Case 12 — Amplify config file missing or invalid

**File:** `src/utils/amplify-config.ts`

```ts
export const getAmplifyConfig = () => {
  try {
    if (environment === 'PROD') {
      outputs = { ...outputsProd };
    } else {
      outputs = { ...outputsDev };
    }
    return outputs;
  } catch (error) {
    console.error('Error loading Amplify configuration:', error);
    return outputsProd;  // fallback to prod config
  }
};
```

The `import` statements at the top of the file (`import outputsProd from "../../amplify_outputs.json"`) are resolved at build time by Vite. If either JSON file is missing, the **build fails** — there is no runtime fallback for a missing file.

If the file exists but contains invalid JSON, the Vite build also fails at module parse time.

The `try/catch` inside `getAmplifyConfig` guards against runtime errors in the config object processing (e.g., malformed structure), not missing files. The fallback `return outputsProd` would return the stale in-memory import.

**Configuration selection logic:**
- `VITE_ENVIRONMENT === 'PROD'` → `amplify_outputs.json` (production AppSync endpoint)
- Any other value (including unset) → `amplify_outputs_dev.json` (dev AppSync endpoint)

---

### Edge Case 13 — Invalid or expired JWT in `?pay=` param

**File:** `src/pages/public/Payment/index.tsx`

```ts
} else if (payParam) {
  dispatch(setStep(3));
  setJwt(payParam);
}
```

The JWT is stored in local state and passed as `jwt` prop to `<ResumePayment />`. The Payment page itself performs **no validation** of the JWT — it is not decoded, not verified, and not checked for expiry.

The JWT is consumed by `<ResumePayment />` when initiating the payment flow (calling `setMPStart` or `setWPStart`). If the JWT is invalid or expired, the backend Lambda resolver will reject the call, which surfaces as a GraphQL error → Redux `failed` state → no graceful UI feedback (see Edge Case 9 for payment page API failures).

---

### Edge Case 14 — Direct navigation to `/return` or `/return-mp` without valid params

**`/return` — no params:**

`handleValidation()` is always called on mount. Inside `validation()`:

```ts
const token      = query.get("token_ws") || "";   // ""
const tbkToken   = query.get("TBK_TOKEN") || "";  // ""
const tbkOrdenCompra = query.get("TBK_ORDEN_COMPRA") || ""; // ""
const tbkIdSesion    = query.get("TBK_ID_SESION") || "";    // ""
```

None of the four `if/else if` branches match (Flow 1 requires `token && !tbkToken`, Flow 2 requires `!token && !tbkToken && tbkIdSesion && tbkOrdenCompra`, Flow 3 requires `!token && tbkToken`, Flow 4 requires `token && tbkToken`).

The function returns `false`. No state is updated, `statusRedirect` remains `""`, `resTransaction.step` remains `0`. The redirect `useEffect` never fires. The retry `useEffect` fires after 20 seconds (because `step !== 1 && step !== 0` is false since `step === 0` matches the guard). The user sees the loading spinner indefinitely.

**`/return-mp` — no params:**

```ts
const status = searchParams.get("status") ?? ""; // ""
```

First guard fires:
```ts
if (!status) {
  setIsProcessing(false);
  navigate("/rechazo-pago", { replace: true });
  return;
}
```

Direct navigation to `/return-mp` with no `status` param immediately redirects to `/rechazo-pago`. This is correct and graceful.

---

### Edge Case 15 — Page refresh on `/recibo-pago` or `/rechazo-pago`

**`/recibo-pago`:**

```ts
useEffect(() => {
  const storedData = sessionStorage.getItem('paymentData');
  if (storedData) {
    const data = JSON.parse(storedData);
    setPaymentData({ email: data.email || "", hasData: true });
  } else {
    setPaymentData({ ...paymentData, hasData: false });
  }
}, []);
```

`sessionStorage` **persists for the duration of the browser tab session**. A page refresh within the same tab preserves the data. The `hasData: true` path renders correctly.

However, if the user closes the tab and reopens the URL directly, `sessionStorage` is cleared. `hasData` becomes `false` and the page renders:
- A decorative SVG (the complex path drawing in the source)
- The text "No se encontraron datos de la transacción"
- No email confirmation, no "Hacer otra carga" button (the button only appears in the `hasData: true` branch)

The user cannot navigate away except via browser controls.

**`/rechazo-pago`:**

This page reads no data from `sessionStorage`. It always renders `<SvgFailed />` and the "Hacer otra carga" button. Refreshing or direct navigation always produces the correct rejection UI.

---

### Edge Case 16 — Charger station stationId stripping logic for `OCPPBE` prefix

**File:** `src/pages/public/Payment/index.tsx`

```ts
const firstFiveChars = idParam.substring(0, 6).toUpperCase();  // note: variable name says "Five", length is 6

if (firstFiveChars === "OCPPBE") {
  const stationId = idParam.substring(6);  // strips the 6-character prefix "OCPPBE"
  dispatch(getCharger({ stationId: stationId }));
  dispatch(setTypeOfCharger("STATION"));
}
```

**Variable naming inconsistency:** `firstFiveChars` uses `substring(0, 6)` — it captures 6 characters, not 5. The variable name is misleading but the logic is correct for the `"OCPPBE"` prefix (6 characters).

**stationId derivation:** `idParam.substring(6)` — removes exactly the 6-character `"OCPPBE"` prefix. For `idParam = "OCPPBE0042"`, `stationId = "0042"`.

**Case sensitivity:** `idParam.substring(0, 6).toUpperCase()` normalises to uppercase before comparison. `ocppbe0042` is handled correctly. The `stationId` extracted retains the original casing of `idParam` (only the prefix slice was upper-cased, not `idParam` itself).

**Edge sub-case — prefix exactly 6 chars, no suffix:** `idParam = "OCPPBE"` → `stationId = ""`. `getCharger({ stationId: "" })` fires with an empty string. The backend query will fail or return no result, and the stale/empty payload will cause `statusCharger` to remain `""`, triggering `setStep(5)` (offline screen) via the `statusCharger !== "ONLINE"` guard.

---

## 3. Redux State Summary for Edge Cases

| Scenario | `step` | `statusRedirect` | Final page |
|---|---|---|---|
| No URL params | 0 | — | CartNotExist |
| Unknown ID prefix | 0 | — | CartNotExist |
| EVE/STATION offline | 5 | — | EveOffline |
| TBK Flow 1 (approved) | — | "PAYMENT_APPROVED" | /recibo-pago |
| TBK Flow 2 (timeout) | — | "PAYMENT_REJECTED" | /rechazo-pago |
| TBK Flow 3 (user cancelled) | — | "PAYMENT_REJECTED" | /rechazo-pago |
| TBK Flow 4 (invalid — both tokens) | — | "" (bug) | stuck on spinner |
| MP approved | — | — | /recibo-pago |
| MP failure/cancelled/pending | — | — | /rechazo-pago |
| GraphQL error on Return | — | "PAYMENT_REJECTED" | /rechazo-pago |
| EmailJS failure on approved TBK | — | "PAYMENT_APPROVED" (but emailWasSent=false) | stuck on spinner |
| Direct nav to /return-mp (no params) | — | — | /rechazo-pago (immediate) |
| Refresh /recibo-pago (sessionStorage empty) | — | — | "No data" screen, no nav button |

---

## 4. Known Defects to Address in Replication

1. **TBK Flow 4 (double-callback):** missing `statusRedirect: "PAYMENT_REJECTED"` — user is stranded on the loading screen.
2. **EmailJS failure blocks redirect:** `emailWasSent === false` prevents the `/recibo-pago` redirect for approved TBK payments. Add a maximum-wait timeout (e.g., 10s) after which the redirect fires regardless.
3. **Direct navigation to `/return` with no params:** no redirect out — user sees infinite spinner. Should redirect to `/rechazo-pago` immediately.
4. **`sessionStorage.setItem` uncaught throws:** wrap in try/catch in both Return and ReturnMP pages.
5. **`HoursAndMinutes` in dateHandler.ts:** broken implementation and uses `console.log`. Deprecate or rewrite.
6. **`console.log` in production code:** scattered throughout slice files and page components. All should be `logger.info()`/`logger.error()`.
7. **Payment page API failure has no error UI:** when `getEve` or `getCharger` sets `status = "failed"`, the JSX renders nothing (blank within the card) because only `status === "idle"` is gated to show steps.
