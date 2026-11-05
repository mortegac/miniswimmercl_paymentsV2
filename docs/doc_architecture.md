# Architecture Guide — Energica Payments

## Purpose

This is the canonical architecture guide for AI agents and developers working in this repository.

Use it to decide:

1. where a new file belongs,
2. how to structure a module,
3. how the main runtime flows are organized,
4. which contracts and boundaries must not be broken.

---

## Technology stack

| Tool | Version | Role |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5.3 | Static typing |
| Vite | 5 | Build tool and dev server |
| AWS Amplify Gen 2 | 6 / `@aws-amplify/backend` 1.x | GraphQL backend (AppSync) |
| Redux Toolkit | 2 | Global state management |
| react-redux | 9 | React ↔ Redux binding |
| Tailwind CSS | 3 | Styling |
| tailwind-merge | 2 | Tailwind class composition |
| Headless UI | 1.7 | Accessible components (Dialog, Menu, etc.) |
| lucide-react | 0.307 | Icons |
| React Router | 6 | Client-side routing |
| emailjs-com | 3.2 | Browser-side email sending |
| jose | 5 | Client-side JWT decoding |
| date-fns / dayjs | 3 / 1.11 | Date handling |

---

## Project layout (source of truth)

```
energica_payments/
├── amplify/
│   ├── data/
│   │   ├── resource.ts          ← defineData: schema + auth config
│   │   ├── main.schema.ts       ← main data models
│   │   ├── parameter.schema.ts  ← parameter models
│   │   ├── faq.schema.ts
│   │   └── resume.schema.ts
│   ├── graphql/
│   │   ├── API.ts               ← Amplify-generated types
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   └── subscriptions.ts
│   └── util/
│       ├── queries.ts           ← alias @queries
│       └── log.ts
├── src/
│   ├── init.ts                  ← typed Amplify client (alias @client)
│   ├── ErrorBoundary.tsx
│   ├── pages/
│   │   └── public/
│   │       ├── Payment/         ← root route /
│   │       ├── Return/          ← route /return (Webpay callback)
│   │       ├── Recibo-pago/     ← route /recibo-pago (payment receipt)
│   │       └── Rechazo-pago/    ← route /rechazo-pago (payment rejection)
│   ├── stores/
│   │   ├── store.ts             ← configureStore with all reducers
│   │   ├── hooks.ts             ← useAppSelector, useAppDispatch
│   │   ├── Charger/             ← domain: OCPP charging station
│   │   ├── Eves/                ← domain: EVE device
│   │   ├── WP/                  ← domain: Webpay Plus
│   │   ├── PaymentTransactions/ ← domain: payment flow (step, pricing, duration)
│   │   ├── darkModeSlice.ts
│   │   ├── colorSchemeSlice.ts
│   │   ├── sideMenuSlice.ts
│   │   ├── themeSlice.ts
│   │   ├── compactMenuSlice.ts
│   │   └── pageLoaderSlice.ts
│   ├── components/
│   │   └── Base/                ← 26 reusable UI components
│   │       ├── Button/
│   │       ├── Form/
│   │       ├── Lucide/
│   │       ├── LoadingIcon/
│   │       ├── Headless/        ← Dialog, Disclosure, Menu, Popover, Slideover, Tab
│   │       ├── Tippy/
│   │       ├── Table/
│   │       ├── Pagination/
│   │       └── Splash/
│   ├── router/
│   │   ├── index.tsx            ← useRoutes with all routes
│   │   ├── paths.tsx            ← route string constants (PUBLIC, PUBLIC_RETURN, etc.)
│   │   └── PublicRoute.tsx      ← public route definitions
│   ├── utils/
│   │   ├── amplify-config.ts    ← configureAmplify(), isProduction(), isDevelopment()
│   │   ├── log.ts               ← Logger singleton (alias @log)
│   │   ├── error.ts             ← alias @error
│   │   ├── moneyHandler.ts      ← formatCurrency()
│   │   ├── dateHandler.ts       ← FormatDate(), calculateAge(), dateConverter()
│   │   ├── helper.ts            ← 20+ utilities (cutText, timeAgo, etc.)
│   │   ├── config.ts            ← LIMIT_FILTER and other constants
│   │   └── callback-state.ts
│   ├── assets/
│   │   ├── css/
│   │   │   ├── app.css          ← styles entry point
│   │   │   ├── themes/echo.css  ← design tokens (--color-primary, etc.)
│   │   │   └── components/      ← minimal custom CSS classes
│   │   └── images/
│   ├── types/                   ← global .d.ts declarations
│   ├── fakers/                  ← mock data for development
│   └── themes/
│       └── Echo/                ← theme configuration
├── docs/
│   └── ai-specs/
│       ├── specs/               ← SDD specs per feature
│       ├── skills/              ← available AI skills
│       └── .agents/             ← agent definitions
├── public/                      ← static assets
├── amplify_outputs.json         ← Amplify config for production
├── amplify_outputs_dev.json     ← Amplify config for development
├── vite.config.ts
├── tailwind.config.js
└── CLAUDE.md
```

