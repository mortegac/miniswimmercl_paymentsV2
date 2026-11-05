# 05 — State Management

**Scope:** Redux Toolkit store, typed hooks, and every domain + UI slice in the `energica_payments` front-end.

---

## 1. Store Setup

**File:** `src/stores/store.ts`

```ts
import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import darkModeReducer      from "./darkModeSlice";
import colorSchemeReducer   from "./colorSchemeSlice";
import sideMenuReducer      from "./sideMenuSlice";
import themeReducer         from "./themeSlice";
import compactMenuReducer   from "./compactMenuSlice";
import pageLoaderReducer    from "./pageLoaderSlice";
import chargerReducer       from "./Charger/slice";
import evesCartReducer      from "./Eves/slice";
import WPReducer            from "./WP/slice";
import PaymentTransactionsReducer from "./PaymentTransactions/slice";
import mercadoPagoReducer   from "./MercadoPago/slice";

export const store = configureStore({
  reducer: {
    darkMode:            darkModeReducer,
    colorScheme:         colorSchemeReducer,
    sideMenu:            sideMenuReducer,
    theme:               themeReducer,
    compactMenu:         compactMenuReducer,
    pageLoader:          pageLoaderReducer,
    charger:             chargerReducer,
    eves:                evesCartReducer,
    WP:                  WPReducer,
    paymentTransactions: PaymentTransactionsReducer,
    mercadoPago:         mercadoPagoReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState   = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
```

### Root state shape (key → slice state type)

| Redux key             | Slice state type                  |
|-----------------------|-----------------------------------|
| `darkMode`            | `DarkModeState`                   |
| `colorScheme`         | `ColorSchemeState`                |
| `sideMenu`            | `SideMenuState`                   |
| `theme`               | `ThemeState`                      |
| `compactMenu`         | `CompactMenuState`                |
| `pageLoader`          | `PageLoaderState`                 |
| `charger`             | `ChargerSliceState`               |
| `eves`                | `EveSliceState`                   |
| `WP`                  | `WPState`                         |
| `paymentTransactions` | `PaymentTransactionsState`        |
| `mercadoPago`         | `MercadoPagoState`                |

---

## 2. Typed Hooks

**File:** `src/stores/hooks.ts`

```ts
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

Usage in components:

```ts
const dispatch = useAppDispatch();
const charger  = useAppSelector(selectCharger);
```

---

## 3. Domain Slices

### 3.1 Charger Slice

**Files:** `src/stores/Charger/{slice.ts, type.ts, services.ts}`

#### Types

```ts
// type.ts
export type Charger = {
  chargerId?:       string;
  stationId?:       string;
  fantasyName?:     string;
  connectorStatus?: string;
  lastCheckedIn?:   string;
};

export const emptyCharger: Charger = {
  stationId:       "",
  fantasyName:     "",
  connectorStatus: "",
};

export type chargerInput = {
  stationId?: string;
};
```

#### State interface

```ts
interface ChargerSliceState {
  status:                "idle" | "loading" | "failed";
  stateCharger:          "";           // raw `state` field from payload (always "" currently)
  statusCharger:         string;       // derived: "ONLINE" | "OFFLINE" | ""
  charger:               Charger;
  error:                 string | null;
  minutesSinceLastCheck: number;       // minutes since charger's updatedAt
}

