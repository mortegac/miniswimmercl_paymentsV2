# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (port 5173)
npm run build     # TypeScript check + Vite production build
npm run preview   # Preview production build locally
```

No test suite is configured. TypeScript type checking is part of the build step.

## Architecture

This is a **Webpay payment flow app** for Miniswimmer.cl — a Chilean swimming academy. It handles the complete Webpay Plus payment cycle: cart loading → payment initiation → gateway redirect → return/confirmation.

### Design System

When developing or modifying any UI component or page, **always read `DESIGN.md` first** and follow its tokens, components, and Do's/Don'ts exactly.

```bash
# Validate DESIGN.md tokens and contrast ratios
npx @google/design.md lint DESIGN.md
```

### Routes

| Path | Component | Purpose |
|---|---|---|
| `/` | `Payment` | Entry without token |
| `/:t` | `Payment` | Entry with JWT token |
| `/return` | `Return` | Transbank redirect handler |
| `/return:TBK_TOKEN` | `Return` | Transbank redirect with token param |
| `/recibo-pago` | `ReciboPago` | Payment success confirmation |
| `/rechazo-pago` | `RechazoPago` | Payment rejection page |
| `/500` | `ErrorDataPage` | Data error |
| `*` | `ErrorPage` | 404 |

`Return` is **not lazy-loaded** — it must be available immediately when Transbank redirects back. `Payment` is lazy-loaded via `React.lazy`.

### Payment Flow

1. User arrives at `/:t` where `t` is a JWT — `sub` field contains the `cartId`
2. App decodes JWT with `jose.decodeJwt`, fetches shopping cart from AppSync using `cartId`
3. Cart must have `status === "PENDING"` to show the payment form; otherwise `CartNotExist` renders
4. User submits form → dispatches `setWPStart({ amount, userId, glosa, cartId })` → calls `v2WebpayStart` mutation → receives `{ token, url, orden }`
5. User is redirected to Webpay external gateway (POST form submit to `url` with `token_ws`)
6. Transbank redirects back to `/return` — four possible flows based on query params:
   - **Flow 1** (`token_ws` present, no `TBK_TOKEN`): Normal completion → call `v2WebpayCommit` → check `status === "AUTHORIZED" && response_code === 0` → navigate to `/recibo-pago`
   - **Flow 2** (no tokens, `TBK_ORDEN_COMPRA` + `TBK_ID_SESION`): Timeout (>10 min on Transbank form) → navigate to `/rechazo-pago`
   - **Flow 3** (`TBK_TOKEN` present, no `token_ws`): User cancelled → call `v2WebpayStatus` to record state → navigate to `/rechazo-pago`
   - **Flow 4** (both tokens present): Invalid state → navigate to `/rechazo-pago`
7. On approval: EmailJS sends receipt email (fire-and-forget, does not block redirect); email is sent only once via `emailSentRef`
8. On rejection: retry logic runs up to `MAX_RETRIES = 3` times with `RETRY_DELAY = 20_000ms` between attempts before final redirect

### State Management (Redux Toolkit)

Feature slices in `src/stores/`:
- `ShoppingCart/` — cart data loaded from GraphQL; `ShoppingCart.userId` is the customer's **email** address
- `WP/` — Webpay transaction state: `transaction` (start result), `commitData`, `statusData`, `userEmail`, `glosa`

Each feature folder follows: `slice.ts` (async thunks + reducers) → `services.ts` (GraphQL calls) → `queries.ts` / `mutation.ts` (operation strings) → `types.ts`.

Use typed hooks from `src/stores/hooks.ts` (`useAppDispatch`, `useAppSelector`).

### Backend Integration

AWS Amplify v6 with AppSync GraphQL. Config loaded from `amplify_outputs.json` via `Amplify.configure(outputs)` in `src/main.tsx`. All GraphQL operations use `authMode: "apiKey"`.

In production (`window.location.hostname !== "localhost"`), Amplify uses `CookieStorage` scoped to `pagos.miniswimmer.cl`. On localhost this is skipped to avoid interfering with the Cognito SRP flow.

`generateClient()` from `aws-amplify/api` is called once per service file at module level.

### Routing

Route path constants live in `src/router/paths.tsx`. Route definitions in `src/router/PublicRoute.tsx`. Router assembled in `src/router/index.tsx`.

### Styling

Tailwind CSS with class-based dark mode. Custom color theme uses CSS variables (`--color-primary`, etc.) defined in `src/assets/css/app.css`. Path alias `@` maps to `src/`.

### Redux Store Pattern

1. `queries.ts` / `mutation.ts` — raw GraphQL strings
2. `services.ts` — calls `generateClient().graphql(...)`, returns typed data
3. `slice.ts` — `createAsyncThunk` wraps the service; slice handles `pending`/`fulfilled`/`rejected`

**Note:** newer stores use `mutations.ts` (plural) instead of `mutation.ts`. This inconsistency exists in the codebase — follow the existing file name in the store you're editing.

`PaymentTransactions/` store exists but is **not used** in the current payment flow — its queries are commented out and the data it returned was superseded by the commit response in Flow 1.

`src/stores/` also contains legacy UI slices (`darkModeSlice`, `themeSlice`, `sideMenuSlice`, `compactMenuSlice`, `pageLoaderSlice`, `colorSchemeSlice`) inherited from the base template. They are wired into the Redux store but not consumed by any payment flow component — do not remove them as they're referenced by `store.ts`.

### Cross-page state: sessionStorage

`Return` → `ReciboPago` handoff uses `sessionStorage` (not Redux):
- On approval, `Return` writes `sessionStorage.setItem("paymentData", JSON.stringify({ email: userEmail }))`
- `ReciboPago` reads it on mount and shows `hasData: true` with the customer email

If `sessionStorage` is empty (direct navigation to `/recibo-pago`), `ReciboPago` renders a "no transaction data" fallback.

### Return component internal state machine

`resTransaction.step` tracks the outcome inside `Return/index.tsx`:

| step | meaning |
|---|---|
| 0 | initial / not yet processed |
| 1 | approved (`AUTHORIZED` + `response_code === 0`) |
| 2 | Transbank confirmed rejection (commit returned non-zero response) |
| 3 | timeout (Flow 2 — `TBK_ORDEN_COMPRA` + `TBK_ID_SESION` present) |
| 4 | user cancelled (Flow 3 — `TBK_TOKEN` only) |
| 5 | invalid/error state |

Steps 1, 2, 3, 4 suppress the retry loop. Step 5 (and any unhandled error) triggers up to `MAX_RETRIES = 3` retries with `RETRY_DELAY = 20_000ms` between attempts.

### AWS CLI Profile

> **CRITICAL:** Always use profile `MINISWIMMER-05FEB2026` for every AWS CLI command. Never run AWS CLI commands without this profile.

```bash
aws <command> --profile MINISWIMMER-05FEB2026
```

### AppSync GraphQL API — Endpoint Canónico

> **CRITICAL — ÚNICO ENDPOINT VÁLIDO PARA LOS 3 PROYECTOS**
>
> Los 3 proyectos Miniswimmer (Pagos, Backend, Backoffice) comparten el mismo endpoint AppSync.
> **NUNCA** usar ningún otro endpoint. Los archivos `aws-exports.ts` y `aws-exports.js` que existen
> en el proyecto son **código muerto** (no importados en ningún archivo) con endpoints legacy obsoletos — ignorarlos.

| Campo | Valor |
|---|---|
| **GraphQL URL** | `https://vibghdaimbgfnlypijdjpufbgu.appsync-api.us-east-2.amazonaws.com/graphql` |
| **API Key** | `da2-y5mbqnzliraotj2zgojiatx34a` |
| **Región** | `us-east-2` |
| **Auth mode** | `apiKey` (este proyecto no usa Cognito para auth) |
| **Fuente de verdad** | `amplify_outputs.json` → campo `data.url` |