---

## Import aliases

Configured in `vite.config.ts`:

| Alias | Resolves to | Purpose |
|---|---|---|
| `@/*` | `src/*` | Absolute imports from src |
| `@client` | `src/init.ts` | Typed Amplify client |
| `@utils` | `src/utils/` | Shared utilities |
| `@types` | `amplify/data/resource` | Schema-generated types |
| `@queries` | `amplify/util/queries` | Reusable GraphQL queries |
| `@log` | `src/utils/log.ts` | Logger singleton |
| `@error` | `src/utils/error.ts` | Error handling |

---

## Layer responsibilities

### `stores/<Domain>/`

Owns all state logic and backend communication for a single domain.

**Three files per domain:**

**`type.ts`** — Types and constants:
- `type XxxInput` for function input parameters
- `interface XxxResponse` for GraphQL response shapes
- `type XxxData` for the Redux state shape
- `const emptyXxxData: XxxData` with default values — always required

**`services.ts`** — Data access:
- Pure async functions that make GraphQL calls
- `try/catch` that logs and re-throws (`throw error`)
- No business logic
- Uses the typed client (`@client`) for schema-defined models, or `generateClient()` for custom resolvers

**`slice.ts`** — State and orchestration:
- One `createAsyncThunk` per async operation
- `createSlice` with `pending/fulfilled/rejected` cases for each thunk
- `initialState` always includes `status: "idle" | "loading" | "failed"` and `errorMessage: string`
- One exported selector: `export const selectXxx = (state: RootState) => state.xxx`
- No presentation logic

### `pages/public/<PageName>/`

Contains one complete page and all its sub-components.

**`index.tsx`** — Main page component:
- Named function `Main` (not an arrow function)
- Reads URL parameters with `useLocation` + `URLSearchParams`
- Uses `useRef(false)` to run `useEffect` only once (prevents double execution in React StrictMode)
- Dispatches thunks to load data on mount
- Delegates rendering of each step/state to sub-components
- Does not contain complex inline business logic

**`components/<StepComponent>.tsx`** — Sub-components:
- Exported as named exports: `export const XxxComponent: React.FC<Props>`
- Props typed with `interface Props`
- Read Redux state with `useAppSelector`
- Dispatch actions with `useAppDispatch`
- Handle `status === "loading"` → show spinner, `status === "idle"` → show content

### `components/Base/`

Reusable project UI components. **Do not create new components here unless genuinely needed.**

Always use the existing ones:

- `Button` — `variant` prop: `primary`, `soft-primary`, `outline-primary`, `danger`, `secondary`, etc.
- `FormInput`, `FormSelect`, `FormTextarea`, `FormCheck` — via `@/components/Base/Form`
- `Lucide` — `icon="IconName"` — wrapper for the lucide-react icon set
- `LoadingIcon` — `icon="oval|three-dots|rings|..."` + `color="#hex"`
- `Tippy` — simple tooltip with `content="text"`
- `Headless.*` — Dialog, Disclosure, Menu, Popover, Slideover, Tab (Headless UI)

### `router/`

- **`paths.tsx`**: string constants only. One constant per route: `export const PUBLIC_XXX = "/xxx"`
- **`PublicRoute.tsx`**: imports pages and defines `publicRoutes` as an object with a `children` array
- **`index.tsx`**: calls `useRoutes` with the `publicRoutes` object plus error routes

### `utils/`

Helper functions with no business logic or state.

- `formatCurrency(n: number): string` — CLP currency format with dot separators
- `logger.log/info/warn/error()` — always use instead of `console.log`
- `isProduction()` / `isDevelopment()` — derived from `VITE_ENVIRONMENT`
- Do not add domain logic here

### `amplify/data/`

- **`resource.ts`**: Amplify Data entry point. Defines schemas and authorization modes.
- **`*.schema.ts`**: data models with their relationships and permissions.
- Re-exports all types: `export type * from "./xxx.schema"`

---

## Main runtime flows

### EVE / OCPP payment flow (`/`)