const initialState: ChargerSliceState = {
  status:                "idle",
  stateCharger:          "",
  statusCharger:         "",
  charger:               {},
  error:                 null,
  minutesSinceLastCheck: 0,
};
```

#### Selector

```ts
export const selectCharger = (state: RootState) => state.charger;
```

#### Async thunk

```ts
export const getCharger = createAsyncThunk(
  "Charger/listOne",
  async (objFilter: chargerInput) => { /* calls fetchCharger */ }
);
```

**State transitions:**

| Case        | `status`    | Side effects                                                                                      |
|-------------|-------------|---------------------------------------------------------------------------------------------------|
| `pending`   | `"loading"` | `error = null`                                                                                    |
| `fulfilled` | `"idle"`    | Sets `charger`, computes `minutesSinceLastCheck`. If >10 min → `statusCharger = "OFFLINE"`. Else `statusCharger = "ONLINE"` if connectorStatus is `"Preparing"` or `"Available"`, else `"OFFLINE"`. Sets `stateCharger`. |
| `rejected`  | `"failed"`  | `error = action.error.message`                                                                    |

#### GraphQL service

```ts
// services.ts — uses typed Amplify client from src/init.ts
const chargerResponse = await client.graphql<ChargerResponse>({
  query: `
    query getOneCharger($stationId: ID!) {
      getCharger(stationId: $stationId) {
        stationId fantasyName connectorStatus lastCheckedIn updatedAt
      }
    }
  `,
  variables: { stationId: objFilter.stationId },
});
// returns chargerResponse.data?.getCharger || {}
```

---

### 3.2 Eves Slice

**Files:** `src/stores/Eves/{slice.ts, type.ts, services.ts}`

#### Types

```ts
// type.ts
export type Eve = {
  eveId?:        string;
  name?:         string;
  eveState?:     string;
  lastCheckedIn?: string;
};

export const emptyEve: Eve = {
  eveId:    "",
  name:     "",
  eveState: "",
};

export type eveInput = {
  eveId?: string;
};
```

#### State interface

```ts
interface EveSliceState {
  status:                "idle" | "loading" | "failed";
  eve:                   Eve;
  statusEve:             string;  // derived: "ONLINE" | "OFFLINE" | ""
  stateEve:              "";      // raw `state` field from payload
  minutesSinceLastCheck: number;
  error:                 string | null;
}

const initialState: EveSliceState = {
  status:                "idle",
  eve:                   {},
  statusEve:             "",
  stateEve:              "",
  minutesSinceLastCheck: 0,
  error:                 null,
};
```

#### Selector

```ts
export const selectEve = (state: RootState) => state.eves;
// Note: reducer key is "eves" in the store, slice name is "eve"
```

#### Async thunk

```ts
export const getEve = createAsyncThunk(
  "Eve/listOne",
  async (objFilter: eveInput) => { /* calls fetchEve */ }
);
```

**State transitions:**

| Case        | `status`    | Side effects                                                                                   |
|-------------|-------------|-----------------------------------------------------------------------------------------------|
| `pending`   | `"loading"` | `error = null`                                                                                 |
| `fulfilled` | `"idle"`    | If payload is empty → `statusEve = "OFFLINE"`, `stateEve = ""`, `eve = {}`. Else sets `eve`, computes `minutesSinceLastCheck`. If >10 min or no `updatedAt` → `statusEve = "OFFLINE"`, else `"ONLINE"`. Sets `stateEve`. |
| `rejected`  | `"failed"`  | `error = action.error.message`                                                                 |

#### GraphQL service

```ts
// services.ts — uses typed Amplify client from src/init.ts
// eveId is uppercased before sending
const response = await client.graphql<EveResponse>({
  query: `
    query GetEve($eveId: ID!) {
      getEve(eveId: $eveId) {
        eveId name eveState lastCheckedIn updatedAt currentActivity
      }
    }
  `,
  variables: { eveId: objFilter.eveId?.toUpperCase() || "" },
});
// returns response.data?.getEve || {}
```

---

### 3.3 WP (Webpay) Slice

**Files:** `src/stores/WP/{slice.ts, types.ts, services.ts, mutation.ts, queries.ts}`

#### Types

```ts
// types.ts

export type wpInput = {
  amount?:       number;
  userId?:       string;
  userName?:     string;
  userPhone?:    string;
  glosa?:        string;
  idEve?:        string;
  stationId?:    string;
  chargingHours?: number;
  token?:        string;
  typeOfCharger?: string;
};

export type Transaction = {
  order: string;
  token: string;
  url:   string;
};
export const emptyTransaction: Transaction = { order: "", token: "", url: "" };

export type CommitData = {
  message: string;
  status:  string;
};
export const emptyCommitData: CommitData = { message: "", status: "" };

