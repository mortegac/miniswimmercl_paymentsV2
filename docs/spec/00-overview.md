# 00-overview.md — Miniswimmer: Project Replication Specification

## 1. Project Purpose

Miniswimmer is a **public-facing React SPA** that enables EV charger payment processing in Chile. It provides a guided wizard for end-users to pay for charging sessions via two payment gateways:

- **Transbank Webpay Plus** — Chilean bank-card gateway (primary, production)
- **MercadoPago** — Latin American digital payments (actively being integrated, branch `feat/mercadopago-integration`)

There is **no authentication layer** — the entire app is public. Users arrive via QR codes or direct URLs embedded in EV charger hardware or the Energica mobile app. The app communicates with an AWS AppSync GraphQL backend (Amplify Gen 2) for charger state lookups, pricing, transaction commits, and status polling.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (SPA)                         │
│                                                          │
│  React 18 + TypeScript 5.3 + Vite 5                     │
│  Redux Toolkit 2 (state)                                 │
│  React Router 6 (client-side routing)                    │
│  Tailwind CSS 3 (styling)                                │
│                                                          │
│  Pages:                                                  │
│  /          → Payment wizard (EVE / OCPP / JWT flows)    │
│  /return    → Webpay Plus callback handler               │
│  /return-mp → MercadoPago callback handler               │
│  /recibo-pago   → Payment receipt (approved)             │
│  /rechazo-pago  → Payment rejection                      │
│  /500       → Data error page                            │
└────────────────────┬────────────────────────────────────┘
                     │ GraphQL over HTTPS (API Key auth)
                     ▼
┌─────────────────────────────────────────────────────────┐
│            AWS Amplify Gen 2 Backend                     │
│                                                          │
│  AppSync (GraphQL API)                                   │
│  Authorization: API Key (expires every 30 days)          │
│                                                          │
│  Schemas:                                                │
│  - FAQSchema          (FAQ content)                      │
│  - ParameterSchema    (configurable parameters)          │
│  - ResumeDashboardSchema (dashboard summaries)           │
│  - main.schema.ts     (core models — imported as types)  │
│                                                          │
│  Two configs:                                            │
│  amplify_outputs.json      ← PROD                        │
│  amplify_outputs_dev.json  ← DEV (default)               │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   AWS DynamoDB           External APIs
   (AppSync resolvers)    - Transbank Webpay Plus
                          - MercadoPago
                          - EmailJS (browser-side email)