```bash
# Verificar que amplify_outputs.json usa el endpoint correcto
grep "url" amplify_outputs.json
# Debe mostrar: vibghdaimbgfnlypijdjpufbgu.appsync-api.us-east-2.amazonaws.com/graphql
```

**Endpoints legacy a ignorar (código muerto):**
- `src/aws-exports.ts` → endpoint `4mtfzd2aubcrhnnaclzkxosnoq` — NO USAR
- `src/aws-exports.js` → endpoint `m2hmnszh4je2rk3mdemcrudxw4` — NO USAR

### AWS Cognito User Pools

> **CRITICAL — LEER ANTES DE CUALQUIER OPERACIÓN EN COGNITO**
>
> - **NUNCA** modificar, crear usuarios, ni hacer ningún cambio en el pool `us-east-2_RnbT7nPr9`.
>   Es el pool de clientes de pago legacy (11 usuarios reales) y cualquier cambio puede romper flujos de pago en producción.
> - **SIEMPRE** usar el pool `us-east-2_SAkrMOGEN` para todas las operaciones. Es el pool activo referenciado en `amplify_outputs.json`.

Todos los proyectos Miniswimmer comparten el mismo backend Amplify Gen 2. Región: `us-east-2`.

| Pool | ID | Client ID | Estado |
|---|---|---|---|
| **✅ USAR SIEMPRE** | `us-east-2_SAkrMOGEN` | `7ffvh1vqfmqhl36pjv3ugdsfg6` | Producción activa — referenciado en `amplify_outputs.json` |
| **⚠️ Solo lectura** | `us-east-2_xtGftFnff` | `6o3gk8krb9m6jb0kqkrrj86u77` | Deploy anterior — usuarios admin (`hola@miniswimmer.cl`, `hi@manuelo.dev`) |
| **🚫 NUNCA TOCAR** | `us-east-2_RnbT7nPr9` | — | Pool legacy de clientes de pago. 11 usuarios reales. Solo lectura. |
| **Dev (vacío)** | `us-east-2_g5cMGeymr` | — | Pool de desarrollo del frontend. Sin usuarios. |