export type StatusData = {
  paymentTransactionId:       string;
  payment_type_code:          string;
  buy_order:                  string;
  amount:                     string;
  glosa:                      string;
  card_number:                string;
  usersPaymentTransactionsId: string;
  status:                     string;
  eveId:                      string;
  stationId:                  string;
};
export const emptyStatusData: StatusData = {
  paymentTransactionId:       "",
  payment_type_code:          "",
  buy_order:                  "",
  amount:                     "",
  glosa:                      "",
  card_number:                "",
  usersPaymentTransactionsId: "",
  status:                     "",
  eveId:                      "",
  stationId:                  "",
};

export type FilterOptions = {
  buyOrder?: string;
  amount?:   number;
  userId?:   string;
  glosa?:    string;
  cartId?:   string;
  token?:    string;
};

// Response wrappers (used internally by services)
export interface wpStartResponse  { webpayStart:  { order: string; token: string; url: string }; }
export interface wpCommitResponse { webpayCommit: { message: string; status: string }; }
export interface wpStatusResponse { webpayStatus: StatusData; }
export interface wpCalculatePricingResponse { CalculateEvePricing: number; }
```

#### State interface

```ts
export interface WPState {
  status:          "idle" | "loading" | "failed";
  transaction:     Transaction;    // result of webpayStart
  statusTransaction: string;       // currently unused (always "")
  commitData:      CommitData;     // result of webpayCommit
  statusData:      StatusData;     // result of webpayStatus
  errorMessage:    string;
}

export const initialState: WPState = {
  status:            "idle",
  transaction:       emptyTransaction,
  statusTransaction: "",
  commitData:        emptyCommitData,
  statusData:        emptyStatusData,
  errorMessage:      "",
};
```

#### Selector

```ts
export const selectWP = (state: RootState) => state.WP;
```

#### Async thunks

| Thunk | Action type | Input | Service called | State updated |
|-------|-------------|-------|----------------|---------------|
| `setWPStart`  | `"WP/create"` | `wpInput`       | `wpStart()`  | `transaction`  |
| `setWPCommit` | `"WP/commit"` | `FilterOptions` | `wpCommit()` | `commitData`   |
| `setWPStatus` | `"WP/status"` | `FilterOptions` | `wpStatus()` | `statusData`   |

All three follow the same pattern for the three lifecycle cases:

| Case        | `status`    | Side effects                              |
|-------------|-------------|-------------------------------------------|
| `pending`   | `"loading"` | —                                         |
| `fulfilled` | `"idle"`    | Spread payload into the matching field    |
| `rejected`  | `"failed"`  | `errorMessage = objPayload.errorMessage`  |

#### GraphQL services (all use `generateClient()` directly)

**`wpStart`** — GraphQL mutation `webpayStart`
- Variables: `idEve`, `stationId`, `userId`, `amount` (Int!), `glosa` (String!), `chargingHours`, `type` (WebpayStartType enum!)
- Returns: `{ order, token, url }`

**`wpCommit`** — GraphQL mutation `webpayCommit`
- Variables: `token` (String!)
- Returns: `{ message, status }`

**`wpStatus`** — GraphQL mutation `webpayStatus` (note: declared as mutation, not query)
- Variables: `token` (String!)
- Returns: full `StatusData` shape

**`getCalculatePricing`** — GraphQL query `CalculateEvePricing`
- Variables: `eveId`, `stationId`, `chargingHours`
- Returns: `number`
- Used by `paymentTransactions` slice (not directly in WP slice)

---

### 3.4 MercadoPago Slice

**Files:** `src/stores/MercadoPago/{slice.ts, types.ts, services.ts, mutations.ts}`

#### Types

```ts
// types.ts

export type MercadoPagoInput = {
  amount?:        number;
  userId?:        string;
  glosa?:         string;
  idEve?:         string;
  stationId?:     string;
  chargingHours?: number;
  typeOfCharger?: string;
};

export type MercadoPagoStatusInput = {
  paymentId?:         string;  // present for approved flows; null/absent for failures
  preferenceId?:      string;  // from return URL — used when paymentId is absent
  externalReference?: string;  // from return URL — fallback identifier
  mpStatus?:          string;  // status string from return URL (e.g., "failure", "pending")
};