```

**Deployment Targets:**

```
Vercel (frontend SPA)     ←── vite build → dist/
AWS Amplify Gen 2         ←── amplify push (energica-prod account ONLY)
```

---

## 3. Tech Stack — Exact Versions

### Runtime Dependencies (`dependencies`)

| Package | Version |
|---|---|
| `react` | `^18.2.0` |
| `react-dom` | `^18.2.0` |
| `react-router-dom` | `^6.21.1` |
| `react-redux` | `^9.0.4` |
| `react-transition-group` | `^4.4.5` |
| `@reduxjs/toolkit` | `^2.2.3` |
| `aws-amplify` | `^6.0.9` |
| `@headlessui/react` | `^1.7.18` |
| `emailjs-com` | `^3.2.0` |
| `jose` | `^5.9.6` |
| `date-fns` | `^3.6.0` |
| `date-fns-tz` | `^3.1.3` |
| `dayjs` | `^1.11.10` |
| `flat` | `^6.0.1` |
| `lucide` | `^0.304.0` |
| `lucide-react` | `^0.307.0` |
| `simplebar` | `^6.0.0` |
| `tippy.js` | `^6.3.7` |

### Dev Dependencies (`devDependencies`)

| Package | Version |
|---|---|
| `typescript` | `^5.3.3` |
| `vite` | `^5.0.11` |
| `@vitejs/plugin-react` | `^4.2.1` |
| `vite-plugin-svgr` | `^4.2.0` |
| `tailwindcss` | `^3.4.1` |
| `@tailwindcss/forms` | `^0.5.7` |
| `tailwind-merge` | `^2.2.0` |
| `clsx` | `^2.1.0` |
| `autoprefixer` | `^10.4.16` |
| `postcss` | `^8.4.33` |
| `postcss-import` | `^16.0.0` |
| `postcss-nesting` | `^12.0.2` |
| `postcss-advanced-variables` | `^3.0.1` |
| `@aws-amplify/backend` | `^1.16.1` |
| `lodash` | `^4.17.21` |
| `@types/lodash` | `^4.14.202` |
| `@types/node` | `^20.10.6` |
| `@types/react` | `^18.2.47` |
| `@types/react-dom` | `^18.2.18` |
| `@types/react-transition-group` | `^4.4.10` |
| `@types/dropzone` | `^5.7.8` |

---

## 4. Entry Points

### `src/main.tsx`

The application bootstrap. Responsibilities:
- Creates the React root on `document.getElementById("root")`
- Wraps the tree in `React.StrictMode`
- Renders a `AMBIENTE DE DESARROLLO` red banner when `isDevelopment()` returns true
- Provides `BrowserRouter`, `ErrorBoundary`, Redux `Provider`, and `Suspense` (fallback: `<Splash />`)
- Mounts `<Router />` and `<ScrollToTop />`
- Imports `src/assets/css/app.css` (global styles entry point)

### `src/init.ts`

The typed Amplify client singleton. Responsibilities:
- Calls `configureAmplify()` from `@utils/amplify-config` (selects correct `amplify_outputs` file)
- Exports `client = generateClient<MainTypes>()` — the typed AppSync client used across all domain services
- Aliased as `@client` throughout the codebase

---

## 5. AWS Amplify Gen 2 Backend Overview

### Configuration selection (`src/utils/amplify-config.ts`)

```
VITE_ENVIRONMENT === 'PROD'  →  amplify_outputs.json       (production AppSync)
VITE_ENVIRONMENT !== 'PROD'  →  amplify_outputs_dev.json   (development AppSync)
```

Exports:
- `configureAmplify()` — calls `Amplify.configure()` with selected outputs; called once in `src/init.ts`
- `getAmplifyConfig()` — returns the raw outputs object
- `isProduction()` — `VITE_ENVIRONMENT === 'PROD'`
- `isDevelopment()` — `!isProduction()`
- `amplifyConfig` — singleton result of `configureAmplify()` (side-effect on import)

### Data layer (`amplify/data/resource.ts`)

- Uses `defineData` from `@aws-amplify/backend`
- Authorization: `defaultAuthorizationMode: "apiKey"`, key expires every 30 days
- Active schemas composed into the definition:
  - `FAQSchema` (`amplify/data/faq.schema.ts`)
  - `ParameterSchema` (`amplify/data/parameter.schema.ts`)
  - `ResumeDashboardSchema` (`amplify/data/resume.schema.ts`)
- `main.schema.ts` exists and exports types, but `MainSchema` is commented out of the active schema definition (used for types only)
- All schema types are re-exported via `export type * from "./xxx.schema"` for use under the `@types` alias

### GraphQL artifacts (`amplify/graphql/`)

- `API.ts` — Amplify-generated TypeScript types
- `queries.ts`, `mutations.ts`, `subscriptions.ts` — generated GraphQL operation strings
- `amplify/util/queries.ts` — reusable query strings (aliased as `@queries`)

---

## 6. Environment Variables

| Variable | Accepted Values | Default | Effect |
|---|---|---|---|
| `VITE_ENVIRONMENT` | `PROD` / (any other value or unset) | `DEV` | `PROD` selects `amplify_outputs.json`; anything else selects `amplify_outputs_dev.json` |
| `VITE_LOG_LEVEL` | `0`, `1`, `2`, `3` | `3` | Logger verbosity: `0` = NONE, `1` = ERROR, `2` = WARN, `3` = INFO (also accepts `VITE_LOG_LEVEL` read via `getEnvVar('LOG_LEVEL', '3')`) |

**Note:** The logger reads `VITE_LOG_LEVEL` via the Vite `import.meta.env` mechanism. Values outside `0–3` fall back to INFO (3).

---

## 7. Build / Dev Commands

Defined in `package.json` `scripts`:

```bash
npm run dev       # Vite dev server — default port 5173 (hot module replacement)
npm run build     # tsc && vite build — TypeScript check then production bundle → dist/
npm run preview   # vite preview — serves the dist/ folder locally
```

No test runner is configured. TypeScript errors surface only at build time via `tsc`.

---

## 8. Path Aliases

Configured in both `vite.config.ts` (runtime) and `tsconfig.json` `paths` (type-checking):

| Alias | Resolves to | Purpose |
|---|---|---|
| `@/*` | `./src/*` | Absolute imports from the src directory |
| `@client` | `./src/init.ts` | Typed Amplify client singleton |
| `@utils` / `@utils/*` | `./src/utils/` | Shared utility functions |
| `@types` | `./amplify/data/resource` | Amplify schema-generated TypeScript types |
| `@queries` | `./amplify/util/queries` | Reusable GraphQL query strings |
| `@log` | `./src/utils/log.ts` | Logger singleton (never use `console.log` directly) |
| `@error` | `./src/utils/error.ts` | Error handling utilities |
| `tailwind-config` | `./tailwind.config.js` | Tailwind config (included in Vite `optimizeDeps`) |

Additionally in `vite.config.ts`:
- `build.commonjsOptions.include`: `["tailwind.config.js", "node_modules/**"]`
- `optimizeDeps.include`: `["tailwind-config", "simplebar"]`
- SVGs are handled by `vite-plugin-svgr` with `exportType: "default"`, `ref: true`, `svgo: false`, `titleProp: true`
- `define: { global: 'globalThis' }` — polyfill for CJS libs that reference `global`

---

## 9. Deployment Targets

### Vercel (frontend)

- Config file: `vercel.json`
- Single rewrite rule: `{ "source": "/(.*)", "destination": "/" }` — redirects all paths to `index.html` for client-side routing
- Triggered by: `npm run build` → `dist/` folder deployed to Vercel

### AWS Amplify Gen 2 (backend)

- **Account:** `energica-prod` AWS account ONLY. Verify before any deployment:
  ```bash
  aws sts get-caller-identity --profile energica-prod
  ```
- Deployment commands: `amplify push` or `npx ampx pipeline-deploy`
- Config outputs written to `amplify_outputs.json` (prod) and `amplify_outputs_dev.json` (dev)
- A third file `amplify_outputs_main.json` exists at the root (likely a snapshot/backup)

---

## 10. Application Routes

Defined in `src/router/paths.tsx` and `src/router/PublicRoute.tsx`:

| Constant | Path | Page Component | Description |
|---|---|---|---|
| `PUBLIC` | `/` | `Payment` (lazy) | Payment wizard — EVE, OCPP, or JWT flow |
| `PUBLIC_TOKEN` | `/:t` | `Payment` (lazy) | Payment wizard with route token param |
| `PUBLIC_RETURN` | `/return` | `Return` | Webpay Plus callback handler |
| `PUBLIC_RETURN_TOKEN` | `/return:TBK_TOKEN` | `Return` | Webpay Plus TBK_TOKEN variant |
| `PUBLIC_INVOICE` | `/recibo-pago` | `ReciboPago` | Approved payment receipt |
| `PUBLIC_FAILED` | `/rechazo-pago` | `RechazoPago` | Rejected/failed payment |
| `PUBLIC_RETURN_MP` | `/return-mp` | `ReturnMP` | MercadoPago callback handler |
| — | `/500` | `ErrorDataPage` | Data error page |
| — | `*` | `ErrorPage` | 404 catch-all |

Only `Payment` is lazy-loaded; all other pages are eagerly imported.

---

## 11. Redux Store

Configured in `src/stores/store.ts` via `configureStore`. All reducer slices:

### Domain slices (business logic)

| Store Key | Directory | Purpose |
|---|---|---|
| `charger` | `stores/Charger/` | OCPP charging station state (stationId, connectorStatus) |
| `eves` | `stores/Eves/` | EVE device state (eveId, eveState) |
| `WP` | `stores/WP/` | Webpay Plus transaction state (transaction, commitData, statusData) |
| `paymentTransactions` | `stores/PaymentTransactions/` | Payment wizard state (step 0–7, typeOfCharger, pricing, duration) |
| `mercadoPago` | `stores/MercadoPago/` | MercadoPago preference and status state |

### UI slices

| Store Key | File | Purpose |
|---|---|---|
| `darkMode` | `darkModeSlice.ts` | Dark mode toggle |
| `colorScheme` | `colorSchemeSlice.ts` | Color scheme selection |
| `sideMenu` | `sideMenuSlice.ts` | Side menu state |
| `theme` | `themeSlice.ts` | Theme selection |
| `compactMenu` | `compactMenuSlice.ts` | Compact menu toggle |
| `pageLoader` | `pageLoaderSlice.ts` | Full-page loading state |

Each domain slice follows the three-file pattern: `types.ts` (types + empty defaults) / `services.ts` (pure async GraphQL calls) / `slice.ts` (thunks + createSlice). The MercadoPago domain also has a `mutations.ts` file for mutation strings.

---

## 12. MercadoPago Domain Types

The `MercadoPago` store (`stores/MercadoPago/types.ts`) defines:

- `MercadoPagoInput` — `amount`, `userId`, `glosa`, `idEve`, `stationId`, `chargingHours`, `typeOfCharger`
- `MercadoPagoStatusInput` — `paymentId`, `preferenceId`, `externalReference`, `mpStatus`
- `MercadoPagoPreference` — `preferenceId`, `initPoint`, `sandboxInitPoint`; default: `emptyPreference`
- `MercadoPagoStatusData` — `paymentId`, `status`, `statusDetail`, `amount`, `glosa`, `externalReference`, `payerEmail`, `paymentMethodId`, `dateApproved`; default: `emptyStatusData`

---

## 13. Logging System

`src/utils/log.ts` exports a singleton `logger` (`Logger` class):

```typescript
import { logger } from "@log";

logger.log("always visible — no level check");
logger.info("INFO level (≥3)");
logger.warn("WARN level (≥2)");
logger.error("ERROR level (≥1)");
```

Log levels:

| Value | Name | Methods visible |
|---|---|---|
| `0` | NONE | none |
| `1` | ERROR | `.error()` |
| `2` | WARN | `.error()`, `.warn()` |
| `3` | INFO (default) | `.error()`, `.warn()`, `.info()` |

`.log()` bypasses level checks and always outputs. Level is set from `VITE_LOG_LEVEL` at module init time.

---

## 14. Base Component Library (`src/components/Base/`)

Reusable project-level UI components. Always use these — do not create raw HTML equivalents:

| Component | Import path | Notes |
|---|---|---|
| `Button` | `@/components/Base/Button` | `variant` prop: `primary`, `soft-primary`, `outline-primary`, `danger`, `secondary`, etc. |
| `Form.*` | `@/components/Base/Form` | `FormInput`, `FormSelect`, `FormTextarea`, `FormCheck` |
| `Lucide` | `@/components/Base/Lucide` | `icon="IconName"` wrapper for lucide-react |
| `LoadingIcon` | `@/components/Base/LoadingIcon` | `icon="oval|three-dots|rings|..."` + `color="#hex"` |
| `Headless.*` | `@/components/Base/Headless` | Dialog, Disclosure, Menu, Popover, Slideover, Tab |
| `Tippy` | `@/components/Base/Tippy` | Tooltip: `content="text"` |
| `Table` | `@/components/Base/Table` | |
| `Pagination` | `@/components/Base/Pagination` | |
| `Splash` | `@/components/Base/Splash` | Suspense fallback |
| `ScrollToTop` | `@/components/Base/ScrollToTop` | |
| `Progress` | `@/components/Base/Progress` | |
| `FileIcon` | `@/components/Base/FileIcon` | |

---

## 15. File Structure Overview

```
energica_payments/
├── amplify/
│   ├── data/
│   │   ├── resource.ts          ← defineData: schema + API Key auth (30-day expiry)
│   │   ├── main.schema.ts       ← core models (types-only, schema commented out)
│   │   ├── parameter.schema.ts  ← parameter models
│   │   ├── faq.schema.ts        ← FAQ models
│   │   └── resume.schema.ts     ← dashboard summary models
│   ├── graphql/
│   │   ├── API.ts               ← generated TypeScript types
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   └── subscriptions.ts
│   └── util/
│       └── queries.ts           ← alias @queries (reusable query strings)
├── src/
│   ├── main.tsx                 ← app bootstrap, React root
│   ├── init.ts                  ← typed Amplify client (alias @client)
│   ├── ErrorBoundary.tsx        ← top-level React error boundary
│   ├── pages/
│   │   └── public/
│   │       ├── Payment/         ← / and /:t — payment wizard
│   │       ├── Return/          ← /return — Webpay Plus callback
│   │       ├── ReturnMP/        ← /return-mp — MercadoPago callback
│   │       ├── Recibo-pago/     ← /recibo-pago — approved receipt
│   │       ├── Rechazo-pago/    ← /rechazo-pago — rejected payment
│   │       ├── ErrorPage/       ← * catch-all 404
│   │       └── ErrorDataPage/   ← /500 data error
│   ├── stores/
│   │   ├── store.ts             ← configureStore (10 reducers)
│   │   ├── hooks.ts             ← useAppSelector, useAppDispatch
│   │   ├── Charger/             ← types.ts / services.ts / slice.ts
│   │   ├── Eves/                ← types.ts / services.ts / slice.ts
│   │   ├── WP/                  ← types.ts / services.ts / slice.ts
│   │   ├── PaymentTransactions/ ← types.ts / services.ts / slice.ts
│   │   ├── MercadoPago/         ← types.ts / services.ts / slice.ts / mutations.ts
│   │   ├── darkModeSlice.ts
│   │   ├── colorSchemeSlice.ts
│   │   ├── sideMenuSlice.ts
│   │   ├── themeSlice.ts
│   │   ├── compactMenuSlice.ts
│   │   └── pageLoaderSlice.ts
│   ├── components/
│   │   └── Base/
│   │       ├── Button/
│   │       ├── Form/
│   │       ├── Headless/        ← Dialog, Disclosure, Menu, Popover, Slideover, Tab
│   │       ├── LoadingIcon/
│   │       ├── Lucide/
│   │       ├── Pagination/
│   │       ├── Progress/
│   │       ├── ScrollToTop/
│   │       ├── Splash/
│   │       ├── Table/
│   │       ├── Tippy/
│   │       └── FileIcon/
│   ├── router/
│   │   ├── index.tsx            ← useRoutes with all routes + error routes
│   │   ├── paths.tsx            ← route string constants
│   │   ├── PublicRoute.tsx      ← publicRoutes definition
│   │   └── FullscreenComponent.tsx
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
│   │   │   ├── app.css          ← global styles entry point
│   │   │   ├── themes/echo.css  ← design tokens (--color-primary etc.)
│   │   │   └── components/      ← minimal custom CSS
│   │   └── images/
│   ├── types/                   ← global .d.ts declarations
│   ├── fakers/                  ← mock data for development
│   └── themes/Echo/             ← theme configuration
├── docs/
│   └── ai-specs/
│       ├── specs/               ← SDD spec files per feature
│       ├── skills/              ← AI skill definitions (enrich-user-story, write-pr-report)
│       └── .agents/             ← agent definitions (frontend-developer, backend-developer, etc.)
├── public/                      ← static assets served at /
├── amplify_outputs.json         ← Amplify config for production (energica-prod account)
├── amplify_outputs_dev.json     ← Amplify config for development
├── amplify_outputs_main.json    ← Snapshot/backup of main env outputs
├── vercel.json                  ← SPA rewrite rule (all → /)
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── postcss.config.cjs
├── package.json
├── CLAUDE.md                    ← AI coding instructions
└── DESIGN.md                    ← Design system source of truth
```

---

## 16. Key Conventions

- **Logging:** Always `import { logger } from "@log"`. Never `console.log` in production code.
- **State reads:** Always `useAppSelector` / `useAppDispatch` (never raw `useSelector` / `useDispatch`).
- **HTTP calls:** Always via the Amplify GraphQL client — never raw `fetch` or `axios`.
- **Styling:** Tailwind CSS 3 only. No `@mui/material`, no inline styles, no CSS modules. Always include `dark:` variants.
- **UI components:** Always use `@/components/Base/Button` — never raw `<button>` with Tailwind.
- **Thunk naming:** Read thunks: `getXxx`. Write thunks: `setXxx`. Selectors: `selectXxx`. Empty defaults: `emptyXxx`.
- **No spec, no code:** All implementation follows Spec-Driven Development. Check `docs/ai-specs/specs/` first.
- **AWS account:** All backend deployments use `energica-prod` account exclusively.