```
URL /?id=EVExxxx  or  /?id=OCPPBExxxx
  └─► Payment/index.tsx
        ├─► detects charger type from id prefix
        ├─► dispatch(getEve)  or  dispatch(getCharger)
        ├─► useEffect → if statusEve/Charger !== "ONLINE" → setStep(5)
        └─► ChangeStep renders based on paymentTransactions.step:
              0 → CartNotExist
              1 → StepChargingHours  (hours + email form)
              3 → ResumePayment      (Webpay POST form)
              5 → EveOffline
```

### EMA JWT flow (`/?pay=<JWT>`)

```
URL /?pay=<JWT>
  └─► Payment/index.tsx → dispatch(setStep(3))  +  setJwt(payParam)
        └─► ResumePayment receives jwt prop
              └─► useEffect([jwt]) → jose.decodeJwt → setShoppingCart + setWPStart
                    └─► transaction.token populated → "Continue" button enabled
                          └─► user clicks → POST to transaction.url (Webpay)
```

### Webpay return flow (`/return`)

```
URL /return?token_ws=xxx  (or TBK_TOKEN, TBK_ORDEN_COMPRA, TBK_ID_SESION)
  └─► Return/index.tsx detects flow variant (1–4)
        ├─► dispatch(setWPCommit)  +  dispatch(setWPStatus)
        ├─► if AUTHORIZED → dispatch(getPaymentTransactions) → sendEmail
        └─► navigate("/recibo-pago")  or  navigate("/rechazo-pago")
```

---

## Environment variables

| Variable | Values | Effect |
|---|---|---|
| `VITE_ENVIRONMENT` | `PROD` / (unset) | Selects `amplify_outputs.json` or `amplify_outputs_dev.json` |
| `VITE_LOG_LEVEL` | `0`–`3` | Logger verbosity (0 = NONE, 3 = INFO) |

---

## Naming conventions

| Element | Convention | Example |
|---|---|---|
| React components | PascalCase | `StepChargingHours`, `NavigationBar` |
| Component files | PascalCase or folder/index | `Button/index.tsx` |
| Redux slice keys | camelCase in store | `charger`, `WP`, `paymentTransactions` |
| Store domain directories | PascalCase | `stores/Charger/`, `stores/WP/` |
| Read thunks | `getXxx` | `getEve`, `getCharger` |
| Write thunks | `setXxx` | `setWPStart`, `setCalculatePricing` |
| Selectors | `selectXxx` | `selectEve`, `selectWP` |
| Default-value constants | `emptyXxx` | `emptyCharger`, `emptyTransaction` |
| Route constants | `SCREAMING_SNAKE_CASE` | `PUBLIC_RETURN`, `PUBLIC_INVOICE` |
| Environment variables | `VITE_` prefix | `VITE_ENVIRONMENT` |

---

## File placement rules

When adding code, decide by intent:

1. **New route / page** → `src/pages/public/<PageName>/index.tsx` + constant in `router/paths.tsx` + entry in `router/PublicRoute.tsx`
2. **New state domain** → `src/stores/<Domain>/` (type.ts + services.ts + slice.ts) + reducer registered in `stores/store.ts`
3. **New GraphQL query or mutation** → in the `services.ts` of the relevant domain
4. **New data model** → `amplify/data/<name>.schema.ts` + import in `amplify/data/resource.ts`
5. **New reusable UI component** → `src/components/Base/<Name>/index.tsx`
6. **New generic utility** → `src/utils/<name>.ts`
7. **New configuration constant** → `src/utils/config.ts`

---

## Logging rules

**Never use `console.log` in production code.**

```typescript
import { logger } from "@log";
logger.log("always visible");
logger.info("INFO level");
logger.warn("WARN level");
logger.error("ERROR level");
```

Log level is controlled by `VITE_LOG_LEVEL` (0–3). Default: 3 (INFO).

---

## Anti-patterns — never introduce

- Business logic inside JSX components — move it to the slice or a standalone function
- `console.log` in non-temporary code — use `logger`
- Long relative import paths when an alias exists (`../../stores` → `@/stores`)
- Raw `useSelector` / `useDispatch` — use `useAppSelector` / `useAppDispatch`
- `axios` or `fetch` directly — use the Amplify GraphQL client
- Inline CSS or CSS module files — use Tailwind classes only
- React Bootstrap — this project uses Tailwind CSS + Base components
- Mutating Redux state outside `createSlice` — Redux Toolkit's Immer will catch this
- Untyped `any` without documented justification
- Hardcoded URLs or credentials — use `VITE_*` environment variables
- Reading `amplify_outputs.json` directly — use `amplify-config.ts`
