Spec written to `/Users/manu/_CODE/ENERGICA/_CODE/energica_payments/docs/ai-specs/specs/09-receipt-rejection-pages.md`.

---

**Summary of what the spec covers:**

**sessionStorage contract**

Both pages share the key `"paymentData"` written as `{ email: string }`. There are two producers: `Return` (Webpay) and `ReturnMP` (MercadoPago). Both write the key immediately before calling `navigate(..., { replace: true })`. The `sessionStorage.removeItem` call in Recibo-pago is commented out, so the key persists across refreshes.

**Recibo-pago (/recibo-pago)**

Component tree: `Main → Layout (Logo + children) → [hasData branch] SvgSuccess + conditional email paragraph + Button, or [no-data branch] inline SVG + "No se encontraron datos"`. No transaction details (amount, order, card) are displayed — only the customer email if truthy. Reads sessionStorage in a `useEffect` on mount; never clears it.

**Rechazo-pago (/rechazo-pago)**

Component tree: `Main → Layout (Logo + children) → SvgFailed + Button`. Has no conditional branching and does not read sessionStorage. Renders identically regardless of how the user arrived (direct URL access, MercadoPago failure, Webpay rejection).

**Visual components**

- `SvgSuccess`: 143×143 SVG, green checkmark circle, `<h2>Pago Realizado</h2>`. No props.
- `SvgFailed`: 143×143 SVG, red X circle, `<h2>Error en el pago</h2>` + `<span>La transacción fue rechazada</span>`. No props.

**Dead code identified**

Five files in Rechazo-pago's `components/` folder are unused: `FormStep01.tsx`, `HeaderTitle.tsx`, `NavigationBar.tsx`, `SentEmail.tsx`, and `SvgSuccess.tsx`. Both pages also have unused `lodash` imports and an unused `const email = "lal@lal.cl"` variable. `NavigationBar` exists in both page folders but is mounted in neither.

**SentEmail (dead but specified)**

Located in `Rechazo-pago/components/SentEmail.tsx`. Accepts a `data` prop and fires an EmailJS send on first render using service `service_ucb8wga` / template `template_rbmzu0w`. Uses a different EmailJS configuration than the Return page. The visible confirmation `<span>` is never actually shown because `isSaved` flips back to `false` before the async send resolves.

**Edge cases documented**

- Direct URL navigation to either page without prior payment flow.
- Browser refresh behavior (sessionStorage persists; Recibo-pago re-shows same state).
- Back-button behavior (both producers use `replace: true`).
- Empty email handling (email paragraph suppressed when `email` is falsy).
- Stale sessionStorage from a previous session can leak into a new Recibo-pago visit.