export type MercadoPagoPreference = {
  preferenceId:      string;
  initPoint:         string;
  sandboxInitPoint:  string;
};
export const emptyPreference: MercadoPagoPreference = {
  preferenceId:     "",
  initPoint:        "",
  sandboxInitPoint: "",
};

export type MercadoPagoStatusData = {
  paymentId:       string;
  status:          string;
  statusDetail:    string;
  amount:          number;
  glosa:           string;
  externalReference: string;
  payerEmail:      string;
  paymentMethodId: string;
  dateApproved:    string;
};
export const emptyStatusData: MercadoPagoStatusData = {
  paymentId:         "",
  status:            "",
  statusDetail:      "",
  amount:            0,
  glosa:             "",
  externalReference: "",
  payerEmail:        "",
  paymentMethodId:   "",
  dateApproved:      "",
};
```

#### State interface

```ts
export interface MercadoPagoState {
  status:       "idle" | "loading" | "failed";
  preference:   MercadoPagoPreference;   // result of mercadopagoStart
  statusData:   MercadoPagoStatusData;   // result of mercadopagoStatus
  errorMessage: string;
}

const initialState: MercadoPagoState = {
  status:       "idle",
  preference:   emptyPreference,
  statusData:   emptyStatusData,
  errorMessage: "",
};
```

#### Selector

```ts
export const selectMP = (state: RootState) => state.mercadoPago;
```

#### Sync reducers

| Action             | Payload | Effect                                          |
|--------------------|---------|-------------------------------------------------|
| `resetMPPreference`| none    | `preference = emptyPreference; errorMessage = ""`|

#### Async thunks

| Thunk         | Action type           | Input                   | Service        | State updated |
|---------------|-----------------------|-------------------------|----------------|---------------|
| `setMPStart`  | `"MercadoPago/start"` | `MercadoPagoInput`      | `mpStart()`    | `preference`  |
| `setMPStatus` | `"MercadoPago/status"`| `MercadoPagoStatusInput`| `mpStatus()`   | `statusData`  |

**State transitions (both thunks):**

| Case        | `status`    | Side effects                                                      |
|-------------|-------------|-------------------------------------------------------------------|
| `pending`   | `"loading"` | `errorMessage = ""`                                              |
| `fulfilled` | `"idle"`    | Spread payload merged with empty default into respective field    |
| `rejected`  | `"failed"`  | `errorMessage = action.error.message \|\| <default string>`      |

#### GraphQL services (use `generateClient()` directly)

**`mpStart`** — GraphQL mutation `mercadopagoStart`
- Variables: `amount` (Float!), `glosa` (String!), `userId` (String!), `idEve` (String), `stationId` (String), `chargingHours` (Float), `type` (String!, defaults to `"EVE"`)
- Returns: `{ preferenceId, initPoint, sandboxInitPoint }`

**`mpStatus`** — GraphQL query `mercadopagoStatus`
- Variables: all optional — `paymentId`, `preferenceId`, `externalReference`, `mpStatus` (empty strings are sent as `undefined`)
- Returns: full `MercadoPagoStatusData` shape

---

### 3.5 PaymentTransactions Slice

**Files:** `src/stores/PaymentTransactions/{slice.ts, types.ts, services.ts, queries.ts}`

#### Types

```ts
// types.ts

export type PaymentTransactions = {
  id:                         string;
  usersPaymentTransactionsId: string;
  amount:                     number;
  buy_order:                  string;
  card_number:                string;
  transaction_date:           string;
  accounting_date:            string;
  installments_number:        string;
  payment_type_code:          string;
  session_id:                 string;
  card_detail:                string;
  installments_amount:        string;
  authorization_code:         string;
  response_code:              string;
  vci:                        string;
  day:                        string;
  month:                      string;
  year:                       string;
  hour:                       string;
  glosa:                      string;
  chargingHours:              string;
  horaOn:                     string;
  horaOff:                    string;
};
export const emptyPaymentTransactions: PaymentTransactions = { /* all fields "" or 0 */ };