> Este proyecto (pagos) usa `authMode: "apiKey"` — los usuarios no se autentican con Cognito directamente.

```bash
# Listar usuarios del pool activo
aws cognito-idp list-users --user-pool-id us-east-2_SAkrMOGEN --profile MINISWIMMER-05FEB2026

# Cambiar contraseña de un usuario
aws cognito-idp admin-set-user-password \
  --user-pool-id us-east-2_SAkrMOGEN \
  --username <sub-del-usuario> \
  --password '<nueva-contraseña>' \
  --permanent \
  --profile MINISWIMMER-05FEB2026
```

## Proyectos Relacionados

Todos los proyectos comparten el mismo backend Amplify Gen 2 y el pool Cognito `us-east-2_SAkrMOGEN`.

| Proyecto | Ruta local | CLAUDE.md |
|---|---|---|
| **Pagos (este proyecto)** | `/Users/manu/_CODE/MINISWIMMER.us/_CODE/miniswimmercl_paymentsV2` | `CLAUDE.md` |
| **Backend (Amplify Gen 2)** | `/Users/manu/_CODE/MINISWIMMER.us/_CODE/miniswimmercl-sdk-backend-v2` | `CLAUDE.md` |
| **Frontend (backoffice)** | `/Users/manu/_CODE/MINISWIMMER.us/_CODE/miniswimmercl-sdk-frontend-v2` | `CLAUDE.md` |

### amplify_outputs.json (compartido entre proyectos)

Los 3 proyectos usan el mismo `amplify_outputs.json`. Si el backend se redespliega, copiar el nuevo archivo a los otros dos proyectos.

```bash
# Después de un redeploy del backend, actualizar los otros proyectos:
cp /Users/manu/_CODE/MINISWIMMER.us/_CODE/miniswimmercl-sdk-backend-v2/amplify_outputs.json \
   /Users/manu/_CODE/MINISWIMMER.us/_CODE/miniswimmercl-sdk-frontend-v2/amplify_outputs.json

cp /Users/manu/_CODE/MINISWIMMER.us/_CODE/miniswimmercl-sdk-backend-v2/amplify_outputs.json \
   /Users/manu/_CODE/MINISWIMMER.us/_CODE/miniswimmercl_paymentsV2/amplify_outputs.json
```

## CRITICAL

> **NEVER push to `https://github.com/mortegac/miniswimmercl_payments.git`**
> This is the wrong remote. Any `git push` to that repository is forbidden.
> Always verify the remote URL before pushing. The correct remote for this project must be confirmed with the user.

- Think before acting. Read files before writing code.
- Edit only the changes; do not rewrite entire files.
- Do not re-read files you have already read unless they have changed.
- Do not repeat unchanged code in your responses.
- No preambles, no summaries at the end, and do not explain the obvious.
- Test before completing the task.