export type ShoppingCart = {
  id:                   string;
  totalPrice:           number;
  order:                number;
  status:               string;
  usersShoppingCartId:  string;
  nameShoppingCartId:   string;
  glosa:                string;
  detail?:              string;
};
export const emptyShoppingCart: ShoppingCart = {
  id: "", totalPrice: 0, order: 0, status: "",
  usersShoppingCartId: "", nameShoppingCartId: "", glosa: "", detail: "",
};

export type FilterOptions = {
  token?: string;
};

export type paymentTransactionInput = {
  token: string;
};

// Full GraphQL response shape (used only inside services)
export type PaymentTransactionResponse = {
  listPaymentTransactionByToken: {
    items: Array<{
      paymentTransactionId: string; status: string; amount: number;
      horaOn: string; horaOff: string; chargingHours: number; date: string;
      buy_order: string; card_number: string; transaction_date: string;
      accounting_date: string; installments_number: string;
      installments_amount: string; payment_type_code: string;
      card_detail: string; session_id: string; authorization_code: string;
      response_code: string; vci: string; glosa: string;
      transactionType: string; usersPaymentTransactionsId: string;
      eveId: string; stationId: string; token: string; isFake: boolean;
      paymentsProcessorCommission: number; createdAt: string; updatedAt: string;
      eveChargeEventId: string; chargerChargeEventId: string;
      residenceId: string; refundId: string;
    }>;
    nextToken?: string;
  };
};
```

#### State interface

```ts
export interface PaymentTransactionsState {
  status:        "idle" | "loading" | "failed";
  transaction:   PaymentTransactions;
  shoppingCart:  ShoppingCart;
  duration:      number;        // selected charging hours (UI state)
  pricing:       number;        // calculated price from CalculateEvePricing
  glosa:         string;
  name:          string;
  date:          string;
  errorMessage:  string;
  step:          number;        // wizard step 0–7
  typeOfCharger: "EVE" | "STATION" | "";
}

export const initialState: PaymentTransactionsState = {
  status:        "idle",
  transaction:   emptyPaymentTransactions,
  shoppingCart:  emptyShoppingCart,
  duration:      0,
  pricing:       0,
  glosa:         "",
  name:          "",
  date:          "",
  errorMessage:  "",
  step:          1,
  typeOfCharger: "",
};
```

#### Selector

```ts
export const selectPaymentTransactions = (state: RootState) => state.paymentTransactions;
```

#### Sync reducers (actions)

| Action name      | Payload type      | Effect                                                    |
|------------------|-------------------|-----------------------------------------------------------|
| `setDuration`    | `number`          | `state.duration = payload`                                |
| `setEmail`       | `string`          | `state.transaction.usersPaymentTransactionsId = payload`  |
| `setStep`        | `number`          | `state.step = payload`                                    |
| `setTypeOfCharger` | `"EVE" \| "STATION" \| ""` | `state.typeOfCharger = payload`            |
| `setShoppingCart`| `Partial<ShoppingCart>` | Replaces `state.shoppingCart` with mapped/coerced object|

**`setShoppingCart` coercion:** Each field is explicitly cast — `id`, `status`, `usersShoppingCartId`, `nameShoppingCartId`, `glosa`, `detail` via `String()`; `totalPrice`, `order` via `Number()`.

#### Async thunks

| Thunk | Action type | Input | Service / dependency | State updated |
|-------|-------------|-------|----------------------|---------------|
| `setCalculatePricing`    | `"paymentTransactions/calculatePricing"` | `wpInput` | `getCalculatePricing()` from `WP/services` | `pricing` |
| `getPaymentTransactions` | `"paymentTransactions/list"`             | `FilterOptions` (requires `token`) | `fetchPaymentTransactionByToken()` | `transaction` |

**`setCalculatePricing` state transitions:**

| Case        | `status`    | Side effects                                  |
|-------------|-------------|-----------------------------------------------|
| `pending`   | `"loading"` | `errorMessage = ""`                           |
| `fulfilled` | `"idle"`    | `pricing = action.payload; errorMessage = ""` |
| `rejected`  | `"failed"`  | `errorMessage = action.error.message`         |

**`getPaymentTransactions` state transitions:**

| Case        | `status`    | Side effects                                        |
|-------------|-------------|-----------------------------------------------------|
| `pending`   | `"loading"` | —                                                   |
| `fulfilled` | `"idle"`    | `transaction = { ...action.payload }`               |
| `rejected`  | `"failed"`  | `errorMessage = objPayload.errorMessage`            |

#### GraphQL service

```ts
// services.ts — uses generateClient() directly
// Returns first item from the list or {} if empty
const response = await client.graphql<PaymentTransactionResponse>({
  query: `
    query ListPaymentTransactionByToken($token: ID!) {
      listPaymentTransactionByToken(token: $token) {
        items {
          paymentTransactionId status amount horaOn horaOff chargingHours date
          buy_order card_number transaction_date accounting_date
          installments_number installments_amount payment_type_code
          card_detail session_id authorization_code response_code vci glosa
          transactionType usersPaymentTransactionsId eveId stationId
        }
        nextToken
      }
    }
  `,
  variables: { token: objFilter.token },
});
// returns response.data?.listPaymentTransactionByToken?.items?.[0] || {}
```

---

## 4. UI Slices

### 4.1 darkMode

**File:** `src/stores/darkModeSlice.ts`

```ts
interface DarkModeState { value: boolean; }

// Initial: reads localStorage "darkMode" === "true"
const initialState: DarkModeState = {
  value: localStorage.getItem("darkMode") === "true",
};
```

| Action       | Payload   | Effect                    |
|--------------|-----------|---------------------------|
| `setDarkMode`| `boolean` | `state.value = payload`   |

Selector `selectDarkMode`: initializes `"darkMode"` key to `"false"` in localStorage if absent, then returns `state.darkMode.value`.

---

### 4.2 colorScheme

**File:** `src/stores/colorSchemeSlice.ts`

```ts
export const colorSchemes = [
  "default", "theme-1", "theme-2", ..., "theme-17"
] as const;
export type ColorSchemes = (typeof colorSchemes)[number];

interface ColorSchemeState { value: ColorSchemes; }

// Initial: "default" if localStorage "colorScheme" is null, else matched value
```

| Action           | Payload        | Effect                   |
|------------------|----------------|--------------------------|
| `setColorScheme` | `ColorSchemes` | `state.value = payload`  |

Selector `selectColorScheme`: initializes `"colorScheme"` to `"default"` in localStorage if absent.

---

### 4.3 sideMenu

**File:** `src/stores/sideMenuSlice.ts`

```ts
export interface Menu {
  icon:      keyof typeof icons;  // Lucide icon key
  title:     string;
  badge?:    number;
  pathname?: string;
  subMenu?:  Menu[];
  ignore?:   boolean;
}

export interface SideMenuState {
  menu: Array<Menu | string>;  // strings are section labels; Menu objects are items
}

// Initial: menu contains only placeholder strings; all real items are commented out
const initialState: SideMenuState = { menu: ["", "Ingresos - Egresos"] };
```

No reducers. No actions. Slice is a static data container only.

Selector: `selectSideMenu = (state: RootState) => state.sideMenu.menu`.

---

### 4.4 theme

**File:** `src/stores/themeSlice.ts`

```ts
export const themes = [{ name: "echo", component: Echo }] as const;
export type Themes = (typeof themes)[number];

interface ThemeState { value: Themes["name"]; }  // always "echo"

// Initial: "echo" (only theme available; falls back if localStorage "theme" is null)
```

| Action     | Payload          | Effect                  |
|------------|------------------|-------------------------|
| `setTheme` | `Themes["name"]` | `state.value = payload` |

Selector `selectTheme`: initializes `"theme"` to `"echo"` in localStorage if absent.

---

### 4.5 compactMenu

**File:** `src/stores/compactMenuSlice.ts`

```ts
interface CompactMenuState { value: boolean; }

// Initial: true if localStorage "compactMenu" is null, else parses stored value
```

| Action           | Payload   | Effect                   |
|------------------|-----------|--------------------------|
| `setCompactMenu` | `boolean` | `state.value = payload`  |

Selector `selectCompactMenu`: initializes `"compactMenu"` to `"true"` in localStorage if absent.

---

### 4.6 pageLoader

**File:** `src/stores/pageLoaderSlice.ts`

```ts
interface PageLoaderState { value: boolean; }

const initialState: PageLoaderState = { value: false };
```

| Action          | Payload   | Effect                  |
|-----------------|-----------|-------------------------|
| `setPageLoader` | `boolean` | `state.value = payload` |

Selector: `selectPageLoader = (state: RootState) => state.pageLoader.value`.

---

## 5. GraphQL → Redux Thunk Mapping

| GraphQL operation       | HTTP verb     | Thunk                    | Slice               | Amplify client used     |
|-------------------------|---------------|--------------------------|---------------------|-------------------------|
| `getCharger`            | query         | `getCharger`             | `charger`           | typed (`src/init.ts`)   |
| `getEve`                | query         | `getEve`                 | `eves`              | typed (`src/init.ts`)   |
| `CalculateEvePricing`   | query         | `setCalculatePricing`    | `paymentTransactions`| `generateClient()`     |
| `webpayStart`           | mutation      | `setWPStart`             | `WP`                | `generateClient()`      |
| `webpayCommit`          | mutation      | `setWPCommit`            | `WP`                | `generateClient()`      |
| `webpayStatus`          | mutation*     | `setWPStatus`            | `WP`                | `generateClient()`      |
| `listPaymentTransactionByToken` | query | `getPaymentTransactions` | `paymentTransactions`| `generateClient()`     |
| `mercadopagoStart`      | mutation      | `setMPStart`             | `mercadoPago`       | `generateClient()`      |
| `mercadopagoStatus`     | query         | `setMPStatus`            | `mercadoPago`       | `generateClient()`      |

*`webpayStatus` is declared as a GraphQL `mutation` in the schema even though it queries status — this is intentional in the current implementation.

**Two Amplify client patterns exist side-by-side:**
- `client` from `src/init.ts` — used by Charger and Eves services (typed Amplify v6 generated client).
- `generateClient()` from `aws-amplify/api` — used by WP, MercadoPago, and PaymentTransactions services (untyped, inline query strings).

---

## 6. Error State Patterns

Three distinct error patterns exist across slices:

### Pattern A — `error: string | null` (Charger, Eves)

```ts
// On pending:  state.error = null
// On rejected: state.error = action.error.message || "fallback"
```

### Pattern B — `errorMessage: string` (WP, PaymentTransactions, MercadoPago)

```ts
// On pending:  (WP does nothing; MP/PT clear: state.errorMessage = "")
// On rejected:
//   WP:  state.errorMessage = (action.payload as any).errorMessage   ← reads payload, not action.error
//   PT:  state.errorMessage = (action.payload as any).errorMessage   ← same
//   MP:  state.errorMessage = action.error.message || "default text" ← reads action.error
```

**Important inconsistency:** WP and PaymentTransactions `rejected` handlers read `action.payload.errorMessage`, but `createAsyncThunk` without `rejectWithValue` puts the error in `action.error`, not `action.payload`. This means WP and PaymentTransactions `errorMessage` will always be `undefined` on rejection unless the thunk explicitly calls `rejectWithValue({ errorMessage: ... })`. When replicating, use `action.error.message` consistently or adopt `rejectWithValue`.

### Pattern C — derived status (Charger, Eves)

Both `charger.statusCharger` and `eves.statusEve` are derived computed fields, not raw API values. They apply the following logic on `fulfilled`:

```
if (no updatedAt)                    → "OFFLINE"
if (minutesSinceLastCheck > 10)      → "OFFLINE"
// Charger only:
if (connectorStatus === "Preparing" || "Available") → "ONLINE"
else                                 → "OFFLINE"
// Eve:
else                                 → "ONLINE"
```
